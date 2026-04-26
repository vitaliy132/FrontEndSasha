import type { FormEvent } from 'react'
import { inputClasses, labelClasses, buttonClasses, errorClasses } from './index'
import { Spinner } from './Spinner'

export interface BookingLeadFormProps {
  name: string
  email: string
  phone: string
  address: string
  onChange: (field: 'name' | 'email' | 'phone' | 'address', value: string) => void
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
  address,
  onChange,
  onSubmit,
  loading,
  error,
  success,
  userId,
}: BookingLeadFormProps) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-white p-6 shadow-sm ring-1 ring-emerald-500/10">
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
        <div
          className="mt-4 rounded-lg bg-emerald-50 px-3 py-4 text-sm text-emerald-800 ring-1 ring-emerald-200"
          role="status"
        >
          <p className="font-medium">Thank you! Your request has been received.</p>
          <p className="mt-1">An RV Specialist will be in touch to confirm availability and complete the Rental Reservation with you.</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="lead-name"
              className={labelClasses}
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
              className={inputClasses}
              placeholder="Jane Doe"
              disabled={loading}
            />
          </div>
          <div>
            <label
              htmlFor="lead-email"
              className={labelClasses}
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
              className={inputClasses}
              placeholder="you@company.com"
              disabled={loading}
            />
          </div>
          <div>
            <label
              htmlFor="lead-phone"
              className={labelClasses}
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
              className={inputClasses}
              placeholder="+1 …"
              disabled={loading}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="lead-address"
              className={labelClasses}
            >
              Address
            </label>
            <input
              id="lead-address"
              name="address"
              type="text"
              autoComplete="address"
              value={address}
              onChange={(e) => onChange('address', e.target.value)}
              className={inputClasses}
              placeholder="123 Main St, City, State, ZIP"
              disabled={loading}
            />
          </div>

          {error ? (
            <p
              className={`${errorClasses} sm:col-span-2`}
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={buttonClasses}
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
