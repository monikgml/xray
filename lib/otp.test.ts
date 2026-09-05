import { test } from "node:test"
import assert from "node:assert"
import {
  generateVerificationCode,
  validateVerificationCode,
  isPhoneVerified,
  markPhoneConfirmed,
  _setMockVerificationCode,
  _clearVerificationStore,
} from "./otp"

test("generateVerificationCode generates 6 digit numeric code", () => {
  const code = generateVerificationCode(6)
  assert.strictEqual(code.length, 6)
  assert.match(code, /^\d{6}$/)
})

test("validateVerificationCode validates correct code and rejects wrong code", () => {
  _clearVerificationStore()
  const phone = "09123456789"
  const testCode = "654321"

  _setMockVerificationCode(phone, testCode, 60000)

  // Test wrong code
  const wrongRes = validateVerificationCode(phone, "111111")
  assert.strictEqual(wrongRes.valid, false)
  assert.ok(wrongRes.message?.includes("نادرست"))

  // Test correct code (with Persian digits too)
  const correctRes = validateVerificationCode(phone, "۶۵۴۳۲۱")
  assert.strictEqual(correctRes.valid, true)
  assert.strictEqual(isPhoneVerified(phone), true)

  // Cleanup
  markPhoneConfirmed(phone)
  assert.strictEqual(isPhoneVerified(phone), false)
})

test("validateVerificationCode rejects expired code", () => {
  _clearVerificationStore()
  const phone = "09123456789"
  const testCode = "123456"

  // Code with -100ms TTL (already expired)
  _setMockVerificationCode(phone, testCode, -100)

  const res = validateVerificationCode(phone, testCode)
  assert.strictEqual(res.valid, false)
  assert.ok(res.message?.includes("منقضی"))
})
