// MyRahbord — Organizational X-Ray question bank (Persian, RTL)

export type DimensionId =
  | "dependency"
  | "knowledge"
  | "capacity"
  | "bottleneck"
  | "delivery"
  | "resilience"

export type LevelId = "quick" | "pro" | "full"

export type Dimension = {
  id: DimensionId
  title: string
  short: string
  description: string
}

export type Question = {
  id: string
  dimension: DimensionId
  text: string
  // depth: how many of the questions per dimension are included at each level
  depth: 1 | 2 | 3
}

export type Level = {
  id: LevelId
  title: string
  tagline: string
  description: string
  minutes: string
  depth: 1 | 2 | 3
}

export const DIMENSIONS: Dimension[] = [
  {
    id: "dependency",
    title: "وابستگی به افراد",
    short: "وابستگی",
    description: "میزان اتکای سازمان به حضور و تصمیم افراد کلیدی مشخص.",
  },
  {
    id: "knowledge",
    title: "تمرکز دانش",
    short: "دانش",
    description: "اینکه دانش و مستندات در دسترس همه است یا در ذهن چند نفر حبس شده.",
  },
  {
    id: "capacity",
    title: "ظرفیت و بار کاری",
    short: "ظرفیت",
    description: "تعادل بار کاری و توان پذیرش کارهای غیرمنتظره.",
  },
  {
    id: "bottleneck",
    title: "گلوگاه‌ها",
    short: "گلوگاه",
    description: "روانی جریان کار و نقاطی که کارها پشت آن‌ها معطل می‌مانند.",
  },
  {
    id: "delivery",
    title: "سلامت تحویل",
    short: "تحویل",
    description: "به‌موقع بودن، کیفیت و شفافیت خروجی‌ها.",
  },
  {
    id: "resilience",
    title: "تاب‌آوری و ریسک",
    short: "تاب‌آوری",
    description: "آمادگی سازمان برای مواجهه با غیبت‌ها، تغییرات و ریسک‌ها.",
  },
]

export const LEVELS: Level[] = [
  {
    id: "quick",
    title: "اسکن سریع",
    tagline: "یک نگاه فوری به وضعیت",
    description: "شش پرسش کلیدی برای گرفتن تصویری سریع از سلامت سازمان.",
    minutes: "≈ ۲ دقیقه",
    depth: 1,
  },
  {
    id: "pro",
    title: "تحلیل حرفه‌ای",
    tagline: "عمق بیشتر، دقت بالاتر",
    description: "دوازده پرسش که هر بُعد سازمان را دقیق‌تر بررسی می‌کند.",
    minutes: "≈ ۵ دقیقه",
    depth: 2,
  },
  {
    id: "full",
    title: "رادیولوژی کامل",
    tagline: "تصویربرداری کامل سازمان",
    description: "هجده پرسش برای یک اسکن عمیق و کامل از تمام ابعاد.",
    minutes: "≈ ۸ دقیقه",
    depth: 3,
  },
]

// Positively framed statements — higher agreement = healthier organization.
export const QUESTIONS: Question[] = [
  // dependency
  { id: "dep1", dimension: "dependency", depth: 1, text: "اگر یکی از افراد کلیدی تیم برای دو هفته غایب شود، کارها بدون وقفهٔ جدی ادامه می‌یابد." },
  { id: "dep2", dimension: "dependency", depth: 2, text: "برای هر مسئولیت حیاتی، دست‌کم دو نفر توانایی انجام آن را دارند." },
  { id: "dep3", dimension: "dependency", depth: 3, text: "تصمیم‌های روزمره به حضور یک فرد خاص گره نخورده است." },

  // knowledge
  { id: "kno1", dimension: "knowledge", depth: 1, text: "دانش و اطلاعات مهم سازمان در دسترس افراد مرتبط است، نه فقط در ذهن یک نفر." },
  { id: "kno2", dimension: "knowledge", depth: 2, text: "فرایندهای کلیدی به‌صورت مکتوب و به‌روز مستند شده‌اند." },
  { id: "kno3", dimension: "knowledge", depth: 3, text: "آموزش و راه‌اندازی نیروی جدید بدون اتکای کامل به یک فرد خاص ممکن است." },

  // capacity
  { id: "cap1", dimension: "capacity", depth: 1, text: "بار کاری میان اعضای تیم به‌شکل متعادل توزیع شده است." },
  { id: "cap2", dimension: "capacity", depth: 2, text: "تیم ظرفیت کافی برای پذیرش کارهای فوری و غیرمنتظره را دارد." },
  { id: "cap3", dimension: "capacity", depth: 3, text: "افراد به‌ندرت مجبور به اضافه‌کاری مداوم برای رساندن کارها هستند." },

  // bottleneck
  { id: "bot1", dimension: "bottleneck", depth: 1, text: "کارها بدون معطلی طولانی از یک مرحله به مرحلهٔ بعد منتقل می‌شوند." },
  { id: "bot2", dimension: "bottleneck", depth: 2, text: "تأییدها و تصمیم‌ها بدون گیر کردن پشت یک نقطهٔ خاص انجام می‌شوند." },
  { id: "bot3", dimension: "bottleneck", depth: 3, text: "به‌ندرت پیش می‌آید که چند کار هم‌زمان پشت یک منبع مشترک منتظر بمانند." },

  // delivery
  { id: "del1", dimension: "delivery", depth: 1, text: "تعهدها و ضرب‌الاجل‌ها معمولاً به‌موقع محقق می‌شوند." },
  { id: "del2", dimension: "delivery", depth: 2, text: "کیفیت خروجی‌ها پایدار است و دوباره‌کاری (rework) کم است." },
  { id: "del3", dimension: "delivery", depth: 3, text: "وضعیت پیشرفت کارها برای همهٔ ذی‌نفعان شفاف و قابل پیگیری است." },

  // resilience
  { id: "res1", dimension: "resilience", depth: 1, text: "سازمان برای غیبت یا خروج ناگهانی افراد کلیدی برنامهٔ مشخصی دارد." },
  { id: "res2", dimension: "resilience", depth: 2, text: "ریسک‌های اصلی به‌صورت منظم شناسایی و پایش می‌شوند." },
  { id: "res3", dimension: "resilience", depth: 3, text: "تیم در برابر تغییرات ناگهانی بازار یا اولویت‌ها به‌سرعت خود را تطبیق می‌دهد." },
]

export const ANSWER_OPTIONS: { label: string; value: number }[] = [
  { label: "کاملاً مخالفم", value: 0 },
  { label: "مخالفم", value: 25 },
  { label: "تا حدی", value: 50 },
  { label: "موافقم", value: 75 },
  { label: "کاملاً موافقم", value: 100 },
]

export function getQuestionsForLevel(level: LevelId): Question[] {
  const depth = LEVELS.find((l) => l.id === level)?.depth ?? 1
  return QUESTIONS.filter((q) => q.depth <= depth)
}
