import {
  DIMENSIONS,
  QUESTIONS,
  type DimensionId,
  type LevelId,
  getQuestionsForLevel,
} from "./questions"

export type Band = "healthy" | "warn" | "risk"

export type DimensionResult = {
  id: DimensionId
  title: string
  short: string
  description: string
  score: number // 0..100
  band: Band
}

export type Report = {
  overall: number
  band: Band
  dimensions: DimensionResult[]
  strengths: DimensionResult[]
  risks: DimensionResult[]
  actions: { dimension: string; text: string }[]
}

export function bandOf(score: number): Band {
  if (score >= 70) return "healthy"
  if (score >= 45) return "warn"
  return "risk"
}

export const BAND_LABEL: Record<Band, string> = {
  healthy: "سالم",
  warn: "نیازمند توجه",
  risk: "پرخطر",
}

const ACTIONS: Record<DimensionId, string> = {
  dependency:
    "برای مسئولیت‌های حیاتی، جانشین‌پروری کنید و دانش افراد کلیدی را میان تیم توزیع کنید.",
  knowledge:
    "فرایندهای کلیدی را مستند و به‌روز کنید تا دانش از ذهن افراد به سیستم منتقل شود.",
  capacity:
    "بار کاری را بازتوزیع کنید و بخشی از ظرفیت را برای کارهای فوری خالی نگه دارید.",
  bottleneck:
    "نقاطی که کارها پشت آن‌ها معطل می‌شوند را شناسایی و اختیار تصمیم را غیرمتمرکز کنید.",
  delivery:
    "تعهدها را واقع‌بینانه‌تر تعریف کنید و پیشرفت کارها را شفاف و قابل پیگیری کنید.",
  resilience:
    "ریسک‌های کلیدی را منظم پایش کنید و برای غیبت یا خروج افراد برنامهٔ جایگزین بسازید.",
}

export function buildReport(
  level: LevelId,
  answers: Record<string, number>,
): Report {
  const questions = getQuestionsForLevel(level)

  const dimensions: DimensionResult[] = DIMENSIONS.map((dim) => {
    const dimQuestions = questions.filter((q) => q.dimension === dim.id)
    const answered = dimQuestions
      .map((q) => answers[q.id])
      .filter((v) => typeof v === "number")
    const score =
      answered.length > 0
        ? Math.round(answered.reduce((a, b) => a + b, 0) / answered.length)
        : 0
    return {
      id: dim.id,
      title: dim.title,
      short: dim.short,
      description: dim.description,
      score,
      band: bandOf(score),
    }
  })

  const overall = Math.round(
    dimensions.reduce((a, d) => a + d.score, 0) / dimensions.length,
  )

  const sorted = [...dimensions].sort((a, b) => b.score - a.score)
  const strengths = sorted.filter((d) => d.score >= 70).slice(0, 3)
  const risks = [...dimensions]
    .sort((a, b) => a.score - b.score)
    .filter((d) => d.score < 70)
    .slice(0, 3)

  const actions = [...dimensions]
    .sort((a, b) => a.score - b.score)
    .filter((d) => d.score < 70)
    .slice(0, 4)
    .map((d) => ({ dimension: d.title, text: ACTIONS[d.id] }))

  return {
    overall,
    band: bandOf(overall),
    dimensions,
    strengths: strengths.length ? strengths : sorted.slice(0, 2),
    risks,
    actions,
  }
}

// used only for type-completeness references
export const ALL_QUESTION_IDS = QUESTIONS.map((q) => q.id)
