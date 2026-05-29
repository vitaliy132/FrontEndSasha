const SEASONS = [
  {
    name: 'Premium',
    periods: ['Jul 1 – Aug 31'],
    accent: 'border-l-rose-400/70',
    label: 'text-rose-700/90',
  },
  {
    name: 'Prime',
    periods: ['Jun 11 – Jun 30', 'Sep 1 – Sep 30'],
    accent: 'border-l-emerald-500/70',
    label: 'text-emerald-700/90',
  },
  {
    name: 'Shoulder',
    periods: ['May 15 – Jun 10', 'Oct 1 – Oct 25'],
    accent: 'border-l-sky-400/70',
    label: 'text-sky-700/90',
  },
  {
    name: 'Economy',
    periods: ['Oct 26 – May 14'],
    accent: 'border-l-slate-400/60',
    label: 'text-slate-600',
  },
] as const

export function SeasonalRatesSection() {
  return (
    <section
      aria-labelledby="seasonal-rates-heading"
      className="mb-8 lg:mb-10"
    >
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-b from-white to-slate-50/40 p-6 shadow-lg shadow-slate-200/30 ring-1 ring-slate-900/[0.03] backdrop-blur sm:p-7">
        <div className="max-w-2xl">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-emerald-600/90">
            Pricing
          </p>
          <h2
            id="seasonal-rates-heading"
            className="mt-2 text-xl font-semibold tracking-tight text-slate-900 sm:text-[1.375rem]"
          >
            Seasonal Rates
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Rates vary throughout the year. Your quote reflects the season for the dates you
            select.
          </p>
        </div>

        <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SEASONS.map((season) => (
            <li
              key={season.name}
              className={`group rounded-xl border border-slate-200/60 bg-white/80 px-4 py-4 shadow-sm shadow-slate-200/20 transition hover:border-slate-300/70 hover:shadow-md hover:shadow-slate-200/30 sm:px-5 sm:py-[1.125rem] border-l-[3px] ${season.accent}`}
            >
              <p
                className={`text-[0.6875rem] font-semibold uppercase tracking-[0.18em] ${season.label}`}
              >
                {season.name}
              </p>
              <div className="mt-3 space-y-2">
                {season.periods.map((period, index) => (
                  <div key={period}>
                    {index > 0 ? (
                      <div
                        className="mb-2 h-px w-6 bg-slate-200/80"
                        aria-hidden="true"
                      />
                    ) : null}
                    <p className="text-sm font-medium leading-snug text-slate-700">{period}</p>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
