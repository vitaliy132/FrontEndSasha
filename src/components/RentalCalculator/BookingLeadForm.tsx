import type { FormEvent } from 'react'
import { Spinner } from './Spinner'

export interface BookingLeadFormProps {
  name: string
  email: string
  phone: string
  onChange: (field: 'name' | 'email' | 'phone', value: string) => void
  onSubmit: (e: FormEvent) => void
  loading: boolean
  error: string | null
  success: boolean
  userId: string | null
}

export function BookingLeadForm({
  name,
  email,
  phone,
  onChange,
  onSubmit,
  loading,
  error,
  success,
  userId,
}: BookingLeadFormProps) {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white p-6 shadow-sm ring-1 ring-indigo-500/10">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Request booking
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            We&apos;ll reach out using the details below.
          </p>
        </div>
        {userId?.trim() ? (
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
            User #{userId}
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
            No user id (optional)
          </span>
        )}
      </div>

      {success ? (
        <p
          className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 ring-1 ring-emerald-200"
          role="status"
        >
          Thanks — your request was sent. We&apos;ll contact you shortly.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="lead-name"
              className="text-xs font-medium text-slate-700"
            >
              Full name
            </label>
            <input
              id="lead-name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => onChange('name', e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Jane Doe"
              disabled={loading}
            />
          </div>
          <div>
            <label
              htmlFor="lead-email"
              className="text-xs font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="lead-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => onChange('email', e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="you@company.com"
              disabled={loading}
            />
          </div>
          <div>
            <label
              htmlFor="lead-phone"
              className="text-xs font-medium text-slate-700"
            >
              Phone
            </label>
            <input
              id="lead-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => onChange('phone', e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="+1 …"
              disabled={loading}
            />
          </div>

          {error ? (
            <p
              className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 ring-1 ring-red-200"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Spinner className="text-white" />
                  Sending…
                </>
              ) : (
                'Submit request'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
