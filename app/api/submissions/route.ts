import { NextResponse } from "next/server"
import { isValidPhoneNumber, formatPhoneForStorage } from "@/lib/phone"
import { buildReport } from "@/lib/scoring"
import { saveSubmission, getAllSubmissions } from "@/lib/db"
import type { LevelId } from "@/lib/questions"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone, level, answers } = body

    if (!phone || typeof phone !== "string" || !isValidPhoneNumber(phone)) {
      return NextResponse.json(
        { error: "شماره همراه وارد شده معتبر نیست. فرمت صحیح: ۰۹۱۲۳۴۵۶۷۸۹" },
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

export async function GET() {
  try {
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
