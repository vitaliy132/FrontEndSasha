import type { BreakdownLine, RentalQuoteBreakdown } from '../../types/rental'

type Breakdown =
  | BreakdownLine[]
  | Record<string, string | number>
  | RentalQuoteBreakdown
  | undefined

const BREAKDOWN_LABELS: Record<string, string> = {
  days: 'Rental days (calendar)',
  dailyRateTotal: 'Base daily rental',
  extraKm: 'Extra kilometers',
  cdw: 'CDW Plus',
  prepFee: 'Prep fee',
  kmPackages: 'Kilometer packages',
  hitch: 'Trailer hitch',
  generator: 'Generator',
  cancellationWaiver: 'Cancellation waiver',
  windshield: 'Windshield coverage',
  kitchenKit: 'Kitchen kit',
  beddingKit: 'Bedding kit',
  bikeRack: 'Bike rack',
  tax: 'HST (13%)',
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
  if (breakdown_.dailyRateTotal > 0) {
    entries.push(['dailyRateTotal', formatCurrency(breakdown_.dailyRateTotal)])
  }

  // Extra kilometers
  if (breakdown_.extraKm > 0) {
    entries.push(['extraKm', formatCurrency(breakdown_.extraKm)])
  }

  // CDW
  if (breakdown_.cdw > 0) {
    entries.push(['cdw', formatCurrency(breakdown_.cdw)])
  }

  // Prep fee
  if (breakdown_.prepFee > 0) {
    entries.push(['prepFee', formatCurrency(breakdown_.prepFee)])
  }

  // KM packages
  if (breakdown_.kmPackages > 0) {
    entries.push(['kmPackages', formatCurrency(breakdown_.kmPackages)])
  }

  // Hitch
  if (breakdown_.hitch > 0) {
    entries.push(['hitch', formatCurrency(breakdown_.hitch)])
  }

  // Generator
  if (breakdown_.generator > 0) {
    entries.push(['generator', formatCurrency(breakdown_.generator)])
  }

  // Add-ons
  if (breakdown_.cancellationWaiver > 0) {
    entries.push(['cancellationWaiver', formatCurrency(breakdown_.cancellationWaiver)])
  }
  if (breakdown_.windshield > 0) {
    entries.push(['windshield', formatCurrency(breakdown_.windshield)])
  }
  if (breakdown_.kitchenKit > 0) {
    entries.push(['kitchenKit', formatCurrency(breakdown_.kitchenKit)])
  }
  if (breakdown_.beddingKit > 0) {
    entries.push(['beddingKit', formatCurrency(breakdown_.beddingKit)])
  }
  if (breakdown_.bikeRack > 0) {
    entries.push(['bikeRack', formatCurrency(breakdown_.bikeRack)])
  }

  // Tax
  if (breakdown_.tax > 0) {
    entries.push(['tax', formatCurrency(breakdown_.tax)])
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
      </ul>
    </div>
  )
}
