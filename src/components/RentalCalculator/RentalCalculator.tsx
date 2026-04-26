import type { ChangeEvent, FormEvent } from 'react'
import { useState } from 'react'
import { getApiBase, submitLead, calculateRental } from '../../lib/api'
import { validateLeadForm, validateRentalForm } from '../../lib/validation'
import type { RentalCalculateResponse, VehicleType } from '../../types/rental'
import type { RentalFormData } from './useRentalForm'
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

    const beddingKitPeopleNum = Number(formData.beddingKitPeople)

    const validationError = validateRentalForm({
      startDate: formData.startDate,
      endDate: formData.endDate,
      vehicleType: formData.vehicleType,
      vehicleModel: formData.vehicleModel,
    })
    if (validationError) {
      setCalcError(validationError)
      return
    }

    // Calculate selected days and enforce minimum 5 days
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    const selectedDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1 // inclusive days
    const chargedDays = Math.max(selectedDays, 5)

    // Adjust endDate if necessary to ensure at least 5 days
    const adjustedEndDate = new Date(start)
    adjustedEndDate.setDate(start.getDate() + chargedDays - 1) // -1 because inclusive

    setCalculating(true)
    try {
      // Convert new form fields to API fields
      const kmPackagesNum = formData.vehicleType === 'trailer' ? 0 : Number(formData.mileagePackage)
      const extraKmNum = 0
      const generatorDailyUnlimited = formData.generatorType === 'dailyUnlimited'

      const data = await calculateRental({
        startDate: formData.startDate,
        endDate: adjustedEndDate.toISOString().split('T')[0], // Use adjusted end date
        vehicleType: formData.vehicleType,
        vehicleModel: formData.vehicleModel,
        cancellationWaiver: formData.cancellationWaiver,
        windshieldCoverage: formData.windshieldCoverage,
        generatorDailyUnlimited,
        kmPackages: kmPackagesNum,
        extraKm: extraKmNum,
        kitchenKit: formData.kitchenKit,
        beddingKitPeople: beddingKitPeopleNum,
        bikeRack: false,
      })
      setResult(data)
    } catch (err) {
      setResult(null)
      const message = err instanceof Error ? err.message : 'Something went wrong. Try again.'
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
      address: leadFormData.address,
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
        address: leadFormData.address.trim(),
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
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -right-24 top-40 h-80 w-80 rounded-full bg-lime-400/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-teal-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <header className="mb-10 text-center lg:mb-12 lg:text-left">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
            Fleet rentals
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Rental Quote Calculator
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600 lg:mx-0">
            Configure your trip, get an instant quote, and confirm availability.
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
                      className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
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
                      className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      disabled={calculating}
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-3">
                  <p className="text-xs font-medium text-amber-900">
                    Minimum rental price: 5 days, shorter rentals will be charged a 5 day minimum rental price
                  </p>
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
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
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
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
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
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
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
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    disabled={calculating}
                  />
                  <span className="text-sm font-medium text-slate-800">
                    Windshield coverage
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={formData.kitchenKit}
                    onChange={(e) => updateField('kitchenKit', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    disabled={calculating}
                  />
                  <span className="text-sm font-medium text-slate-800">
                    Kitchen Kit ($85/trip) <span title="Includes cookware, utensils, dishes, cups, and basic kitchen essentials.">ℹ️</span>
                  </span>
                </label>

                <div>
                  <label
                    htmlFor="bedding-kit-people"
                    className="text-xs font-medium text-slate-700"
                  >
                    Bedding Kit ($35/person) <span title="Includes bedding essentials such as sheets, pillows, blankets, and pillowcases.">ℹ️</span>
                  </label>
                  <input
                    id="bedding-kit-people"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={formData.beddingKitPeople}
                    onChange={(e) => updateField('beddingKitPeople', e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    disabled={calculating}
                  />
                </div>

                {/* Mileage Options */}
                {formData.vehicleType !== 'trailer' && (
                  <div>
                    <label
                      htmlFor="mileage-type"
                      className="text-xs font-medium text-slate-700"
                    >
                      Quantity of 1,000km packages ($350 each)
                    </label>
                    <select
                      id="mileage-type"
                      value={formData.mileagePackage}
                      onChange={(e) => updateField('mileagePackage', e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      disabled={calculating}
                    >
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                    <p className="mt-1 text-xs text-slate-600">
                      Additional kms are $0.41 per km, charged at drop off
                    </p>
                  </div>
                )}

                {/* Generator Options */}
                <fieldset className="space-y-3">
                  <legend className="text-xs font-medium text-slate-700">
                    Generator options
                  </legend>
                  <div className="space-y-2">
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 transition hover:bg-slate-50">
                      <input
                        type="radio"
                        name="generator"
                        value="none"
                        checked={formData.generatorType === 'none'}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('generatorType', e.target.value as RentalFormData['generatorType'])}
                        className="h-4 w-4 border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        disabled={calculating}
                      />
                      <span className="text-sm font-medium text-slate-800">
                        None ($0)
                      </span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 transition hover:bg-slate-50">
                      <input
                        type="radio"
                        name="generator"
                        value="dailyUnlimited"
                        checked={formData.generatorType === 'dailyUnlimited'}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('generatorType', e.target.value as RentalFormData['generatorType'])}
                        className="h-4 w-4 border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        disabled={calculating}
                      />
                      <span className="text-sm font-medium text-slate-800">
                        Daily unlimited ($60/day)
                      </span>
                    </label>
                  </div>
                </fieldset>
                <p className="text-xs text-slate-600">
                  Generator is charged upon drop off at $5 per hour of use.
                </p>

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
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {calculating ? (
                    <>
                      <Spinner className="text-white" />
                      Calculating…
                    </>
                  ) : (
                    'Calculate Rental Price'
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
                        Calculate Rental Price
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
                    <Spinner className="text-emerald-600" />
                    <p className="text-sm font-medium text-slate-600">
                      Calculating…
                    </p>
                  </div>
                ) : null}

                {result && !calculating ? (
                  <div className="mt-6">
                    <div className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-lg">
                      <p className="text-sm leading-relaxed text-white/85">
                        Your estimated price for this rental is {result.totalFormatted}.
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-white/85">
                        This includes the daily rental rate, CDW Plus (Collision Damage Waiver), preparation fee, kilometer packages where applicable, taxes, a full tank of propane, and a full demonstration of the vehicle, as listed in the breakdown below.
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-white/85">
                        A $3000 security deposit is required at pickup.
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
