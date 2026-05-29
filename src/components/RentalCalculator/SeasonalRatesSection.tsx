const SEASONS = [
  { name: 'Premium', dates: 'Jul 1 – Aug 31' },
  { name: 'Prime', dates: 'Jun 11 – Jun 30 & Sep 1 – Sep 30' },
  { name: 'Shoulder', dates: 'May 15 – Jun 10 & Oct 1 – Oct 25' },
  { name: 'Economy', dates: 'Oct 26 – May 14' },
] as const

export function SeasonalRatesSection() {
  return (
    <p className="mb-6 text-sm leading-relaxed text-slate-600 lg:col-span-12">
      <span className="font-medium text-slate-700">Seasonal rates apply — </span>
      {SEASONS.map((season, index) => (
        <span key={season.name}>
          {index > 0 ? <span className="text-slate-300"> · </span> : null}
          <span className="text-slate-700">{season.name}</span>{' '}
          <span className="text-slate-500">({season.dates})</span>
        </span>
      ))}
    </p>
  )
}
