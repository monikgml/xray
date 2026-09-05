import { DatabaseSync } from "node:sqlite"
import path from "path"

export type SubmissionRecord = {
  id?: number
  phone: string
  level: string
  overall: number
  band: string
  answers: Record<string, number>
  report: object
  created_at?: string
}

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "db.sqlite")

let dbInstance: DatabaseSync | null = null

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(dbPath)
    dbInstance.exec("PRAGMA journal_mode = WAL;")
    initDb(dbInstance)
  }
  return dbInstance
}

export function closeDb(): void {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}

function initDb(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      level TEXT NOT NULL,
      overall INTEGER NOT NULL,
      band TEXT NOT NULL,
      answers TEXT NOT NULL,
      report TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)
}

export function saveSubmission(data: {
  phone: string
  level: string
  overall: number
  band: string
  answers: Record<string, number>
  report: object
}): { id: number; created_at: string } {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO submissions (phone, level, overall, band, answers, report)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const result = stmt.run(
    data.phone,
    data.level,
    data.overall,
    data.band,
    JSON.stringify(data.answers),
    JSON.stringify(data.report)
  )

  const insertedId = Number(result.lastInsertRowid)
  const row = db.prepare("SELECT created_at FROM submissions WHERE id = ?").get(insertedId) as { created_at: string }

  return {
    id: insertedId,
    created_at: row?.created_at || new Date().toISOString(),
  }
}

export function getAllSubmissions() {
  const db = getDb()
  const rows = db.prepare("SELECT * FROM submissions ORDER BY created_at DESC").all() as Array<{
    id: number
    phone: string
    level: string
    overall: number
    band: string
    answers: string
    report: string
    created_at: string
  }>

  return rows.map((row) => ({
    ...row,
    answers: JSON.parse(row.answers),
    report: JSON.parse(row.report),
  }))
}
