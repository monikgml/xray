// MyRahbord — Organizational X-Ray question bank (Persian, RTL)

export type DimensionId =
  | "people"
  | "knowledge"
  | "capacity"
  | "flow"
  | "delivery"
  | "resilience"
  | "rewards"
  | "culture"

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
    id: "people",
    title: "افراد و وابستگی کلیدی",
    short: "افراد",
    description: "شناخت نقاط قوت/ضعف، سهم و اثرگذاری افراد و میزان وابستگی سازمان به آن‌ها.",
  },
  {
    id: "knowledge",
    title: "رسوب دانش و مستندسازی",
    short: "دانش",
    description: "ماندگاری دانش در سازمان پس از خروج افراد؛ مستندات، آنبوردینگ و شرح وظایف.",
  },
  {
    id: "capacity",
    title: "ظرفیت و بار کاری",
    short: "ظرفیت",
    description: "توزیع بار، ارزیابی ظرفیت واقعی تیم‌ها، تفویض اختیار و تصمیم رشد تیم.",
  },
  {
    id: "flow",
    title: "جریان کار و گلوگاه‌ها",
    short: "جریان",
    description: "روانی جریان کار، گلوگاه‌ها، ترکیب ورودی تسک‌ها و پایبندی به مهلت‌ها.",
  },
  {
    id: "delivery",
    title: "سلامت تحویل و محصول",
    short: "تحویل",
    description: "چرخهٔ عمر واقعی محصول، هزینهٔ پیاده‌سازی و تناسب بار پروژه‌ها با سودآوری.",
  },
  {
    id: "resilience",
    title: "تاب‌آوری و ریسک",
    short: "تاب‌آوری",
    description: "نقاط بحرانی، فرآیند شناسایی/خروج افراد و یادگیری سازمان از اشتباهات.",
  },
  {
    id: "rewards",
    title: "عملکرد، پاداش و انگیزش",
    short: "پاداش",
    description: "مبنای پاداش و ارتقا، دیده‌شدن عملکرد و انگیزش مبتنی بر اثرگذاری واقعی.",
  },
  {
    id: "culture",
    title: "فرهنگ، تناسب و داده",
    short: "فرهنگ",
    description: "بازخورد و دیده‌شدن افراد، تناسب تخصص با نقش و تصمیم‌گیری داده‌محور.",
  },
]

export const LEVELS: Level[] = [
  {
    id: "quick",
    title: "اسکن سریع",
    tagline: "یک نگاه فوری به وضعیت",
    description: "هشت پرسش کلیدی برای گرفتن تصویری سریع از سلامت هر بُعد سازمان.",
    minutes: "≈ ۳ دقیقه",
    depth: 1,
  },
  {
    id: "pro",
    title: "تحلیل حرفه‌ای",
    tagline: "عمق بیشتر، دقت بالاتر",
    description: "بیست‌وچهار پرسش که هر بُعد سازمان را دقیق‌تر بررسی می‌کند.",
    minutes: "≈ ۷ دقیقه",
    depth: 2,
  },
  {
    id: "full",
    title: "رادیولوژی کامل",
    tagline: "تصویربرداری کامل سازمان",
    description: "پنجاه‌وشش پرسش برای یک اسکن عمیق و کامل از تمام ابعاد.",
    minutes: "≈ ۱۵ دقیقه",
    depth: 3,
  },
]

// Positively framed statements — higher agreement = healthier organization.
// depth 1 → quick, depth ≤2 → pro, depth ≤3 → full
export const QUESTIONS: Question[] = [
  // people — افراد و وابستگی کلیدی
  { id: "peo1", dimension: "people", depth: 1, text: "اگر یکی از افراد کلیدی برای دو هفته غایب شود، کارها بدون وقفهٔ جدی ادامه می‌یابد." },
  { id: "peo2", dimension: "people", depth: 2, text: "نقاط قوت و ضعف فنی هر عضو تیم را می‌شناسم و برای بهبود آن‌ها برنامهٔ آموزشی مشخص دارم." },
  { id: "peo3", dimension: "people", depth: 2, text: "می‌دانم هر فرد دقیقاً چه سهم و اثری در سودآوری و ارزش‌آفرینی سازمان دارد." },
  { id: "peo4", dimension: "people", depth: 3, text: "می‌دانم سازمان بر اساس کدام فعالیت‌ها به هر فرد وابسته است و جایگزین او باید چه ویژگی‌های واقعی داشته باشد." },
  { id: "peo5", dimension: "people", depth: 3, text: "می‌دانم دشوارترین، سریع‌ترین و حساس‌ترین کارها معمولاً به کدام افراد سپرده می‌شود و چرا." },
  { id: "peo6", dimension: "people", depth: 3, text: "در تسک‌های حساس، مسئولیت بین افراد قابل‌اتکا توزیع شده و فقط روی یک نفر متمرکز نیست." },
  { id: "peo7", dimension: "people", depth: 3, text: "برای هر فرد، تصویر روشنی از نقش واقعی او در پروژه‌ها، تیم‌ها و خروجی‌های قابل‌اندازه‌گیری داریم." },

  // knowledge — رسوب دانش و مستندسازی
  { id: "kno1", dimension: "knowledge", depth: 1, text: "خروج یک فرد کل دانش و تجربهٔ او را با خود نمی‌برد؛ دانش در سازمان «رسوب» می‌کند." },
  { id: "kno2", dimension: "knowledge", depth: 2, text: "فرایندها و شرح وظایف کلیدی مکتوب‌اند و به‌صورت منظم به‌روزرسانی می‌شوند." },
  { id: "kno3", dimension: "knowledge", depth: 2, text: "فرآیند آنبوردینگ ما ساختارمند است و بر تجربهٔ مکتوب کارهای قبلی تکیه دارد." },
  { id: "kno4", dimension: "knowledge", depth: 3, text: "برای کارهای برون‌سپاری‌شده یا دورکاری، دانش و خروجی افراد به‌روشنی در سازمان ثبت و ارزیابی می‌شود." },
  { id: "kno5", dimension: "knowledge", depth: 3, text: "در صورت اختلاف حقوقی با کارکنان، مستندات کاملی از فعالیت‌های واقعی افراد در اختیار داریم." },
  { id: "kno6", dimension: "knowledge", depth: 3, text: "گزارش‌های روزانه، کامنت‌ها و چک‌لیست‌ها به‌اندازه‌ای کامل‌اند که مسیر تصمیم و اجرای هر کار قابل‌پیگیری باشد." },
  { id: "kno7", dimension: "knowledge", depth: 3, text: "برای تسک‌های مهم، لینک‌ها، مستندات و ارجاعات خارجی به‌شکل منظم کنار خود تسک ثبت می‌شوند." },

  // capacity — ظرفیت و بار کاری
  { id: "cap1", dimension: "capacity", depth: 1, text: "بار کاری میان تیم‌ها و افراد به‌شکل متعادل توزیع شده است." },
  { id: "cap2", dimension: "capacity", depth: 2, text: "می‌دانم بیشترین انرژی سازمان صرف کدام لایه از فعالیت‌ها می‌شود (فرانت‌اند، بک‌اند، پشتیبانی، رفع‌عیب، توسعه…)." },
  { id: "cap3", dimension: "capacity", depth: 2, text: "ظرفیت واقعی هر تیم و فرد را با معیار روشن ارزیابی می‌کنم و می‌دانم کدام تیم توان پذیرش کار بیشتری دارد." },
  { id: "cap4", dimension: "capacity", depth: 3, text: "می‌دانم بر چه اساسی و به چه کسی باید مسئولیت بیشتر یا تفویض اختیار بدهم." },
  { id: "cap5", dimension: "capacity", depth: 3, text: "تصمیم دربارهٔ بزرگ‌کردن تیم را بر پایهٔ معیارهای فنی و داده می‌گیرم، نه احساس." },
  { id: "cap6", dimension: "capacity", depth: 3, text: "اختلاف بین زمان برنامه‌ریزی‌شده و زمان واقعی انجام کارها را به‌صورت منظم بررسی می‌کنیم." },
  { id: "cap7", dimension: "capacity", depth: 3, text: "می‌توانیم قبل از پذیرش کار جدید، اثر آن را روی ظرفیت افراد، تیم‌ها و مهلت‌های فعلی ببینیم." },

  // flow — جریان کار و گلوگاه‌ها
  { id: "flo1", dimension: "flow", depth: 1, text: "کارها بدون معطلی طولانی از یک مرحله به مرحلهٔ بعد منتقل می‌شوند." },
  { id: "flo2", dimension: "flow", depth: 2, text: "می‌دانم گلوگاه اصلی سازمان دقیقاً کدام واحد یا وضعیت در چرخهٔ کار است." },
  { id: "flo3", dimension: "flow", depth: 2, text: "ترکیب ورودی تسک‌ها (باگ، پشتیبانی، ویژگی جدید) را می‌شناسم و پایش می‌کنم." },
  { id: "flo4", dimension: "flow", depth: 3, text: "نرخ پایبندی به مهلت‌ها و میانگین سن کارهای باز را می‌دانم و ردیابی می‌کنم." },
  { id: "flo5", dimension: "flow", depth: 3, text: "از نرخ بازگشت تسک‌ها به چرخهٔ توسعه/رفع‌عیب آگاهم و برای کاهش آن برنامه دارم." },
  { id: "flo6", dimension: "flow", depth: 3, text: "می‌دانیم هر تسک معمولاً چند روز در هر وضعیت می‌ماند و وضعیت‌های کندکننده را جداگانه پایش می‌کنیم." },
  { id: "flo7", dimension: "flow", depth: 3, text: "تعداد کارهای هم‌زمان در جریان کنترل می‌شود و تیم‌ها با انباشت تسک نیمه‌تمام کار نمی‌کنند." },

  // delivery — سلامت تحویل و محصول
  { id: "del1", dimension: "delivery", depth: 1, text: "تعهدها و ضرب‌الاجل‌ها معمولاً به‌موقع و با کیفیت پایدار محقق می‌شوند." },
  { id: "del2", dimension: "delivery", depth: 2, text: "چرخهٔ عمر واقعی محصولات را می‌بینم و می‌دانم چقدر با چرخهٔ پیش‌بینی‌شده تطابق دارد." },
  { id: "del3", dimension: "delivery", depth: 2, text: "نرخ تعریف تسک و نرخ تحویل آن‌ها متعادل است (تیم پروداکت خیلی جلوتر از توسعه نیست)." },
  { id: "del4", dimension: "delivery", depth: 3, text: "هزینهٔ پیاده‌سازی هر کار، ویژگی جدید یا رفع‌عیب را می‌دانم." },
  { id: "del5", dimension: "delivery", depth: 3, text: "می‌دانم کدام پروژه بیشترین بار (زمان/هزینه/فشار) را دارد و آیا به همان اندازه سودآور است." },
  { id: "del6", dimension: "delivery", depth: 3, text: "برای هر پروژه، پیشرفت واقعی، ساعات مصرف‌شده و ریسک تأخیر را در کنار هم می‌بینیم." },
  { id: "del7", dimension: "delivery", depth: 3, text: "کیفیت خروجی فقط با تمام‌شدن تسک سنجیده نمی‌شود و امتیازهایی مثل تست، درک مسئله و بازکاری هم دیده می‌شوند." },

  // resilience — تاب‌آوری و ریسک
  { id: "res1", dimension: "resilience", depth: 1, text: "می‌دانم نقاط بحرانی و پرخطر سازمان دقیقاً در کدام واحدها، فعالیت‌ها و افراد است." },
  { id: "res2", dimension: "resilience", depth: 2, text: "برای شناسایی فرد نامناسب تا ارزیابی، اخطار و خروج، فرآیند و معیار روشنی داریم." },
  { id: "res3", dimension: "resilience", depth: 2, text: "برای مصاحبهٔ خروج آماده‌ایم و از تصمیم‌های خروج مطمئن و مستندیم." },
  { id: "res4", dimension: "resilience", depth: 3, text: "پیش از اخراج، افراد را از نقاط ضعفشان آگاه و فرصت بهبود می‌دهیم تا از دست‌دادن فرد مناسب جلوگیری شود." },
  { id: "res5", dimension: "resilience", depth: 3, text: "سازمان از اشتباهات خود درس می‌گیرد و همان اشتباه را بارها تکرار نمی‌کند." },
  { id: "res6", dimension: "resilience", depth: 3, text: "تسک‌های بحرانی، افراد وابسته و پروژه‌های پرریسک قبل از تبدیل‌شدن به بحران در داشبورد دیده می‌شوند." },
  { id: "res7", dimension: "resilience", depth: 3, text: "تغییرات مهم در تسک‌ها، وضعیت‌ها و امتیازها قابل ردیابی است و تصمیم‌ها بدون ردپا باقی نمی‌مانند." },

  // rewards — عملکرد، پاداش و انگیزش
  { id: "rew1", dimension: "rewards", depth: 1, text: "پاداش‌ها و کارانه‌ها بر اساس معیارهای فنی و اثرگذاری واقعی افراد تعیین می‌شوند." },
  { id: "rew2", dimension: "rewards", depth: 2, text: "نظام تشویق و مدال‌دهی ما به رقابت سالم و بهره‌وری بیشتر منجر می‌شود." },
  { id: "rew3", dimension: "rewards", depth: 2, text: "وقتی کسی کاری را زودتر و بهتر انجام می‌دهد، دیده و تشویق می‌شود." },
  { id: "rew4", dimension: "rewards", depth: 3, text: "می‌توانم سهم هر فرد از یک صندوق پاداش بهره‌وری را متناسب با اثرگذاری واقعی او تعیین کنم." },
  { id: "rew5", dimension: "rewards", depth: 3, text: "مسیر و مبنای ارتقای شغلی در سازمان روشن و منطقی است." },
  { id: "rew6", dimension: "rewards", depth: 3, text: "امتیاز عملکرد افراد فقط بر اساس حجم کار نیست و کیفیت، تعهد زمانی، تست و فهم مسئله هم در آن اثر دارد." },
  { id: "rew7", dimension: "rewards", depth: 3, text: "برترین عملکردهای ماهانه بر پایهٔ داده‌های واقعی کار و امتیازها شناسایی می‌شوند، نه برداشت‌های ذهنی." },

  // culture — فرهنگ، تناسب و داده
  { id: "cul1", dimension: "culture", depth: 1, text: "افراد در سازمان احساس دیده‌شدن و توسعه دارند و نظام بازخورد روشن و صادقانه‌ای داریم." },
  { id: "cul2", dimension: "culture", depth: 2, text: "افراد عمدتاً هم‌راستا با تخصصشان کار می‌کنند و ظرفیت شخصیتی/نرم آن‌ها با نقششان هماهنگ است." },
  { id: "cul3", dimension: "culture", depth: 2, text: "تصمیم‌ها و جلسات ما بر پایهٔ واقعیت، داده و نمودار است، نه گزارش‌های صرفاً کلامی." },
  { id: "cul4", dimension: "culture", depth: 3, text: "اعضای تیم در ارائهٔ گزارش فعال‌اند و گزارش‌ها با واقعیت (مثلاً سلامت و کیفیت کد) مطابقت دارند." },
  { id: "cul5", dimension: "culture", depth: 3, text: "برای بهبود فرهنگ سازمانی و افزایش رضایت و بهره‌وری کارکنان، برنامهٔ فعال و آگاهانه داریم." },
  { id: "cul6", dimension: "culture", depth: 3, text: "مدیران از داشبوردها و نمودارها برای گفت‌وگو دربارهٔ واقعیت کار استفاده می‌کنند، نه فقط برای گزارش رسمی." },
  { id: "cul7", dimension: "culture", depth: 3, text: "مهارت‌های ثبت‌شدهٔ افراد با نوع کارهایی که واقعاً به آن‌ها سپرده می‌شود هم‌خوانی دارد." },
]

export const ANSWER_OPTIONS: { label: string; value: number }[] = [
  { label: "اصلاً / نمی‌دانم", value: 0 },
  { label: "کم و پراکنده", value: 25 },
  { label: "تا حدی", value: 50 },
  { label: "تا حد خوبی", value: 75 },
  { label: "کاملاً و مبتنی بر داده", value: 100 },
]

export function getQuestionsForLevel(level: LevelId): Question[] {
  const depth = LEVELS.find((l) => l.id === level)?.depth ?? 1
  return QUESTIONS.filter((q) => q.depth <= depth)
}
