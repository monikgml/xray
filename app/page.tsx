"use client"

import { useState } from "react"
import { Landing } from "@/components/landing"
import { Questionnaire } from "@/components/questionnaire"
import { Dashboard } from "@/components/dashboard"
import { buildReport, type Report } from "@/lib/scoring"
import type { LevelId } from "@/lib/questions"

type Phase = "landing" | "quiz" | "result"

export default function Page() {
  const [phase, setPhase] = useState<Phase>("landing")
  const [level, setLevel] = useState<LevelId>("quick")
  const [report, setReport] = useState<Report | null>(null)

  function start(selected: LevelId) {
    setLevel(selected)
    setReport(null)
    setPhase("quiz")
  }

  function complete(answers: Record<string, number>) {
    setReport(buildReport(level, answers))
    setPhase("result")
  }

  function restart() {
    setReport(null)
    setPhase("landing")
  }

  return (
    <main className="min-h-dvh bg-background">
      {phase === "landing" && <Landing onStart={start} />}
      {phase === "quiz" && (
        <Questionnaire level={level} onComplete={complete} onExit={restart} />
      )}
      {phase === "result" && report && (
        <Dashboard report={report} level={level} onRestart={restart} />
      )}
    </main>
  )
}
