export function ContactSection() {
  return (
    <section className="mt-12 border-t border-slate-200 pt-8 lg:col-span-12">
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-lg shadow-slate-200/40 ring-1 ring-slate-900/5 backdrop-blur sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">Contact Us</h2>
        <div className="mt-6 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Pick Up/Drop Off Location
          </p>
          <address className="mt-2 block text-sm not-italic leading-relaxed text-slate-700">
            4888 South Service Rd
            <br />
            Beamsville, ON L3J 1L4
          </address>
          <a
            href="tel:905-548-8585"
            className="mt-3 inline-block text-base font-semibold text-emerald-600 hover:text-emerald-700"
          >
            905-548-8585
          </a>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          <div className="min-w-0 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Toll free</p>
            <a
              href="tel:1-888-539-3333"
              className="mt-2 block text-base font-semibold text-emerald-600 hover:text-emerald-700"
            >
              1-888-539-3333
            </a>
          </div>
          <div className="min-w-0 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Call / text
            </p>
            <a
              href="tel:905-548-8585"
              className="mt-2 block text-base font-semibold text-emerald-600 hover:text-emerald-700"
            >
              905-548-8585
            </a>
          </div>
          <div className="min-w-0 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-4 sm:col-span-2 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
            <a
              href="mailto:sales@rvvacations.com"
              className="mt-2 block break-words text-base font-semibold text-emerald-600 hover:text-emerald-700"
            >
              sales@rvvacations.com
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
