"use client"

import { useState } from "react"
import { isValidPhoneNumber } from "@/lib/phone"
import { Smartphone, ArrowLeft, ArrowRight, Loader2, AlertCircle } from "lucide-react"

export function PhoneForm({
  onSubmit,
  onBack,
  isSubmitting,
  apiError,
}: {
  onSubmit: (phone: string) => void
  onBack: () => void
  isSubmitting: boolean
  apiError?: string | null
}) {
  const [phone, setPhone] = useState("")
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!phone.trim()) {
      setError("لطفاً شماره همراه خود را وارد کنید.")
      return
    }

    if (!isValidPhoneNumber(phone)) {
      setError("شماره همراه وارد شده معتبر نیست. مثال: ۰۹۱۲۳۴۵۶۷۸۹")
      return
    }

    onSubmit(phone)
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-5 py-8">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Smartphone className="h-6 w-6" aria-hidden="true" />
        </div>

        <h1 className="mt-5 text-2xl font-bold text-foreground">
          آزمون با موفقیت انجام شد!
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          جهت ذخیرهٔ داده‌ها و مشاهدهٔ گزارش رادیولوژی سازمان، لطفاً شماره همراه خود را وارد کنید.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
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
              />
            </div>
            {(error || apiError) && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-risk font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                {error || apiError}
              </p>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
              بازگشت
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  در حال ثبت...
                </>
              ) : (
                <>
                  مشاهدهٔ نتیجه
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
