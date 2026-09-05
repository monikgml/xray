import { NextResponse } from "next/server"
import { isValidPhoneNumber } from "@/lib/phone"
import { sendVerificationCode } from "@/lib/otp"

export async function POST(request: Request) {
  let body: { phone?: string } | null = null
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, message: "داده‌های ارسالی نامعتبر است." },
      { status: 400 }
    )
  }

  try {
    const { phone } = body || {}

    if (!phone || typeof phone !== "string" || !isValidPhoneNumber(phone)) {
      return NextResponse.json(
        { success: false, message: "شماره همراه وارد شده معتبر نیست. مثال: ۰۹۱۲۳۴۵۶۷۸۹" },
        { status: 400 }
      )
    }

    const result = await sendVerificationCode(phone)

    if (!result.success) {
      let statusCode = 400
      if (result.providerConfigured === false) {
        statusCode = 503
      } else if (result.isRateLimited) {
        statusCode = 429
      }

      return NextResponse.json(
        {
          success: false,
          message: result.message,
          cooldownSeconds: result.cooldownSeconds,
        },
        { status: statusCode }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      cooldownSeconds: result.cooldownSeconds,
      clientDispatch: result.clientDispatch,
      dispatchPayload: result.dispatchPayload,
    })
  } catch (err: unknown) {
    console.error("Error in /api/otp/send:", err)
    return NextResponse.json(
      { success: false, message: "خطایی در ارسال کد تایید رخ داد. لطفاً مجدداً تلاش کنید." },
      { status: 500 }
    )
  }
}
