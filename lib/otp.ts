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

function cleanEnv(val: string | undefined, defaultVal: string = ""): string {
  if (!val) return defaultVal
  return val.trim().replace(/^["']|["']$/g, "")
}

const DEFAULT_CONFIG: OtpConfig = {
  baseUrl: cleanEnv(process.env.IPPANEL_BASE_URL, "https://api2.ippanel.com"),
  authorizationToken: cleanEnv(process.env.IPPANEL_API_KEY, ""),
  fromNumber: cleanEnv(process.env.IPPANEL_FROM_NUMBER, "+983000505"),
  patternCode: cleanEnv(process.env.IPPANEL_PATTERN_CODE, "fh24clmdnsoevbe"),
  codeParameterName: cleanEnv(process.env.IPPANEL_CODE_PARAM, "verifycode"),
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
 * Clean and format provider error messages so users never see raw HTML (502, 504, etc.)
 */
function sanitizeProviderErrorMessage(rawText: string, status: number): string {
  if (!rawText) return `خطای سامانه پیامک (${status})`
  if (
    rawText.includes("<!DOCTYPE") ||
    rawText.includes("<html") ||
    status === 502 ||
    status === 503 ||
    status === 504
  ) {
    return `خطای ارتباط با درگاه پیامک (کد ${status}): درگاه پیامکی در دسترس نیست.`
  }
  try {
    const json = JSON.parse(rawText)
    if (json.error_message) return json.error_message
    if (json.meta?.message) return json.meta.message
    if (json.message) return json.message
  } catch {}
  return `خطای سامانه پیامک (${status}): ${rawText.slice(0, 120)}`
}

/**
 * Dispatches the OTP SMS via IPPanel pattern endpoints.
 * First tries api2.ippanel.com (stable across international cloud hosts like Vercel).
 * Falls back to edge.ippanel.com or configured baseUrl if needed.
 */
async function dispatchSmsPattern(
  config: OtpConfig,
  e164Phone: string,
  verificationCode: string
): Promise<{ success: boolean; message?: string }> {
  const commonHeaders = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  }

  const errors: string[] = []
  const isCustomBase = config.baseUrl && !config.baseUrl.includes("ippanel.com")

  // 0. If a custom proxy baseUrl is set (e.g. https://sms.myrahbord.ir), try it first
  if (isCustomBase) {
    try {
      const customBase = config.baseUrl.replace(/\/+$/, "")
      const customUrl = customBase.includes("/api/send") || customBase.includes("/send")
        ? customBase
        : `${customBase}/v1/api/send`

      const edgePayload = {
        sending_type: "pattern",
        from_number: config.fromNumber,
        code: config.patternCode,
        recipients: [e164Phone],
        params: {
          [config.codeParameterName || "verifycode"]: verificationCode,
        },
      }

      const resCustom = await fetch(customUrl, {
        method: "POST",
        headers: {
          ...commonHeaders,
          Authorization: config.authorizationToken,
        },
        body: JSON.stringify(edgePayload),
        signal: AbortSignal.timeout(6000),
      })

      const rawCustom = await resCustom.text().catch(() => "")
      let jsonCustom: { meta?: { status?: boolean; message?: string } } | null = null
      try {
        jsonCustom = JSON.parse(rawCustom)
      } catch {}

      if (resCustom.ok && (!jsonCustom || jsonCustom.meta?.status !== false)) {
        return { success: true }
      }

      errors.push(`custom proxy (${resCustom.status})`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn("Custom proxy baseUrl request failed:", msg)
      errors.push(`custom proxy (${msg})`)
    }
  }

  // 1. Primary: api2.ippanel.com
  try {
    const api2Url = "https://api2.ippanel.com/api/v1/sms/pattern/normal/send"
    const api2Payload = {
      code: config.patternCode,
      sender: config.fromNumber,
      recipient: e164Phone,
      variable: {
        [config.codeParameterName || "verifycode"]: verificationCode,
      },
    }

    const res2 = await fetch(api2Url, {
      method: "POST",
      headers: {
        ...commonHeaders,
        apikey: config.authorizationToken,
      },
      body: JSON.stringify(api2Payload),
      signal: AbortSignal.timeout(6000),
    })

    const raw2 = await res2.text().catch(() => "")
    if (res2.ok) {
      try {
        const json2 = JSON.parse(raw2)
        if (json2.code === 200 || json2.status === "OK" || json2.data?.message_id) {
          return { success: true }
        }
        if (json2.error_message) {
          return { success: false, message: json2.error_message }
        }
      } catch {
        return { success: true }
      }
    }

    if (res2.status >= 400 && res2.status < 500) {
      console.error("IPPanel api2 client error:", res2.status, raw2)
      return { success: false, message: sanitizeProviderErrorMessage(raw2, res2.status) }
    }

    errors.push(`api2 (${res2.status})`)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn("IPPanel api2 request failed:", msg)
    errors.push(`api2 (${msg})`)
  }

  // 2. Fallback: Edge API
  try {
    const edgeBase = "https://edge.ippanel.com/v1"

    const edgePayload = {
      sending_type: "pattern",
      from_number: config.fromNumber,
      code: config.patternCode,
      recipients: [e164Phone],
      params: {
        [config.codeParameterName || "verifycode"]: verificationCode,
      },
    }

    const resEdge = await fetch(`${edgeBase}/api/send`, {
      method: "POST",
      headers: {
        ...commonHeaders,
        Authorization: config.authorizationToken,
      },
      body: JSON.stringify(edgePayload),
      signal: AbortSignal.timeout(6000),
    })

    const rawEdge = await resEdge.text().catch(() => "")
    let jsonEdge: { meta?: { status?: boolean; message?: string } } | null = null
    try {
      jsonEdge = JSON.parse(rawEdge)
    } catch {}

    if (!resEdge.ok || (jsonEdge && jsonEdge.meta && jsonEdge.meta.status === false)) {
      console.error("IPPanel Edge fallback error:", resEdge.status, rawEdge)
      errors.push(`edge (${resEdge.status})`)
      return {
        success: false,
        message: sanitizeProviderErrorMessage(rawEdge, resEdge.status),
      }
    }

    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("Network error sending OTP SMS via Edge fallback:", msg)
    errors.push(`edge (${msg})`)
    return {
      success: false,
      message: `خطا در ارتباط با سامانه پیامکی (${errors.join(", ")}). لطفاً مجدداً تلاش کنید.`,
    }
  }
}

/**
 * Generates a cryptographically secure numeric OTP of the specified length.
 */
export function generateVerificationCode(length: number = 6): string {
  const min = Math.pow(10, length - 1)
  const max = Math.pow(10, length) - 1
  return crypto.randomInt(min, max + 1).toString()
}

export interface ClientDispatchPayload {
  url: string
  headers: Record<string, string>
  body: Record<string, unknown>
}

export interface SendOtpResult {
  success: boolean
  message: string
  cooldownSeconds?: number
  isRateLimited?: boolean
  providerConfigured?: boolean
  clientDispatch?: boolean
  dispatchPayload?: ClientDispatchPayload
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
      message: "سامانه پیامک در حال حاضر پیکربندی نشده است. لطفاً متغیر IPPANEL_API_KEY را در تنظیمات Vercel وارد کنید.",
      providerConfigured: false,
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

  // Store verification entry securely on server
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

  // Try server-side direct dispatch first
  const dispatchResult = await dispatchSmsPattern(config, e164, verificationCode)

  if (dispatchResult.success) {
    return {
      success: true,
      message: "کد تایید ۶ رقمی به شماره همراه شما ارسال شد.",
      cooldownSeconds: config.resendCooldownSeconds,
    }
  }

  // Server direct dispatch failed (e.g. 502 Bad Gateway due to foreign cloud host).
  // Fall back to Client-Assisted Dispatch: the user's browser in Iran calls IPPanel Edge API directly with CORS.
  console.log("Server direct dispatch failed, activating client-assisted dispatch for:", national)
  return {
    success: true,
    clientDispatch: true,
    message: "کد تایید ۶ رقمی در حال ارسال است...",
    cooldownSeconds: config.resendCooldownSeconds,
    dispatchPayload: {
      url: "https://edge.ippanel.com/v1/api/send",
      headers: {
        "Content-Type": "application/json",
        Authorization: config.authorizationToken,
      },
      body: {
        sending_type: "pattern",
        from_number: config.fromNumber,
        code: config.patternCode,
        recipients: [e164],
        params: {
          [config.codeParameterName || "verifycode"]: verificationCode,
        },
      },
    },
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
