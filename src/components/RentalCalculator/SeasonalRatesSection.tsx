const SEASONS = [
  { name: 'Premium', dates: 'Jul 1 – Aug 31' },
  { name: 'Prime', dates: 'Jun 11 – Jun 30 & Sep 1 – Sep 30' },
  { name: 'Shoulder', dates: 'May 15 – Jun 10 & Oct 1 – Oct 25' },
  { name: 'Economy', dates: 'Oct 26 – May 14' },
] as const

export function SeasonalRatesSection() {
  return (
    <div className="mb-6 lg:col-span-12">
      <p className="text-sm font-medium text-slate-700">Seasonal rates apply</p>

      <ul className="mt-2.5 divide-y divide-slate-200/70 sm:hidden">
        {SEASONS.map((season) => (
          <li key={season.name} className="py-2 first:pt-0 last:pb-0">
            <span className="block text-sm font-medium text-slate-700">{season.name}</span>
            <span className="mt-0.5 block text-sm leading-snug text-slate-500">{season.dates}</span>
          </li>
        ))}
      </ul>

      <p className="mt-1 hidden text-sm leading-relaxed text-slate-600 sm:block">
        {SEASONS.map((season, index) => (
          <span key={season.name}>
            {index > 0 ? <span className="text-slate-300"> · </span> : null}
            <span className="font-medium text-slate-700">{season.name}</span>{' '}
            <span className="text-slate-500">({season.dates})</span>
          </span>
        ))}
      </p>
    </div>
  )
}
