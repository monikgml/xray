"use client"

import { useState, useEffect, useMemo } from "react"
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  X,
  ChevronRight,
  TrendingUp,
  Users,
  Award,
  Lock,
  Loader2,
  Calendar,
  Phone,
  BarChart3,
  FileSpreadsheet,
  CheckCircle2,
} from "lucide-react"

interface Submission {
  id: number
  phone: string
  level: string
  overall: number
  band: string
  answers: Record<string, number>
  report: {
    overall: number
    band: string
    bandTitle?: string
    interpretation?: string
    dimensions?: Array<{
      id: string
      title: string
      score: number
      band: string
      strengths?: string[]
      weaknesses?: string[]
    }>
    [key: string]: unknown
  }
  created_at: string
}

const LEVEL_LABELS: Record<string, string> = {
  quick: "سریع (۱۲ سوال)",
  standard: "استاندارد (۲۴ سوال)",
  comprehensive: "جامع (۴۸ سوال)",
}

const BAND_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  optimal: { bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-500", label: "بهینه" },
  healthy: { bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-500", label: "سالم" },
  developing: { bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-500", label: "در حال توسعه" },
  vulnerable: { bg: "bg-orange-500/10 border-orange-500/20", text: "text-orange-500", label: "آسیب‌پذیر" },
  critical: { bg: "bg-rose-500/10 border-rose-500/20", text: "text-rose-500", label: "بحرانی" },
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState<string>("")
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [keyInput, setKeyInput] = useState<string>("")
  const [authError, setAuthError] = useState<string | null>(null)

  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevel, setSelectedLevel] = useState<string>("all")
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)

  // Check saved session
  useEffect(() => {
    const saved = sessionStorage.getItem("xray_admin_key")
    if (saved) {
      setAdminKey(saved)
      setIsAuthenticated(true)
      void fetchSubmissions(saved)
    }
  }, [])

  async function fetchSubmissions(key: string) {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/submissions", {
        headers: { "x-admin-key": key },
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401) {
          setIsAuthenticated(false)
          sessionStorage.removeItem("xray_admin_key")
          setAuthError("کلید مدیریت نادرست است.")
          return
        }
        setError(data.error || "خطایی در دریافت اطلاعات رخ داد.")
        return
      }

      setSubmissions(data.submissions || [])
      setIsAuthenticated(true)
      sessionStorage.setItem("xray_admin_key", key)
    } catch {
      setError("خطا در اتصال به سرور.")
    } finally {
      setIsLoading(false)
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setAuthError(null)
    if (!keyInput.trim()) {
      setAuthError("لطفاً کلید امنیتی مدیریت را وارد کنید.")
      return
    }
    setAdminKey(keyInput.trim())
    void fetchSubmissions(keyInput.trim())
  }

  function handleLogout() {
    sessionStorage.removeItem("xray_admin_key")
    setIsAuthenticated(false)
    setAdminKey("")
    setSubmissions([])
  }

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const matchesSearch =
        !searchQuery ||
        sub.phone.includes(searchQuery.trim()) ||
        String(sub.overall).includes(searchQuery.trim())
      const matchesLevel = selectedLevel === "all" || sub.level === selectedLevel
      return matchesSearch && matchesLevel
    })
  }, [submissions, searchQuery, selectedLevel])

  // Statistics
  const stats = useMemo(() => {
    const total = submissions.length
    if (!total) return { total: 0, avgScore: 0, quickCount: 0, standardCount: 0, comprehensiveCount: 0 }
    const sumScore = submissions.reduce((acc, curr) => acc + curr.overall, 0)
    const avgScore = Math.round(sumScore / total)
    const quickCount = submissions.filter((s) => s.level === "quick").length
    const standardCount = submissions.filter((s) => s.level === "standard").length
    const comprehensiveCount = submissions.filter((s) => s.level === "comprehensive").length
    return { total, avgScore, quickCount, standardCount, comprehensiveCount }
  }, [submissions])

  // Export to CSV with UTF-8 BOM
  function exportToCsv() {
    if (!submissions.length) return

    const headers = ["شناسه", "شماره همراه", "سطح آزمون", "نمره کل", "بند بلوغ", "تاریخ ثبت"]
    const rows = filteredSubmissions.map((s) => [
      s.id,
      `="${s.phone}"`,
      LEVEL_LABELS[s.level] || s.level,
      s.overall,
      BAND_COLORS[s.band]?.label || s.band,
      new Date(s.created_at).toLocaleString("fa-IR"),
    ])

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `xray-submissions-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // If not authenticated, show password prompt
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-foreground">ورود به پنل نتایج آزمون</h1>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            جهت مشاهدهٔ نتایج و شماره‌های ثبت‌شده، کلید مدیریت را وارد نمایید. (پیش‌فرض: admin123)
          </p>

          <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4">
            <div>
              <label htmlFor="admin-key" className="block text-xs font-semibold text-foreground">
                کلید امنیتی مدیریت (Admin Key)
              </label>
              <input
                id="admin-key"
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="کلید مدیریت..."
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
            </div>

            {authError && (
              <p className="text-xs font-medium text-destructive">{authError}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  در حال بررسی...
                </>
              ) : (
                "ورود به پنل نتایج"
              )}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground sm:text-lg">پنل نتایج رادیولوژی سازمان (X-Ray)</h1>
              <p className="text-xs text-muted-foreground">مدیریت شرکت‌کنندگان و پاسخ‌های آزمون</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => void fetchSubmissions(adminKey)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent disabled:opacity-50"
              title="بروزرسانی داده‌ها"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">بروزرسانی</span>
            </button>

            <button
              onClick={exportToCsv}
              disabled={!submissions.length}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-600/20 disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              <span>خروجی اکسل (CSV)</span>
            </button>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              خروج
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">کل شرکت‌کنندگان</span>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-black text-foreground">{stats.total}</div>
            <p className="mt-1 text-[11px] text-muted-foreground">ثبت‌شده در دیتابیس</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">میانگین نمره بلوغ</span>
              <Award className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-foreground">{stats.avgScore} <span className="text-sm font-normal text-muted-foreground">/ ۱۰۰</span></div>
            <p className="mt-1 text-[11px] text-muted-foreground">معدل تمام آزمون‌ها</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">آزمون استاندارد / سریع</span>
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-foreground">{stats.standardCount} <span className="text-sm font-normal text-muted-foreground">/ {stats.quickCount}</span></div>
            <p className="mt-1 text-[11px] text-muted-foreground">استاندارد / سریع</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">آزمون جامع</span>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-foreground">{stats.comprehensiveCount}</div>
            <p className="mt-1 text-[11px] text-muted-foreground">آزمون‌های ۴۸ سوالی</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="جستجو با شماره همراه یا نمره..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-card py-2.5 pr-10 pl-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
            >
              <option value="all">همه سطوح آزمون</option>
              <option value="quick">سریع</option>
              <option value="standard">استاندارد</option>
              <option value="comprehensive">جامع</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {error && (
            <div className="p-4 text-xs font-medium text-destructive">{error}</div>
          )}

          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
              <FileSpreadsheet className="h-10 w-10 stroke-[1.5] opacity-50" />
              <p className="mt-2 text-sm font-medium">هیچ نتیجه‌ای یافت نشد.</p>
              <p className="text-xs text-muted-foreground">
                {submissions.length === 0
                  ? "هنوز هیچ آزمونی در سامانه ثبت نشده است."
                  : "با فیلترهای جستجوی فعلی نتیجه‌ای وجود ندارد."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">شماره همراه</th>
                    <th className="px-4 py-3">سطح آزمون</th>
                    <th className="px-4 py-3">نمره کل</th>
                    <th className="px-4 py-3">بند بلوغ</th>
                    <th className="px-4 py-3">زمان ثبت</th>
                    <th className="px-4 py-3 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSubmissions.map((sub) => {
                    const bandInfo = BAND_COLORS[sub.band] || {
                      bg: "bg-muted",
                      text: "text-muted-foreground",
                      label: sub.band,
                    }
                    const formattedDate = new Date(sub.created_at).toLocaleString("fa-IR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })

                    return (
                      <tr key={sub.id} className="transition-colors hover:bg-muted/30">
                        <td className="px-4 py-3 font-mono font-medium text-muted-foreground">
                          {sub.id}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 font-mono font-bold text-foreground" dir="ltr">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {sub.phone}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-muted px-2 py-1 font-medium text-muted-foreground">
                            {LEVEL_LABELS[sub.level] || sub.level}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-12 rounded-full bg-muted h-2 overflow-hidden">
                              <div
                                className="bg-primary h-full"
                                style={{ width: `${Math.min(100, sub.overall)}%` }}
                              />
                            </div>
                            <span className="font-bold text-foreground font-mono">{sub.overall}٪</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${bandInfo.bg} ${bandInfo.text}`}
                          >
                            {bandInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground" dir="ltr">
                          {formattedDate}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setSelectedSubmission(sub)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-primary hover:bg-accent"
                          >
                            <Eye className="h-3 w-3" />
                            مشاهده گزارش
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal / Drawer */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  جزئیات آزمون شرکت‌کننده #{selectedSubmission.id}
                </h2>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span dir="ltr">شماره: {selectedSubmission.phone}</span>
                  <span>•</span>
                  <span>سطح: {LEVEL_LABELS[selectedSubmission.level] || selectedSubmission.level}</span>
                  <span>•</span>
                  <span dir="ltr">{new Date(selectedSubmission.created_at).toLocaleString("fa-IR")}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedSubmission(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Overall Score Banner */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4">
                <div>
                  <span className="text-xs font-medium text-muted-foreground">امتیاز کلی بلوغ</span>
                  <div className="mt-1 text-3xl font-black text-foreground">
                    {selectedSubmission.overall}٪
                  </div>
                </div>
                <div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${
                      BAND_COLORS[selectedSubmission.band]?.bg || "bg-muted"
                    } ${BAND_COLORS[selectedSubmission.band]?.text || "text-foreground"}`}
                  >
                    بند بلوغ: {BAND_COLORS[selectedSubmission.band]?.label || selectedSubmission.band}
                  </span>
                </div>
              </div>

              {/* Dimensions Breakdown */}
              {selectedSubmission.report?.dimensions && selectedSubmission.report.dimensions.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-foreground">نمرات ابعاد مختلف سازمان</h3>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {selectedSubmission.report.dimensions.map((dim) => (
                      <div
                        key={dim.id}
                        className="rounded-xl border border-border bg-background p-3.5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground">{dim.title}</span>
                          <span className="font-mono font-bold text-primary">{dim.score}٪</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${Math.min(100, dim.score)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw Answers */}
              <div>
                <h3 className="text-xs font-bold text-foreground">پاسخ‌های ثبت‌شده (کلید سوال و امتیاز)</h3>
                <div className="mt-3 rounded-xl border border-border bg-background p-4 font-mono text-xs text-muted-foreground">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {Object.entries(selectedSubmission.answers).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between border-b border-border/50 py-1">
                        <span className="font-semibold text-foreground">{key}:</span>
                        <span className="text-primary">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-border px-6 py-3">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
