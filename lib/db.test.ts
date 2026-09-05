import { test } from "node:test"
import assert from "node:assert"
import fs from "fs"
import path from "path"

test("db module saves and retrieves submissions", async () => {
  const tempDbPath = path.join(process.cwd(), "test-temp.sqlite")
  if (fs.existsSync(tempDbPath)) {
    fs.unlinkSync(tempDbPath)
  }

  process.env.DATABASE_PATH = tempDbPath

  // dynamically import db module to use process.env.DATABASE_PATH
  const { saveSubmission, getAllSubmissions, closeDb } = await import("./db")

  const submission = {
    phone: "09123456789",
    level: "quick",
    overall: 85,
    band: "healthy",
    answers: { peo1: 100, kno1: 75 },
    report: { overall: 85, band: "healthy", dimensions: [] },
  }

  const saved = saveSubmission(submission)
  assert.ok(saved.id > 0)
  assert.ok(saved.created_at)

  const all = getAllSubmissions()
  assert.strictEqual(all.length, 1)
  assert.strictEqual(all[0].phone, "09123456789")
  assert.strictEqual(all[0].level, "quick")
  assert.strictEqual(all[0].overall, 85)
  assert.strictEqual(all[0].band, "healthy")
  assert.deepStrictEqual(all[0].answers, { peo1: 100, kno1: 75 })

  // Close db connection before unlinking on Windows
  closeDb()

  // Cleanup temp database file
  if (fs.existsSync(tempDbPath)) {
    fs.unlinkSync(tempDbPath)
  }
})
