import type { FormEvent } from 'react'
import { useState } from 'react'
import { getApiBase, submitLead } from '../../lib/api'
import {
  calculateRentalQuote,
  RentalQuoteError,
} from '../../lib/rentalQuote'
import { validateLeadForm, validateRentalForm } from '../../lib/validation'
import type { RentalCalculateResponse, VehicleType } from '../../types/rental'
import { BookingLeadForm } from './BookingLeadForm'
import { BreakdownList } from './BreakdownList'
import { formatModelLabel, useLeadForm, useRentalForm } from './index'
import { Spinner } from './Spinner'


export function RentalCalculator() {
  const { formData, modelOptions, updateField, updateVehicleType, userId } = useRentalForm()
  const { formData: leadFormData, updateField: updateLeadField } = useLeadForm()

  const apiBase = getApiBase()

  const [calculating, setCalculating] = useState(false)
  const [calcError, setCalcError] = useState<string | null>(null)
  const [result, setResult] = useState<RentalCalculateResponse | null>(null)

  const [showBooking, setShowBooking] = useState(false)
  const [leadLoading, setLeadLoading] = useState(false)
  const [leadError, setLeadError] = useState<string | null>(null)
  const [leadSuccess, setLeadSuccess] = useState(false)

  async function handleCalculate(e: FormEvent) {
    e.preventDefault()
    setCalcError(null)

    const kmPackagesNum = Number(formData.kmPackages)
    const extraKmNum = Number(formData.extraKm)
    const generatorHoursNum = Number(formData.generatorHours)
    const beddingKitPeopleNum = Number(formData.beddingKitPeople)

    const validationError = validateRentalForm({
      startDate: formData.startDate,
      endDate: formData.endDate,
      kmPackages: kmPackagesNum,
      extraKm: extraKmNum,
      generatorHours: generatorHoursNum,
    })
    if (validationError) {
      setCalcError(validationError)
      return
    }

    setCalculating(true)
    try {
      const data = calculateRentalQuote({
        startDate: formData.startDate,
        endDate: formData.endDate,
        vehicleType: formData.vehicleType,
        vehicleModel: formData.vehicleModel,
        cancellationWaiver: formData.cancellationWaiver,
        windshieldCoverage: formData.windshieldCoverage,
        generatorDailyUnlimited: formData.generatorDailyUnlimited,
        kmPackages: kmPackagesNum,
        extraKm: extraKmNum,
        generatorHours: generatorHoursNum,
        kitchenKit: formData.kitchenKit,
        beddingKitPeople: beddingKitPeopleNum,
        bikeRack: formData.bikeRack,
      })
      setResult(data)
    } catch (err) {
      setResult(null)
      const message =
        err instanceof RentalQuoteError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Something went wrong. Try again.'
      setCalcError(message)
    } finally {
      setCalculating(false)
    }
  }

  async function handleLeadSubmit(e: FormEvent) {
    e.preventDefault()
    setLeadError(null)

    const quote = result?.totalFormatted ?? ''
    if (!quote) {
      setLeadError('Calculate a quote first.')
      return
    }

    const err = validateLeadForm({
      name: leadFormData.name,
      email: leadFormData.email,
      phone: leadFormData.phone,
      userId,
    })
    if (err) {
      setLeadError(err)
      return
    }

    setLeadLoading(true)
    try {
      await submitLead({
        userId: userId?.trim() ?? '',
        name: leadFormData.name.trim(),
        email: leadFormData.email.trim(),
        phone: leadFormData.phone.trim(),
        quote,
      })
      setLeadSuccess(true)
    } catch (err) {
      setLeadError(
        err instanceof Error ? err.message : 'Could not submit. Try again.',
      )
    } finally {
      setLeadLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute -right-24 top-40 h-80 w-80 rounded-full bg-violet-400/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <header className="mb-10 text-center lg:mb-12 lg:text-left">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
            Fleet rentals
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Rental calculator
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600 lg:mx-0">
            Configure your trip, get an instant estimate, and request a booking
            in one flow.
          </p>
          <p className="mt-3 text-xs text-slate-500">
            API:{' '}
            <code className="rounded bg-slate-200/60 px-1.5 py-0.5 font-mono text-slate-700">
              {apiBase}
            </code>
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <section className="lg:col-span-5">
            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5 backdrop-blur sm:p-8">
              <h2 className="text-lg font-semibold text-slate-900">
                Trip details
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                All fields are validated before we contact the server.
              </p>

              <form onSubmit={handleCalculate} className="mt-6 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="start-date"
                      className="text-xs font-medium text-slate-700"
                    >
                      Start date
                    </label>
                    <input
                      id="start-date"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => updateField('startDate', e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      disabled={calculating}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="end-date"
                      className="text-xs font-medium text-slate-700"
                    >
                      End date
                    </label>
                    <input
                      id="end-date"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => updateField('endDate', e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      disabled={calculating}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="vehicle-type"
                    className="text-xs font-medium text-slate-700"
                  >
                    Vehicle type
                  </label>
                  <select
                    id="vehicle-type"
                    value={formData.vehicleType}
                    onChange={(e) => {
                      const vt = e.target.value as VehicleType
                      updateVehicleType(vt)
                    }}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    disabled={calculating}
                  >
                    <option value="classA">Class A</option>
                    <option value="classB">Class B</option>
                    <option value="classC">Class C</option>
                    <option value="trailer">Trailer</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="vehicle-model"
                    className="text-xs font-medium text-slate-700"
                  >
                    Vehicle model
                  </label>
                  <select
                    id="vehicle-model"
                    value={formData.vehicleModel}
                    onChange={(e) => updateField('vehicleModel', e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    disabled={calculating}
                  >
                    {modelOptions.map((id: string) => (
                      <option key={id} value={id}>
                        {formatModelLabel(id)}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={formData.cancellationWaiver}
                    onChange={(e) => updateField('cancellationWaiver', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    disabled={calculating}
                  />
                  <span className="text-sm font-medium text-slate-800">
                    Cancellation waiver ($20/day, min $240)
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={formData.windshieldCoverage}
                    onChange={(e) => updateField('windshieldCoverage', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    disabled={calculating}
                  />
                  <span className="text-sm font-medium text-slate-800">
                    Windshield coverage
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={formData.generatorDailyUnlimited}
                    onChange={(e) =>
                      updateField('generatorDailyUnlimited', e.target.checked)
                    }
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    disabled={calculating}
                  />
                  <span className="text-sm font-medium text-slate-800">
                    Generator unlimited ($60/day billed days)
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={formData.kitchenKit}
                    onChange={(e) => updateField('kitchenKit', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    disabled={calculating}
                  />
                  <span className="text-sm font-medium text-slate-800">
                    Kitchen Kit ($85/trip)
                  </span>
                </label>

                <div>
                  <label
                    htmlFor="bedding-kit-people"
                    className="text-xs font-medium text-slate-700"
                  >
                    Bedding Kit ($35/person)
                  </label>
                  <input
                    id="bedding-kit-people"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={formData.beddingKitPeople}
                    onChange={(e) => updateField('beddingKitPeople', e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    disabled={calculating}
                  />
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={formData.bikeRack}
                    onChange={(e) => updateField('bikeRack', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    disabled={calculating}
                  />
                  <span className="text-sm font-medium text-slate-800">
                    Bike Rack
                  </span>
                </label>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor="km-packages"
                      className="text-xs font-medium text-slate-700"
                    >
                      KM packages
                    </label>
                    <input
                      id="km-packages"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      value={formData.kmPackages}
                      onChange={(e) => updateField('kmPackages', e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      disabled={calculating}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="extra-km"
                      className="text-xs font-medium text-slate-700"
                    >
                      Extra KM
                    </label>
                    <input
                      id="extra-km"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      value={formData.extraKm}
                      onChange={(e) => updateField('extraKm', e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      disabled={calculating}
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label
                      htmlFor="generator-hours"
                      className="text-xs font-medium text-slate-700"
                    >
                      Generator hours
                    </label>
                    <input
                      id="generator-hours"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.5"
                      value={formData.generatorHours}
                      onChange={(e) => updateField('generatorHours', e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      disabled={calculating || formData.generatorDailyUnlimited}
                    />
                  </div>
                </div>

                {calcError ? (
                  <p
                    className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 ring-1 ring-red-200"
                    role="alert"
                  >
                    {calcError}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={calculating}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {calculating ? (
                    <>
                      <Spinner className="text-white" />
                      Calculating…
                    </>
                  ) : (
                    'Calculate estimate'
                  )}
                </button>
              </form>
            </div>
          </section>

          <section className="lg:col-span-7">
            <div className="flex h-full flex-col gap-6">
              <div className="flex-1 rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5 backdrop-blur sm:p-8">
                <h2 className="text-lg font-semibold text-slate-900">
                  Estimate
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Results appear here after a successful calculation.
                </p>

                {!result && !calculating ? (
                  <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
                    <p className="text-sm text-slate-500">
                      No estimate yet. Fill the form and click{' '}
                      <span className="font-medium text-slate-700">
                        Calculate estimate
                      </span>
                      .
                    </p>
                  </div>
                ) : null}

                {calculating ? (
                  <div
                    className="mt-10 flex flex-col items-center justify-center gap-3 py-16"
                    aria-live="polite"
                  >
                    <Spinner className="text-indigo-600" />
                    <p className="text-sm font-medium text-slate-600">
                      Calculating…
                    </p>
                  </div>
                ) : null}

                {result && !calculating ? (
                  <div className="mt-6">
                    <div className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-lg">
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70">
                        Total
                      </p>
                      <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                        {result.totalFormatted}
                      </p>
                      <p className="mt-4 text-sm leading-relaxed text-white/85">
                        {result.summaryMessage}
                      </p>
                    </div>

                    <BreakdownList breakdown={result.breakdown} />

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowBooking(true)
                          setLeadSuccess(false)
                          setLeadError(null)
                        }}
                        className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm ring-1 ring-indigo-200 transition hover:bg-indigo-50"
                      >
                        Request booking
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
                  onChange={updateLeadField}
                  onSubmit={handleLeadSubmit}
                  loading={leadLoading}
                  error={leadError}
                  success={leadSuccess}
                  userId={userId}
                />
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
