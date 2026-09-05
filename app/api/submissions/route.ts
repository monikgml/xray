import { NextResponse } from "next/server"
import { isValidPhoneNumber, formatPhoneForStorage } from "@/lib/phone"
import { buildReport } from "@/lib/scoring"
import { saveSubmission, getAllSubmissions } from "@/lib/db"
import { validateVerificationCode, markPhoneConfirmed } from "@/lib/otp"
import type { LevelId } from "@/lib/questions"

export async function POST(request: Request) {
  let body: { phone?: string; code?: string; level?: string; answers?: Record<string, number> } | null = null
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "داده‌های ارسالی نامعتبر است." },
      { status: 400 }
    )
  }

  try {
    const { phone, code, level, answers } = body || {}

    if (!phone || typeof phone !== "string" || !isValidPhoneNumber(phone)) {
      return NextResponse.json(
        { error: "شماره همراه وارد شده معتبر نیست. فرمت صحیح: ۰۹۱۲۳۴۵۶۷۸۹" },
        { status: 400 }
      )
    }

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "لطفاً کد تایید پیامک‌شده را وارد کنید." },
        { status: 400 }
      )
    }

    // Validate the OTP code
    const otpValidation = validateVerificationCode(phone, code)
    if (!otpValidation.valid) {
      return NextResponse.json(
        { error: otpValidation.message || "کد تایید وارد شده نامعتبر یا منقضی است." },
        { status: 400 }
      )
    }

    if (!level || !answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "اطلاعات آزمون کامل نیست." },
        { status: 400 }
      )
    }

    const formattedPhone = formatPhoneForStorage(phone)
    const report = buildReport(level as LevelId, answers)

    const saved = saveSubmission({
      phone: formattedPhone,
      level,
      overall: report.overall,
      band: report.band,
      answers,
      report,
    })

    // Remove active OTP session once successfully submitted
    markPhoneConfirmed(phone)

    return NextResponse.json({
      success: true,
      id: saved.id,
      created_at: saved.created_at,
      report,
    })
  } catch (err: unknown) {
    console.error("Error saving submission:", err)
    return NextResponse.json(
      { error: "خطایی در ثبت اطلاعات در دیتابیس رخ داد." },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const adminKey = process.env.ADMIN_ACCESS_KEY || "admin123"
    const authHeader = request.headers.get("x-admin-key")
    const { searchParams } = new URL(request.url)
    const queryKey = searchParams.get("key")

    if (authHeader !== adminKey && queryKey !== adminKey) {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز. کلید امنیتی مدیریت نامعتبر است." },
        { status: 401 }
      )
    }

    const submissions = getAllSubmissions()
    return NextResponse.json({ success: true, submissions })
  } catch (err: unknown) {
    console.error("Error fetching submissions:", err)
    return NextResponse.json(
      { error: "خطایی در دریافت اطلاعات رخ داد." },
      { status: 500 }
    )
  }
}
