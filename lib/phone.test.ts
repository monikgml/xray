import { test } from "node:test"
import assert from "node:assert"
import { normalizeDigits, isValidPhoneNumber, formatPhoneForStorage } from "./phone"

test("normalizeDigits converts Farsi and Arabic digits to English digits", () => {
  assert.strictEqual(normalizeDigits("۰۹۱۲۳۴۵۶۷۸۹"), "09123456789")
  assert.strictEqual(normalizeDigits("٠٩١٢٣٤٥٦٧٨٩"), "09123456789")
  assert.strictEqual(normalizeDigits("09123456789"), "09123456789")
})

test("isValidPhoneNumber validates Iranian mobile phone numbers in various formats", () => {
  // Valid Iranian phone numbers
  assert.strictEqual(isValidPhoneNumber("09123456789"), true)
  assert.strictEqual(isValidPhoneNumber("۰۹۱۲۳۴۵۶۷۸۹"), true)
  assert.strictEqual(isValidPhoneNumber("+989123456789"), true)
  assert.strictEqual(isValidPhoneNumber("00989123456789"), true)
  assert.strictEqual(isValidPhoneNumber("9123456789"), true)
  assert.strictEqual(isValidPhoneNumber("0912-345-6789"), true)
  assert.strictEqual(isValidPhoneNumber("0912 345 6789"), true)

  // Invalid phone numbers
  assert.strictEqual(isValidPhoneNumber(""), false)
  assert.strictEqual(isValidPhoneNumber("123"), false)
  assert.strictEqual(isValidPhoneNumber("08123456789"), false) // Starts with 08 instead of 09
  assert.strictEqual(isValidPhoneNumber("abcdefghijk"), false)
  assert.strictEqual(isValidPhoneNumber("0912345678"), false) // 10 digits starting with 0
})

test("formatPhoneForStorage converts valid numbers into standard 09... format", () => {
  assert.strictEqual(formatPhoneForStorage("09123456789"), "09123456789")
  assert.strictEqual(formatPhoneForStorage("۰۹۱۲۳۴۵۶۷۸۹"), "09123456789")
  assert.strictEqual(formatPhoneForStorage("+989123456789"), "09123456789")
  assert.strictEqual(formatPhoneForStorage("00989123456789"), "09123456789")
  assert.strictEqual(formatPhoneForStorage("9123456789"), "09123456789")
})
