import type { BreakdownLine } from '../../types/rental'

type Breakdown = BreakdownLine[] | Record<string, string | number> | undefined

function formatLine(line: BreakdownLine): string {
  return line.amount ?? line.value ?? '—'
}

export function BreakdownList({ breakdown }: { breakdown: Breakdown }) {
  if (!breakdown) return null

  if (Array.isArray(breakdown)) {
    if (breakdown.length === 0) return null
    return (
      <div className="mt-5 border-t border-slate-100 pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Breakdown
        </h3>
        <ul className="mt-3 space-y-2">
          {breakdown.map((line, i) => (
            <li
              key={`${line.label}-${i}`}
              className="flex items-start justify-between gap-4 text-sm text-slate-700"
            >
              <span className="text-slate-600">{line.label}</span>
              <span className="shrink-0 font-medium tabular-nums text-slate-900">
                {formatLine(line)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  const entries = Object.entries(breakdown)
  if (entries.length === 0) return null

  return (
    <div className="mt-5 border-t border-slate-100 pt-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Breakdown
      </h3>
      <ul className="mt-3 space-y-2">
        {entries.map(([label, value]) => (
          <li
            key={label}
            className="flex items-start justify-between gap-4 text-sm text-slate-700"
          >
            <span className="text-slate-600">{label}</span>
            <span className="shrink-0 font-medium tabular-nums text-slate-900">
              {String(value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
