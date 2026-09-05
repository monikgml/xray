import { NextResponse } from "next/server"
import { normalizeToE164, normalizeToNationalFormat, isValidPhoneNumber } from "@/lib/phone"

export async function POST(request: Request) {
  try {
    const adminKey = (process.env.ADMIN_ACCESS_KEY || "admin123").trim()
    const authHeader = request.headers.get("x-admin-key")?.trim()

    if (authHeader !== adminKey) {
      return NextResponse.json(
        { success: false, error: "دسترسی غیرمجاز. کلید امنیتی مدیریت نامعتبر است." },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const testPhone = body.phone || "09128487408"

    if (!isValidPhoneNumber(testPhone)) {
      return NextResponse.json(
        { success: false, error: "شماره همراه وارد شده نامعتبر است." },
        { status: 400 }
      )
    }

    const national = normalizeToNationalFormat(testPhone)
    const e164 = normalizeToE164(national)

    const rawApiKey = (process.env.IPPANEL_API_KEY || "").trim().replace(/^["']|["']$/g, "")
    const patternCode = (process.env.IPPANEL_PATTERN_CODE || "fh24clmdnsoevbe").trim().replace(/^["']|["']$/g, "")
    const fromNumber = (process.env.IPPANEL_FROM_NUMBER || "+983000505").trim().replace(/^["']|["']$/g, "")
    const codeParam = (process.env.IPPANEL_CODE_PARAM || "verifycode").trim().replace(/^["']|["']$/g, "")
    const baseUrl = (process.env.IPPANEL_BASE_URL || "").trim().replace(/^["']|["']$/g, "")
    const testCode = "123456"

    const maskedKey = rawApiKey
      ? `${rawApiKey.slice(0, 4)}...${rawApiKey.slice(-4)} (طول: ${rawApiKey.length} کاراکتر)`
      : "تنظیم نشده (خالی)"

    const diagnostics: {
      env: Record<string, unknown>
      customBaseResult?: Record<string, unknown>
      api2Result?: Record<string, unknown>
      edgeResult?: Record<string, unknown>
    } = {
      env: {
        apiKeyConfigured: !!rawApiKey,
        apiKeyMasked: maskedKey,
        baseUrlConfigured: baseUrl || "پیش‌فرض",
        patternCode,
        fromNumber,
        codeParam,
        targetPhoneE164: e164,
      },
    }

    const headersCommon = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    }

    // 0. Test custom baseUrl if configured
    if (baseUrl) {
      const cleanBase = baseUrl.replace(/\/+$/, "")
      const startCustom = Date.now()
      try {
        // Try edge format first on custom baseUrl
        const customUrl = cleanBase.includes("/api/send") || cleanBase.includes("/send")
          ? cleanBase
          : `${cleanBase}/v1/api/send`

        const resCustom = await fetch(customUrl, {
          method: "POST",
          headers: {
            ...headersCommon,
            Authorization: rawApiKey,
          },
          body: JSON.stringify({
            sending_type: "pattern",
            from_number: fromNumber,
            code: patternCode,
            recipients: [e164],
            params: {
              [codeParam]: testCode,
            },
          }),
          signal: AbortSignal.timeout(8000),
        })
        const bodyCustom = await resCustom.text().catch((e) => e.message)
        diagnostics.customBaseResult = {
          endpoint: customUrl,
          status: resCustom.status,
          statusText: resCustom.statusText,
          durationMs: Date.now() - startCustom,
          responseBody: bodyCustom.slice(0, 400),
        }
      } catch (err: unknown) {
        diagnostics.customBaseResult = {
          endpoint: cleanBase,
          durationMs: Date.now() - startCustom,
          error: err instanceof Error ? err.message : String(err),
        }
      }
    }

    // 1. Test api2.ippanel.com
    const startApi2 = Date.now()
    try {
      const res2 = await fetch("https://api2.ippanel.com/api/v1/sms/pattern/normal/send", {
        method: "POST",
        headers: {
          ...headersCommon,
          apikey: rawApiKey,
        },
        body: JSON.stringify({
          code: patternCode,
          sender: fromNumber,
          recipient: e164,
          variable: {
            [codeParam]: testCode,
          },
        }),
        signal: AbortSignal.timeout(8000),
      })
      const body2 = await res2.text().catch((e) => e.message)
      diagnostics.api2Result = {
        endpoint: "https://api2.ippanel.com/api/v1/sms/pattern/normal/send",
        status: res2.status,
        statusText: res2.statusText,
        durationMs: Date.now() - startApi2,
        responseBody: body2.slice(0, 400),
      }
    } catch (err: unknown) {
      diagnostics.api2Result = {
        endpoint: "https://api2.ippanel.com/api/v1/sms/pattern/normal/send",
        durationMs: Date.now() - startApi2,
        error: err instanceof Error ? err.message : String(err),
      }
    }

    // 2. Test edge.ippanel.com
    const startEdge = Date.now()
    try {
      const resEdge = await fetch("https://edge.ippanel.com/v1/api/send", {
        method: "POST",
        headers: {
          ...headersCommon,
          Authorization: rawApiKey,
        },
        body: JSON.stringify({
          sending_type: "pattern",
          from_number: fromNumber,
          code: patternCode,
          recipients: [e164],
          params: {
            [codeParam]: testCode,
          },
        }),
        signal: AbortSignal.timeout(8000),
      })
      const bodyEdge = await resEdge.text().catch((e) => e.message)
      diagnostics.edgeResult = {
        endpoint: "https://edge.ippanel.com/v1/api/send",
        status: resEdge.status,
        statusText: resEdge.statusText,
        durationMs: Date.now() - startEdge,
        responseBody: bodyEdge.slice(0, 400),
      }
    } catch (err: unknown) {
      diagnostics.edgeResult = {
        endpoint: "https://edge.ippanel.com/v1/api/send",
        durationMs: Date.now() - startEdge,
        error: err instanceof Error ? err.message : String(err),
      }
    }

    return NextResponse.json({
      success: true,
      diagnostics,
    })
  } catch (err: unknown) {
    console.error("Diagnostic error:", err)
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "خطای ناشناخته در بررسی سامانه" },
      { status: 500 }
    )
  }
}
