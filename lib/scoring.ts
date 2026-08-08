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
  people:
    "نقاط قوت/ضعف و سهم واقعی هر فرد را شفاف کنید و برای نقش‌های کلیدی جانشین‌پروری کنید تا وابستگی سازمان به افراد کاهش یابد.",
  knowledge:
    "فرایندها و شرح وظایف را مستند و به‌روز کنید و برای کارهای دورکاری/برون‌سپاری، سازوکار ثبت دانش بسازید تا دانش در سازمان رسوب کند.",
  capacity:
    "ظرفیت واقعی تیم‌ها را با معیار روشن اندازه بگیرید، بار را بازتوزیع کنید و تصمیم رشد تیم را داده‌محور بگیرید.",
  flow:
    "گلوگاه اصلی چرخهٔ کار را شناسایی کنید و ترکیب ورودی تسک‌ها، سن کارهای باز و نرخ بازگشت را پایش و اصلاح کنید.",
  delivery:
    "چرخهٔ عمر واقعی و هزینهٔ پیاده‌سازی هر کار را اندازه بگیرید و تعادل نرخ تعریف و تحویل تسک‌ها را برقرار کنید.",
  resilience:
    "نقاط بحرانی را منظم پایش کنید، فرآیند شفاف شناسایی/خروج افراد بسازید و از اشتباهات درس بگیرید تا تکرار نشوند.",
  rewards:
    "پاداش، ارتقا و مدال‌دهی را به معیارهای فنی و اثرگذاری واقعی گره بزنید تا انگیزش و رقابت سالم تقویت شود.",
  culture:
    "نظام بازخورد صادقانه برقرار کنید، تخصص افراد را با نقششان هم‌راستا کنید و تصمیم‌ها را بر پایهٔ داده و نمودار بگیرید.",
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
