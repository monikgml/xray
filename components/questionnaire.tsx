"use client"

import { useMemo, useState } from "react"
import {
  ANSWER_OPTIONS,
  DIMENSIONS,
  LEVELS,
  getQuestionsForLevel,
  type LevelId,
} from "@/lib/questions"
import { ArrowRight, ArrowLeft, Check } from "lucide-react"
import { toFa } from "@/lib/fa"

export function Questionnaire({
  level,
  onComplete,
  onExit,
}: {
  level: LevelId
  onComplete: (answers: Record<string, number>) => void
  onExit: () => void
}) {
  const questions = useMemo(() => getQuestionsForLevel(level), [level])
  const levelMeta = LEVELS.find((l) => l.id === level)!
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})

  const current = questions[index]
  const dim = DIMENSIONS.find((d) => d.id === current.dimension)!
  const total = questions.length
  const answeredCount = Object.keys(answers).length
  const progress = Math.round((answeredCount / total) * 100)
  const selected = answers[current.id]

  function choose(value: number) {
    const next = { ...answers, [current.id]: value }
    setAnswers(next)
    // auto-advance shortly after selecting
    window.setTimeout(() => {
      if (index < total - 1) {
        setIndex((i) => i + 1)
      } else {
        onComplete(next)
      }
    }, 220)
  }

  function goNext() {
    if (index < total - 1) setIndex((i) => i + 1)
    else onComplete(answers)
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-5 py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onExit}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          انصراف
        </button>
        <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
          {levelMeta.title}
        </span>
      </div>

      {/* Progress */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            پرسش {toFa(index + 1)} از {toFa(total)}
          </span>
          <span className="tabular-nums">{toFa(progress)}٪ تکمیل</span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${Math.max(progress, (index / total) * 100)}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="mt-10 flex flex-1 flex-col justify-center">
        <p className="text-sm font-medium text-primary">{dim.title}</p>
        <h2 className="mt-3 text-balance text-2xl font-bold leading-snug text-foreground md:text-3xl">
          {current.text}
        </h2>

        <fieldset className="mt-8">
          <legend className="sr-only">میزان موافقت خود را انتخاب کنید</legend>
          <div className="flex flex-col gap-3">
            {ANSWER_OPTIONS.map((opt) => {
              const active = selected === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => choose(opt.value)}
                  className={[
                    "flex items-center justify-between rounded-xl border px-5 py-4 text-right transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent/40",
                  ].join(" ")}
                >
                  <span className="font-medium">{opt.label}</span>
                  <span
                    className={[
                      "flex h-6 w-6 items-center justify-center rounded-full border",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-transparent",
                    ].join(" ")}
                  >
                    <Check className="h-4 w-4" aria-hidden="true" />
                  </span>
                </button>
              )
            })}
          </div>
        </fieldset>
      </div>

      {/* Nav */}
      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
          قبلی
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={selected === undefined}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {index === total - 1 ? "مشاهدهٔ نتیجه" : "بعدی"}
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
