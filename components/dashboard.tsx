"use client"

import { BAND_LABEL, type Band, type Report } from "@/lib/scoring"
import { LEVELS, type LevelId } from "@/lib/questions"
import { ScoreRing } from "@/components/score-ring"
import { toFa } from "@/lib/fa"
import {
  TrendingUp,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  ScanLine,
} from "lucide-react"

const BAND_TEXT: Record<Band, string> = {
  healthy: "text-healthy",
  warn: "text-warn",
  risk: "text-risk",
}
const BAND_BG: Record<Band, string> = {
  healthy: "bg-healthy",
  warn: "bg-warn",
  risk: "bg-risk",
}
const BAND_SOFT: Record<Band, string> = {
  healthy: "bg-healthy/10 text-healthy",
  warn: "bg-warn/15 text-warn",
  risk: "bg-risk/10 text-risk",
}

const OVERALL_SUMMARY: Record<Band, string> = {
  healthy:
    "سازمان شما از سلامت خوبی برخوردار است. تمرکز را روی حفظ این وضعیت و بستن معدود نقاط ضعف بگذارید.",
  warn: "سازمان شما در وضعیت قابل‌قبول اما شکننده است. چند بُعد نیازمند توجه جدی‌اند تا به ریسک تبدیل نشوند.",
  risk: "سازمان شما نقاط پرخطر مهمی دارد. رسیدگی به ابعاد بحرانی زیر باید در اولویت فوری قرار گیرد.",
}

export function Dashboard({
  report,
  level,
  onRestart,
}: {
  report: Report
  level: LevelId
  onRestart: () => void
}) {
  const levelMeta = LEVELS.find((l) => l.id === level)!

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">نتیجهٔ اسکن · {levelMeta.title}</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground md:text-3xl">
            رادیولوژی سازمان شما
          </h1>
        </div>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          اسکن دوباره
        </button>
      </div>

      {/* Overall */}
      <section className="mt-6 grid gap-5 rounded-2xl border border-border bg-card p-6 md:grid-cols-[auto_1fr] md:items-center md:gap-8">
        <div className="flex justify-center">
          <ScoreRing value={report.overall} band={report.band} label="امتیاز کل" />
        </div>
        <div>
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${BAND_SOFT[report.band]}`}
          >
            <span className={`h-2 w-2 rounded-full ${BAND_BG[report.band]}`} />
            وضعیت کلی: {BAND_LABEL[report.band]}
          </span>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            {OVERALL_SUMMARY[report.band]}
          </p>
        </div>
      </section>

      {/* Dimension breakdown */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-6">
        <div className="mb-5 flex items-center gap-2">
          <ScanLine className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-bold text-foreground">تفکیک ابعاد سازمان</h2>
        </div>
        <ul className="flex flex-col gap-4">
          {report.dimensions.map((d) => (
            <li key={d.id}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-medium text-foreground">{d.title}</span>
                <span className={`text-sm font-semibold tabular-nums ${BAND_TEXT[d.band]}`}>
                  {toFa(d.score)}
                  <span className="text-muted-foreground"> / ۱۰۰</span>
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${BAND_BG[d.band]} transition-all duration-700`}
                  style={{ width: `${d.score}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Strengths & risks */}
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-healthy" aria-hidden="true" />
            <h2 className="text-lg font-bold text-foreground">نقاط قوت</h2>
          </div>
          <ul className="flex flex-col gap-3">
            {report.strengths.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3">
                <span className="text-foreground">{d.title}</span>
                <span className="rounded-full bg-healthy/10 px-2.5 py-0.5 text-sm font-semibold tabular-nums text-healthy">
                  {toFa(d.score)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-risk" aria-hidden="true" />
            <h2 className="text-lg font-bold text-foreground">نقاط پرخطر</h2>
          </div>
          {report.risks.length ? (
            <ul className="flex flex-col gap-3">
              {report.risks.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3">
                  <span className="text-foreground">{d.title}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-sm font-semibold tabular-nums ${BAND_SOFT[d.band]}`}
                  >
                    {toFa(d.score)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              هیچ بُعد پرخطری شناسایی نشد؛ همهٔ ابعاد در محدودهٔ سالم قرار دارند.
            </p>
          )}
        </section>
      </div>

      {/* Recommended actions */}
      <section className="mt-6 rounded-2xl border border-primary/25 bg-primary/5 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-bold text-foreground">اقدامات پیشنهادی</h2>
        </div>
        {report.actions.length ? (
          <ol className="flex flex-col gap-3">
            {report.actions.map((a, i) => (
              <li key={i} className="flex gap-3 rounded-xl bg-card p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {toFa(i + 1)}
                </span>
                <div>
                  <p className="font-semibold text-foreground">{a.dimension}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{a.text}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            اقدام اصلاحی فوری لازم نیست. برای پایش مستمر، این اسکن را دوره‌ای تکرار کنید.
          </p>
        )}
      </section>

      <footer className="mt-8 text-center text-xs text-muted-foreground">
        این گزارش یک تصویر کیفی از وضعیت سازمان است و جایگزین ارزیابی تخصصی نمی‌شود.
      </footer>
    </div>
  )
}
