const SEASONS = [
  {
    name: 'Premium',
    periods: ['Jul 1 – Aug 31'],
    badgeClass: 'bg-rose-100 text-rose-800 ring-rose-200/80',
    dotClass: 'bg-rose-500',
  },
  {
    name: 'Prime',
    periods: ['Jun 11 – Jun 30', 'Sep 1 – Sep 30'],
    badgeClass: 'bg-emerald-100 text-emerald-800 ring-emerald-200/80',
    dotClass: 'bg-emerald-500',
  },
  {
    name: 'Shoulder',
    periods: ['May 15 – Jun 10', 'Oct 1 – Oct 25'],
    badgeClass: 'bg-sky-100 text-sky-800 ring-sky-200/80',
    dotClass: 'bg-sky-500',
  },
  {
    name: 'Economy',
    periods: ['Oct 26 – May 14'],
    badgeClass: 'bg-slate-100 text-slate-700 ring-slate-200/80',
    dotClass: 'bg-slate-400',
  },
] as const

export function SeasonalRatesSection() {
  return (
    <section
      aria-labelledby="seasonal-rates-heading"
      className="mb-8 lg:mb-10"
    >
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-lg shadow-slate-200/40 ring-1 ring-slate-900/5 backdrop-blur sm:p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <h2
              id="seasonal-rates-heading"
              className="text-lg font-semibold text-slate-900"
            >
              Seasonal Rates
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Rental pricing varies by season. Your quote reflects the rates for the dates you
              select below.
            </p>
          </div>
        </div>

        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SEASONS.map((season) => (
            <li
              key={season.name}
              className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3.5"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${season.dotClass}`}
                  aria-hidden="true"
                />
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${season.badgeClass}`}
                >
                  {season.name}
                </span>
              </div>
              <ul className="mt-2.5 space-y-1">
                {season.periods.map((period) => (
                  <li key={period} className="text-sm leading-snug text-slate-700">
                    {period}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
