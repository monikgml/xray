const FA_AR_DIGITS: Record<string, string> = {
  "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
  "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
}

/**
 * Normalizes Farsi/Arabic digits to Latin digits.
 */
export function normalizeDigits(input: string): string {
  return input.replace(/[۰-۹٠-٩]/g, (char) => FA_AR_DIGITS[char] ?? char)
}

/**
 * Validates whether the given phone number string is a valid mobile phone number format.
 * Supports Iranian mobile numbers (09..., +989..., 00989..., 9...) as well as general international formats.
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone || typeof phone !== "string") return false

  const normalized = normalizeDigits(phone.trim())
  // Remove formatting characters like spaces, dashes, dots, parentheses
  const cleaned = normalized.replace(/[\s\-\.\(\)]/g, "")

  if (!cleaned) return false

  // Check Iranian mobile formats
  // e.g. 09123456789, +989123456789, 00989123456789, 9123456789
  const iranianMobileRegex = /^(?:\+98|0098|0)?9\d{9}$/
  if (iranianMobileRegex.test(cleaned)) {
    return true
  }

  // Check general international phone number format (+ followed by 8 to 15 digits or 8 to 15 digits)
  const generalMobileRegex = /^\+?[1-9]\d{7,14}$/
  return generalMobileRegex.test(cleaned)
}

/**
 * Formats a valid phone number into a clean standard string for database storage.
 * e.g., converts "+989123456789" or "۰۹۱۲۳۴۵۶۷۸۹" to "09123456789".
 */
export function formatPhoneForStorage(phone: string): string {
  const normalized = normalizeDigits(phone.trim())
  let cleaned = normalized.replace(/[\s\-\.\(\)]/g, "")

  if (cleaned.startsWith("+98")) {
    cleaned = "0" + cleaned.slice(3)
  } else if (cleaned.startsWith("0098")) {
    cleaned = "0" + cleaned.slice(4)
  } else if (cleaned.length === 10 && cleaned.startsWith("9")) {
    cleaned = "0" + cleaned
  }

  return cleaned
}
