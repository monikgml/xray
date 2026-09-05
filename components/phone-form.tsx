"use client"

import { useState, useEffect, useRef } from "react"
import { isValidPhoneNumber, normalizeDigits, normalizeToNationalFormat } from "@/lib/phone"
import { Smartphone, ArrowLeft, ArrowRight, Loader2, AlertCircle, CheckCircle2, RefreshCw, KeyRound, Edit2 } from "lucide-react"

export function PhoneForm({
  onSubmit,
  onBack,
  isSubmitting,
  apiError,
}: {
  onSubmit: (phone: string, code: string) => void
  onBack: () => void
  isSubmitting: boolean
  apiError?: string | null
}) {
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [otpSuccessMessage, setOtpSuccessMessage] = useState<string | null>(null)
  const codeInputRef = useRef<HTMLInputElement>(null)

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  // Focus code input when entering OTP step
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => codeInputRef.current?.focus(), 150)
    }
  }, [step])

  async function handleSendOtp() {
    setError(null)
    setOtpSuccessMessage(null)

    if (!phone.trim()) {
      setError("لطفاً شماره همراه خود را وارد کنید.")
      return
    }

    if (!isValidPhoneNumber(phone)) {
      setError("شماره همراه وارد شده معتبر نیست. مثال: ۰۹۱۲۳۴۵۶۷۸۹")
      return
    }

    setIsSendingOtp(true)
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message || "خطا در ارسال کد تایید. لطفاً مجدداً تلاش کنید.")
        if (data.cooldownSeconds) {
          setCooldown(data.cooldownSeconds)
        }
        return
      }

      setStep("otp")
      setCooldown(data.cooldownSeconds || 60)
      setOtpSuccessMessage(data.message || "کد تایید ۶ رقمی با موفقیت پیامک شد.")
    } catch {
      setError("خطا در ارتباط با سرور سامانه پیامک. لطفاً اتصال اینترنت خود را بررسی کنید.")
    } finally {
      setIsSendingOtp(false)
    }
  }

  function handleVerifyAndSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (step === "phone") {
      void handleSendOtp()
      return
    }

    const cleanCode = normalizeDigits(code).trim().replace(/\D/g, "")
    if (!cleanCode) {
      setError("لطفاً کد تایید ۶ رقمی را وارد کنید.")
      return
    }

    if (cleanCode.length !== 6) {
      setError("کد تایید باید ۶ رقم باشد.")
      return
    }

    onSubmit(phone, cleanCode)
  }

  const formattedNational = normalizeToNationalFormat(phone) || phone

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-5 py-8">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {step === "phone" ? (
              <Smartphone className="h-6 w-6" aria-hidden="true" />
            ) : (
              <KeyRound className="h-6 w-6" aria-hidden="true" />
            )}
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            {step === "phone" ? "مرحله ۱ از ۲" : "مرحله ۲ از ۲"}
          </span>
        </div>

        <h1 className="mt-5 text-2xl font-bold text-foreground">
          {step === "phone" ? "آزمون با موفقیت انجام شد!" : "تایید شماره همراه"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {step === "phone"
            ? "جهت ذخیرهٔ داده‌ها و مشاهدهٔ گزارش رادیولوژی سازمان، لطفاً شماره همراه خود را وارد نمایید."
            : `کد تایید ۶ رقمی پیامک‌شده به شماره ${formattedNational} را وارد نمایید.`}
        </p>

        {step === "otp" && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-muted/50 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">شماره همراه:</span>
              <span className="font-mono text-sm font-bold text-foreground" dir="ltr">
                {formattedNational}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setStep("phone")
                setCode("")
                setError(null)
                setOtpSuccessMessage(null)
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Edit2 className="h-3 w-3" />
              ویرایش شماره
            </button>
          </div>
        )}

        {otpSuccessMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary/10 p-3 text-xs font-medium text-primary">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{otpSuccessMessage}</span>
          </div>
        )}

        <form onSubmit={handleVerifyAndSubmit} className="mt-6 flex flex-col gap-4">
          {step === "phone" ? (
            <div>
              <label htmlFor="phone-input" className="block text-sm font-medium text-foreground">
                شماره همراه
              </label>
              <div className="relative mt-2">
                <input
                  id="phone-input"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    if (error) setError(null)
                  }}
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-left font-mono text-base text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  dir="ltr"
                  autoFocus
                  disabled={isSendingOtp}
                />
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="otp-input" className="block text-sm font-medium text-foreground">
                کد تایید ۶ رقمی
              </label>
              <div className="relative mt-2">
                <input
                  ref={codeInputRef}
                  id="otp-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => {
                    const cleaned = normalizeDigits(e.target.value).replace(/\D/g, "").slice(0, 6)
                    setCode(cleaned)
                    if (error) setError(null)
                  }}
                  placeholder="------"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-center font-mono text-2xl tracking-[0.5em] font-bold text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  dir="ltr"
                  disabled={isSubmitting}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                {cooldown > 0 ? (
                  <span className="text-muted-foreground font-mono">
                    ارسال مجدد کد تا {cooldown} ثانیه دیگر
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => void handleSendOtp()}
                    disabled={isSendingOtp}
                    className="inline-flex items-center gap-1 font-semibold text-primary hover:underline disabled:opacity-50"
                  >
                    <RefreshCw className="h-3 w-3" />
                    ارسال مجدد کد تایید
                  </button>
                )}
              </div>
            </div>
          )}

          {(error || apiError) && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-risk font-medium text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              {error || apiError}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={step === "otp" ? () => setStep("phone") : onBack}
              disabled={isSubmitting || isSendingOtp}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
              {step === "otp" ? "مرحله قبل" : "بازگشت"}
            </button>

            {step === "phone" ? (
              <button
                type="button"
                onClick={() => void handleSendOtp()}
                disabled={isSendingOtp || !phone.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    در حال ارسال کد...
                  </>
                ) : (
                  <>
                    ارسال کد تایید
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || code.length !== 6}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    در حال بررسی و ثبت...
                  </>
                ) : (
                  <>
                    تایید و مشاهده نتیجه
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
