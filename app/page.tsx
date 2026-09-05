"use client"

import { useState } from "react"
import { Landing } from "@/components/landing"
import { Questionnaire } from "@/components/questionnaire"
import { PhoneForm } from "@/components/phone-form"
import { Dashboard } from "@/components/dashboard"
import type { Report } from "@/lib/scoring"
import type { LevelId } from "@/lib/questions"

type Phase = "landing" | "quiz" | "phone" | "result"

export default function Page() {
  const [phase, setPhase] = useState<Phase>("landing")
  const [level, setLevel] = useState<LevelId>("quick")
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [report, setReport] = useState<Report | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  function start(selected: LevelId) {
    setLevel(selected)
    setAnswers({})
    setReport(null)
    setApiError(null)
    setPhase("quiz")
  }

  function completeQuiz(quizAnswers: Record<string, number>) {
    setAnswers(quizAnswers)
    setApiError(null)
    setPhase("phone")
  }

  async function handlePhoneSubmit(phone: string, code: string) {
    setIsSubmitting(true)
    setApiError(null)

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, level, answers }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setApiError(data.error || "خطایی در ثبت اطلاعات رخ داد. لطفاً مجدداً تلاش کنید.")
        return
      }

      setReport(data.report)
      setPhase("result")
    } catch {
      setApiError("خطایی در ارتباط با سرور رخ داد. لطفاً مجدداً تلاش کنید.")
    } finally {
      setIsSubmitting(false)
    }
  }

  function restart() {
    setReport(null)
    setAnswers({})
    setApiError(null)
    setPhase("landing")
  }

  return (
    <main className="min-h-dvh bg-background">
      {phase === "landing" && <Landing onStart={start} />}
      {phase === "quiz" && (
        <Questionnaire level={level} onComplete={completeQuiz} onExit={restart} />
      )}
      {phase === "phone" && (
        <PhoneForm
          onSubmit={handlePhoneSubmit}
          onBack={() => setPhase("quiz")}
          isSubmitting={isSubmitting}
          apiError={apiError}
        />
      )}
      {phase === "result" && report && (
        <Dashboard report={report} level={level} onRestart={restart} />
      )}
    </main>
  )
}
