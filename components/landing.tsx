"use client"

import { LEVELS, DIMENSIONS, type LevelId } from "@/lib/questions"
import {
  ScanLine,
  Stethoscope,
  Activity,
  Users,
  BookLock,
  Gauge,
  Workflow,
  Truck,
  ShieldAlert,
  Award,
  HeartHandshake,
  ArrowLeft,
} from "lucide-react"

const LEVEL_ICON = {
  quick: ScanLine,
  pro: Activity,
  full: Stethoscope,
} as const

const DIM_ICON = {
  people: Users,
  knowledge: BookLock,
  capacity: Gauge,
  flow: Workflow,
  delivery: Truck,
  resilience: ShieldAlert,
  rewards: Award,
  culture: HeartHandshake,
} as const

export function Landing({ onStart }: { onStart: (level: LevelId) => void }) {
  return (
    <div className="mx-auto max-w-5xl px-5 py-10 md:py-16">
      {/* Hero */}
      <header className="text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
          <span className="inline-block h-2 w-2 rounded-full bg-primary" />
          مای‌راهبرد · رادیولوژی سازمانی
        </div>
        <h1 className="mt-6 text-balance text-3xl font-bold leading-tight text-foreground md:text-5xl">
          سازمان شما از درون چه شکلی است؟
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
          وقتی یک نفر مرخصی می‌رود همه‌چیز متوقف می‌شود؟ دانش در ذهن چند نفر حبس شده؟
          کارها پشت یک گلوگاه معطل می‌مانند؟ در چند دقیقه یک اسکن دقیق از سلامت
          سازمان بگیرید و نقاط پرخطر را ببینید.
        </p>
      </header>

      {/* What we scan */}
      <section className="mt-12">
        <h2 className="mb-4 text-center text-sm font-medium text-muted-foreground">
          این اسکن چه ابعادی را بررسی می‌کند؟
        </h2>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {DIMENSIONS.map((d) => {
            const Icon = DIM_ICON[d.id]
            return (
              <li
                key={d.id}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold text-foreground">{d.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {d.description}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Level selection */}
      <section className="mt-14">
        <h2 className="text-center text-xl font-bold text-foreground md:text-2xl">
          سطح تحلیل را انتخاب کنید
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          هر سه سطح رایگان‌اند؛ هرچه عمیق‌تر، تصویر دقیق‌تری از سازمان می‌گیرید.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {LEVELS.map((level, i) => {
            const Icon = LEVEL_ICON[level.id]
            const featured = level.id === "pro"
            return (
              <button
                key={level.id}
                type="button"
                onClick={() => onStart(level.id)}
                className={[
                  "group relative flex flex-col rounded-2xl border p-6 text-right transition-all",
                  "hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  featured
                    ? "border-primary bg-card shadow-md ring-1 ring-primary/20"
                    : "border-border bg-card hover:border-primary/40",
                ].join(" ")}
              >
                {featured && (
                  <span className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    پیشنهاد ما
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <span className="text-xs text-muted-foreground">{level.minutes}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-foreground">{level.title}</h3>
                <p className="mt-1 text-sm font-medium text-primary">{level.tagline}</p>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {level.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  شروع {level.title}
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
                </span>
                <span className="sr-only">{`سطح ${i + 1}`}</span>
              </button>
            )
          })}
        </div>
      </section>

      <footer className="mt-16 text-center text-xs text-muted-foreground">
        پاسخ‌ها به همراه شماره همراه جهت دریافت گزارش در دیتابیس ذخیره می‌شوند.
      </footer>
    </div>
  )
}
