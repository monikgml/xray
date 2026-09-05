import crypto from "crypto"
import { normalizeDigits, normalizeToNationalFormat, normalizeToE164 } from "@/lib/phone"

export interface OtpConfig {
  baseUrl: string
  authorizationToken: string
  fromNumber: string
  patternCode: string
  codeParameterName: string
  codeLength: number
  codeExpirationMinutes: number
  resendCooldownSeconds: number
  maxVerificationAttempts: number
  maxSendPerHour: number
}

const DEFAULT_CONFIG: OtpConfig = {
  baseUrl: process.env.IPPANEL_BASE_URL || "https://edge.ippanel.com/v1",
  authorizationToken: process.env.IPPANEL_API_KEY || "",
  fromNumber: process.env.IPPANEL_FROM_NUMBER || "+983000505",
  patternCode: process.env.IPPANEL_PATTERN_CODE || "fh24clmdnsoevbe",
  codeParameterName: process.env.IPPANEL_CODE_PARAM || "verifycode",
  codeLength: 6,
  codeExpirationMinutes: 5,
  resendCooldownSeconds: 60,
  maxVerificationAttempts: 5,
  maxSendPerHour: 5,
}

interface PhoneVerificationEntry {
  code: string
  expiresAt: number
  lastSentAt: number
  firstSentAt: number
  failedAttempts: number
  sendCount: number
  verifiedAt?: number
}

// In-memory store for OTP verification entries
const verificationStore = new Map<string, PhoneVerificationEntry>()

/**
 * Generates a cryptographically secure numeric OTP of the specified length.
 */
export function generateVerificationCode(length: number = 6): string {
  const min = Math.pow(10, length - 1)
  const max = Math.pow(10, length) - 1
  return crypto.randomInt(min, max + 1).toString()
}

export interface SendOtpResult {
  success: boolean
  message: string
  cooldownSeconds?: number
  isRateLimited?: boolean
}

/**
 * Sends a verification OTP code to the given Iranian phone number via IPPanel pattern API.
 */
export async function sendVerificationCode(
  phoneNumber: string,
  config: OtpConfig = DEFAULT_CONFIG
): Promise<SendOtpResult> {
  const national = normalizeToNationalFormat(phoneNumber)
  if (!national) {
    return {
      success: false,
      message: "شماره همراه وارد شده نامعتبر است. فرمت صحیح: ۰۹۱۲۳۴۵۶۷۸۹",
    }
  }

  const e164 = normalizeToE164(national)
  if (!e164) {
    return {
      success: false,
      message: "شماره همراه وارد شده نامعتبر است.",
    }
  }

  if (!config.authorizationToken) {
    console.error("IPPANEL_API_KEY is not configured in environment variables.")
    return {
      success: false,
      message: "سامانه پیامک در حال حاضر پیکربندی نشده است. لطفاً متغیر IPPANEL_API_KEY را در محیط تنظیم کنید.",
    }
  }

  const now = Date.now()
  const cooldownMs = config.resendCooldownSeconds * 1000
  const expirationMs = config.codeExpirationMinutes * 60 * 1000
  const existing = verificationStore.get(national)

  if (existing) {
    if (existing.expiresAt > now) {
      const remainingCooldown = existing.lastSentAt + cooldownMs - now
      if (remainingCooldown > 0) {
        const remainingSeconds = Math.ceil(remainingCooldown / 1000)
        return {
          success: false,
          message: `کد تایید اخیراً ارسال شده است. لطفاً ${remainingSeconds} ثانیه صبر کنید.`,
          cooldownSeconds: remainingSeconds,
          isRateLimited: true,
        }
      }

      // Check max sends per hour
      const oneHourMs = 60 * 60 * 1000
      if (existing.firstSentAt + oneHourMs > now && existing.sendCount >= config.maxSendPerHour) {
        return {
          success: false,
          message: "تعداد ارسال‌های مجاز در این ساعت به پایان رسیده است. لطفاً بعداً تلاش کنید.",
          isRateLimited: true,
        }
      }
    } else {
      verificationStore.delete(national)
    }
  }

  const verificationCode = generateVerificationCode(config.codeLength)

  // Dispatch SMS via IPPanel Edge API
  try {
    const payload = {
      sending_type: "pattern",
      from_number: config.fromNumber,
      code: config.patternCode,
      recipients: [e164],
      params: {
        [config.codeParameterName || "verifycode"]: verificationCode,
      },
    }

    const response = await fetch(`${config.baseUrl.replace(/\/+$/, "")}/api/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: config.authorizationToken,
      },
      body: JSON.stringify(payload),
    })

    const responseData = (await response.json().catch(() => null)) as {
      meta?: { status?: boolean; message?: string }
    } | null

    if (!response.ok || (responseData && responseData.meta && responseData.meta.status === false)) {
      console.error("IPPanel SMS API Error:", response.status, responseData)
      const providerMessage = responseData?.meta?.message || "خطا در ارسال پیامک از طریق سامانه."
      return {
        success: false,
        message: providerMessage,
      }
    }
  } catch (err: unknown) {
    console.error("Network error sending OTP SMS:", err)
    return {
      success: false,
      message: "خطا در برقراری ارتباط با سامانه پیامکی. لطفاً مجدداً تلاش کنید.",
    }
  }

  // Update entry in store
  const entry: PhoneVerificationEntry = existing
    ? {
        ...existing,
        code: verificationCode,
        expiresAt: now + expirationMs,
        lastSentAt: now,
        sendCount: existing.sendCount + 1,
        failedAttempts: 0,
        verifiedAt: undefined,
      }
    : {
        code: verificationCode,
        expiresAt: now + expirationMs,
        lastSentAt: now,
        firstSentAt: now,
        failedAttempts: 0,
        sendCount: 1,
      }

  verificationStore.set(national, entry)

  return {
    success: true,
    message: "کد تایید ۶ رقمی به شماره همراه شما ارسال شد.",
    cooldownSeconds: config.resendCooldownSeconds,
  }
}

export interface ValidateOtpResult {
  valid: boolean
  message?: string
}

/**
 * Validates the verification code entered by the user.
 */
export function validateVerificationCode(
  phoneNumber: string,
  inputCode: string,
  config: OtpConfig = DEFAULT_CONFIG
): ValidateOtpResult {
  const national = normalizeToNationalFormat(phoneNumber)
  if (!national) {
    return { valid: false, message: "شماره همراه وارد شده نامعتبر است." }
  }

  const cleanCode = normalizeDigits(inputCode || "").trim().replace(/\D/g, "")
  if (!cleanCode) {
    return { valid: false, message: "لطفاً کد تایید را وارد کنید." }
  }

  const entry = verificationStore.get(national)
  if (!entry) {
    return { valid: false, message: "کد تایید یافت نشد یا منقضی شده است. لطفاً مجدداً درخواست کد کنید." }
  }

  const now = Date.now()
  if (entry.expiresAt <= now) {
    verificationStore.delete(national)
    return { valid: false, message: "کد تایید منقضی شده است. لطفاً کد جدید دریافت کنید." }
  }

  if (entry.code !== cleanCode) {
    entry.failedAttempts += 1
    if (entry.failedAttempts >= config.maxVerificationAttempts) {
      verificationStore.delete(national)
      return {
        valid: false,
        message: "تعداد دفعات تلاش اشتباه بیش از حد مجاز بود. لطفاً کد جدید دریافت کنید.",
      }
    }
    return {
      valid: false,
      message: `کد تایید وارد شده نادرست است. (تلاش ${entry.failedAttempts} از ${config.maxVerificationAttempts})`,
    }
  }

  entry.verifiedAt = now
  return { valid: true }
}

/**
 * Checks if the phone number is currently verified.
 */
export function isPhoneVerified(phoneNumber: string): boolean {
  const national = normalizeToNationalFormat(phoneNumber)
  if (!national) return false
  const entry = verificationStore.get(national)
  return !!(entry && entry.verifiedAt && entry.expiresAt > Date.now())
}

/**
 * Removes the verification entry once confirmed and persisted.
 */
export function markPhoneConfirmed(phoneNumber: string): void {
  const national = normalizeToNationalFormat(phoneNumber)
  if (national) {
    verificationStore.delete(national)
  }
}

// For unit tests: helper to inject test codes without sending SMS
export function _setMockVerificationCode(phone: string, code: string, ttlMs: number = 300000) {
  const national = normalizeToNationalFormat(phone)
  const now = Date.now()
  verificationStore.set(national, {
    code,
    expiresAt: now + ttlMs,
    lastSentAt: now,
    firstSentAt: now,
    failedAttempts: 0,
    sendCount: 1,
  })
}

export function _clearVerificationStore() {
  verificationStore.clear()
}
