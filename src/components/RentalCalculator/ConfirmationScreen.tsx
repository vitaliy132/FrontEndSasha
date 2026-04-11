import { format, parseISO } from 'date-fns'

export interface ConfirmationScreenProps {
  total: string
  unit: string
  startDate: string
  endDate: string
  name: string
  onClose: () => void
}

export function ConfirmationScreen({
  total,
  unit,
  startDate,
  endDate,
  name,
  onClose,
}: ConfirmationScreenProps) {
  const start = parseISO(startDate)
  const end = parseISO(endDate)
  const formattedStart = format(start, 'MMM d, yyyy')
  const formattedEnd = format(end, 'MMM d, yyyy')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex justify-center">
          <div className="rounded-full bg-emerald-100 p-4">
            <svg
              className="h-8 w-8 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="mt-6 text-center text-2xl font-bold text-slate-900">
          Thank you!
        </h1>
        <p className="mt-2 text-center text-slate-600">
          Your reservation request has been submitted successfully.
        </p>

        <div className="mt-8 space-y-4 rounded-xl bg-slate-50 p-5">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-slate-600">Vehicle</span>
            <span className="text-sm font-semibold text-slate-900">{unit}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-slate-600">Dates</span>
            <span className="text-sm font-semibold text-slate-900">
              {formattedStart} – {formattedEnd}
            </span>
          </div>
          <div className="border-t border-slate-200 pt-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-slate-600">Total</span>
              <span className="text-lg font-bold text-indigo-600">{total}</span>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          We'll contact <span className="font-medium text-slate-900">{name}</span> shortly to confirm details and arrange payment.
        </p>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
        >
          Close
        </button>
      </div>
    </div>
  )
}
