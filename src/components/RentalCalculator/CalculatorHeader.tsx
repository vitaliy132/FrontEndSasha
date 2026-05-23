export function CalculatorHeader() {
  return (
    <header className="mb-10 lg:mb-12">
      <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-3 lg:gap-4">
        <div className="text-left">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
            RV Rentals
          </p>
          <p className="mt-3 max-w-md text-base text-slate-600">
            Configure your trip, get an instant quote, and confirm availability.
          </p>
        </div>
        <div className="flex justify-center">
          <img
            src="/logo.svg"
            alt="Company logo"
            className="h-10 w-auto sm:h-12"
            width={459}
            height={97}
          />
        </div>
        <div className="hidden lg:block" aria-hidden="true" />
      </div>
    </header>
  )
}
