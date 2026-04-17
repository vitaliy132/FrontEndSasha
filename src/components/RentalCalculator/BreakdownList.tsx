import type { BreakdownLine, RentalQuoteBreakdown } from '../../types/rental'

type Breakdown =
  | BreakdownLine[]
  | Record<string, string | number>
  | RentalQuoteBreakdown
  | undefined

const BREAKDOWN_LABELS: Record<string, string> = {
  days: 'Rental days (calendar)',
  dailyRateTotal: 'Base Rental (daily rates)',
  extraKm: 'Mileage',
  cdw: 'CDW (mandatory)',
  prepFee: 'Preparation Fee',
  kmPackages: 'Kilometer packages',
  hitch: 'Trailer Hitch',
  generator: 'Generator',
  cancellationWaiver: 'Cancellation Waiver',
  windshield: 'Windshield Coverage',
  kitchenKit: 'Kitchen Kit',
  beddingKit: 'Bedding Kit',
  bikeRack: 'Bike Rack',
  tax: 'HST (13%)',
  subtotal: 'Subtotal',
}

function formatLine(line: BreakdownLine): string {
  return line.amount ?? line.value ?? '—'
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`
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

  // Handle RentalQuoteBreakdown object
  const breakdown_ = breakdown as RentalQuoteBreakdown
  const entries: Array<[string, string | number]> = []

  // Days
  entries.push(['days', breakdown_.days])
  
  // Base daily rental rate
  entries.push(['dailyRateTotal', formatCurrency(breakdown_.dailyRateTotal)])

  // CDW (always show, required)
  entries.push(['cdw', formatCurrency(breakdown_.cdw)])

  // Prep fee
  entries.push(['prepFee', formatCurrency(breakdown_.prepFee)])

  // Kilometer packages
  if (breakdown_.kmPackages > 0) {
    entries.push(['kmPackages', formatCurrency(breakdown_.kmPackages)])
  }

  // Mileage
  if (breakdown_.extraKm > 0) {
    entries.push(['extraKm', formatCurrency(breakdown_.extraKm)])
  }

  // Cancellation Waiver
  entries.push(['cancellationWaiver', formatCurrency(breakdown_.cancellationWaiver)])

  // Windshield Coverage
  entries.push(['windshield', formatCurrency(breakdown_.windshield)])

  // Generator
  entries.push(['generator', formatCurrency(breakdown_.generator)])

  // Trailer Hitch (show only if > 0 for non-trailer vehicles)
  if (breakdown_.hitch > 0) {
    entries.push(['hitch', formatCurrency(breakdown_.hitch)])
  }

  // Kitchen Kit
  if (breakdown_.kitchenKit > 0) {
    entries.push(['kitchenKit', formatCurrency(breakdown_.kitchenKit)])
  }

  // Bedding Kit
  if (breakdown_.beddingKit > 0) {
    entries.push(['beddingKit', formatCurrency(breakdown_.beddingKit)])
  }

  // Bike Rack
  if (breakdown_.bikeRack > 0) {
    entries.push(['bikeRack', formatCurrency(breakdown_.bikeRack)])
  }

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
            <span className="text-slate-600">
              {BREAKDOWN_LABELS[label] ?? label}
            </span>
            <span className="shrink-0 font-medium tabular-nums text-slate-900">
              {String(value)}
            </span>
          </li>
        ))}
        {breakdown_.tax > 0 && (
          <>
            <li className="flex items-start justify-between gap-4 border-t border-slate-200 pt-2 text-sm font-semibold text-slate-900">
              <span className="text-slate-700">{BREAKDOWN_LABELS['tax']}</span>
              <span className="shrink-0 tabular-nums">
                {formatCurrency(breakdown_.tax)}
              </span>
            </li>
          </>
        )}
      </ul>
    </div>
  )
}
