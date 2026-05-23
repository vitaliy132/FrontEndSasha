import type { FormEvent } from 'react'
import type { LeadFormData, RentalCalculateResponse } from '../../types/rental'
import { BookingLeadForm } from './BookingLeadForm'
import { BreakdownList } from './BreakdownList'
import { Spinner } from './Spinner'

export interface EstimatePanelProps {
  calculating: boolean
  result: RentalCalculateResponse | null
  showBooking: boolean
  leadFormData: LeadFormData
  leadLoading: boolean
  leadError: string | null
  leadSuccess: boolean
  userId: string | null
  onOpenBooking: () => void
  onLeadFieldChange: (field: 'name' | 'email' | 'phone' | 'address', value: string) => void
  onLeadSubmit: (e: FormEvent) => void
}

export function EstimatePanel({
  calculating,
  result,
  showBooking,
  leadFormData,
  leadLoading,
  leadError,
  leadSuccess,
  userId,
  onOpenBooking,
  onLeadFieldChange,
  onLeadSubmit,
}: EstimatePanelProps) {
  return (
    <section className="lg:col-span-7">
      <div className="flex h-full flex-col gap-6">
        <div className="flex-1 rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5 backdrop-blur sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900">Estimate</h2>
          <p className="mt-1 text-sm text-slate-600">
            Results appear here after a successful calculation.
          </p>

          {!result && !calculating ? (
            <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
              <p className="text-sm text-slate-500">
                No estimate yet. Fill the form and click{' '}
                <span className="font-medium text-slate-700">Calculate Rental Price</span>.
              </p>
            </div>
          ) : null}

          {calculating ? (
            <div
              className="mt-10 flex flex-col items-center justify-center gap-3 py-16"
              aria-live="polite"
            >
              <Spinner className="text-emerald-600" />
              <p className="text-sm font-medium text-slate-600">Calculating…</p>
            </div>
          ) : null}

          {result && !calculating ? (
            <div className="mt-6">
              <div className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-lg">
                <p className="text-sm leading-relaxed text-white/85">{result.summaryMessage}</p>
              </div>

              <BreakdownList breakdown={result.breakdown} totalFormatted={result.totalFormatted} />

              <p className="mt-6 rounded-lg border border-slate-200 bg-slate-50/90 px-3 py-3 text-xs leading-relaxed text-slate-600">
                Making a reservation request will only notify us of the request and is not a
                guarantee that the vehicle will be reserved. If you do not hear from us within 24
                hours, please contact us directly to confirm your reservation.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onOpenBooking}
                  className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-200 transition hover:bg-emerald-50"
                >
                  Confirm Availability
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {showBooking && result ? (
          <BookingLeadForm
            name={leadFormData.name}
            email={leadFormData.email}
            phone={leadFormData.phone}
            address={leadFormData.address}
            onChange={onLeadFieldChange}
            onSubmit={onLeadSubmit}
            loading={leadLoading}
            error={leadError}
            success={leadSuccess}
            userId={userId}
          />
        ) : null}
      </div>
    </section>
  )
}
