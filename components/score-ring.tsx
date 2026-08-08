import type { Band } from "@/lib/scoring"
import { toFa } from "@/lib/fa"

const BAND_COLOR: Record<Band, string> = {
  healthy: "var(--healthy)",
  warn: "var(--warn)",
  risk: "var(--risk)",
}

export function ScoreRing({
  value,
  band,
  size = 176,
  label,
}: {
  value: number
  band: Band
  size?: number
  label?: string
}) {
  const stroke = 14
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c
  const color = BAND_COLOR[band]

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 900ms ease-out" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold tabular-nums text-foreground">{toFa(value)}</span>
        {label ? <span className="mt-1 text-xs text-muted-foreground">{label}</span> : null}
      </div>
    </div>
  )
}
