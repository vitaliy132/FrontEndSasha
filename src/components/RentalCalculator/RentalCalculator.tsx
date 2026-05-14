import type { ChangeEvent, FormEvent } from 'react'
import { useState } from 'react'
import { submitLead, calculateRental } from '../../lib/api'
import { buildSubmitLeadRequest } from '../../lib/submitLeadPayload'
import { validateLeadForm, validateRentalForm } from '../../lib/validation'
import type { RentalCalculateResponse, VehicleType } from '../../types/rental'
import type { RentalFormData } from './useRentalForm'
import { VEHICLE_TYPES, VEHICLE_TYPE_LABEL } from '../../lib/vehicleTypes'
import { BookingLeadForm } from './BookingLeadForm'
import { BreakdownList } from './BreakdownList'
import {
  buildRentalCalculateRequest,
  formatModelLabel,
  inputClasses,
  labelClasses,
  checkboxClasses,
  checkboxLabelClasses,
  radioLabelClasses,
  buttonClasses,
  errorClasses,
} from './utils'
import { useLeadForm } from './useLeadForm'
import { useRentalForm } from './useRentalForm'
import { Spinner } from './Spinner'


export function RentalCalculator() {
  const { formData, modelOptions, updateField, updateVehicleType, userId } = useRentalForm()
  const { formData: leadFormData, updateField: updateLeadField } = useLeadForm()

  const [calculating, setCalculating] = useState(false)
  const [calcError, setCalcError] = useState<string | null>(null)
  const [result, setResult] = useState<RentalCalculateResponse | null>(null)

  const [showBooking, setShowBooking] = useState(false)
  const [leadLoading, setLeadLoading] = useState(false)
  const [leadError, setLeadError] = useState<string | null>(null)
  const [leadSuccess, setLeadSuccess] = useState(false)

  const [showKitchenTooltip, setShowKitchenTooltip] = useState(false)
  const [showBeddingTooltip, setShowBeddingTooltip] = useState(false)
  const selectedDays = (() => {
    if (!formData.startDate || !formData.endDate) return null
    const start = new Date(`${formData.startDate}T00:00:00`)
    const end = new Date(`${formData.endDate}T00:00:00`)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
    if (end <= start) return null
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  })()

  const tooShortRental = selectedDays !== null && selectedDays < 5

  async function handleCalculate(e: FormEvent) {
    e.preventDefault()
    setCalcError(null)

    if (tooShortRental) {
      setCalcError('Minimum rental period is 5 days. Please pick a longer date range.')
      return
    }

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

    setCalculating(true)
    try {
      const data = await calculateRental(buildRentalCalculateRequest(formData))
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
      await submitLead(
        buildSubmitLeadRequest({
          userId: userId?.trim() ?? '',
          name: leadFormData.name.trim(),
          email: leadFormData.email.trim(),
          phone: leadFormData.phone.trim(),
          address: leadFormData.address.trim(),
          quote,
          rental: formData,
          vehicleModelLabel: formatModelLabel(formData.vehicleModel, formData.vehicleType),
          result,
        }),
      )
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
                      className={labelClasses}
                    >
                      Start date
                    </label>
                    <input
                      id="start-date"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => updateField('startDate', e.target.value)}
                      className={inputClasses}
                      disabled={calculating}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="end-date"
                      className={labelClasses}
                    >
                      End date
                    </label>
                    <input
                      id="end-date"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => updateField('endDate', e.target.value)}
                      className={inputClasses}
                      disabled={calculating}
                    />
                  </div>
                </div>

                {tooShortRental ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-3">
                    <p className="text-xs font-medium text-amber-900">
                      Minimum rental period is 5 days. Please pick a longer date range to continue.
                    </p>
                  </div>
                ) : null}

                <div>
                  <label
                    htmlFor="vehicle-type"
                    className={labelClasses}
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
                    className={inputClasses}
                    disabled={calculating}
                  >
                    {VEHICLE_TYPES.map(vt => (
                      <option key={vt} value={vt}>
                        {VEHICLE_TYPE_LABEL[vt]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="vehicle-model"
                    className={labelClasses}
                  >
                    Vehicle model
                  </label>
                  <select
                    id="vehicle-model"
                    value={formData.vehicleModel}
                    onChange={(e) => updateField('vehicleModel', e.target.value)}
                    className={inputClasses}
                    disabled={calculating}
                  >
                    {modelOptions.map((id: string) => (
                      <option key={id} value={id}>
                        {formatModelLabel(id, formData.vehicleType)}
                      </option>
                    ))}
                  </select>
                </div>

                <label className={checkboxLabelClasses}>
                  <input
                    type="checkbox"
                    checked={formData.cancellationWaiver}
                    onChange={(e) => updateField('cancellationWaiver', e.target.checked)}
                    className={checkboxClasses}
                    disabled={calculating}
                  />
                  <span className="text-sm font-medium text-slate-800">
                    Cancellation waiver ($20/day, min $240)
                  </span>
                </label>

                <label className={checkboxLabelClasses}>
                  <input
                    type="checkbox"
                    checked={formData.windshieldCoverage}
                    onChange={(e) => updateField('windshieldCoverage', e.target.checked)}
                    className={checkboxClasses}
                    disabled={calculating}
                  />
                  <span className="text-sm font-medium text-slate-800">
                    Windshield coverage
                  </span>
                </label>

                <label className={checkboxLabelClasses}>
                  <input
                    type="checkbox"
                    checked={formData.kitchenKit}
                    onChange={(e) => updateField('kitchenKit', e.target.checked)}
                    className={checkboxClasses}
                    disabled={calculating}
                  />
                  <span className="text-sm font-medium text-slate-800">
                    Kitchen Kit ($85/trip) <span 
                      className="info-icon" 
                      onMouseEnter={() => setShowKitchenTooltip(true)}
                      onMouseLeave={() => setShowKitchenTooltip(false)}
                    >ℹ️</span>
                    {showKitchenTooltip && (
                      <div className="absolute z-10 mt-1 w-64 rounded-md bg-slate-50 p-3 text-sm text-slate-900 shadow-lg border border-slate-200">
                        <ul className="space-y-1">
                          <li>Toaster</li>
                          <li>Pots with lids</li>
                          <li>Frying pan</li>
                          <li>Kettle</li>
                          <li>Coffee / tea pot</li>
                          <li>Carving knife</li>
                          <li>Tongs</li>
                          <li>Oven mitts</li>
                          <li>Salt & pepper shakers</li>
                          <li>Mixing bowls</li>
                          <li>Measuring cups</li>
                          <li>Wooden spoons</li>
                          <li>Tea towels</li>
                          <li>Dish cloths</li>
                        </ul>
                      </div>
                    )}
                  </span>
                </label>

                <div>
                  <label
                    htmlFor="bedding-kit-people"
                    className={labelClasses}
                  >
                    Personal Kit ($35/person) <span 
                      className="info-icon" 
                      onMouseEnter={() => setShowBeddingTooltip(true)}
                      onMouseLeave={() => setShowBeddingTooltip(false)}
                    >ℹ️</span>
                    {showBeddingTooltip && (
                      <div className="absolute z-10 mt-1 w-64 rounded-md bg-slate-50 p-3 text-sm text-slate-900 shadow-lg border border-slate-200">
                        <ul className="space-y-1">
                          <li>Blanket</li>
                          <li>Bottom sheet</li>
                          <li>Top sheet</li>
                          <li>Pillow + pillowcase</li>
                          <li>Face cloth</li>
                          <li>Hand towel</li>
                          <li>Bath towel</li>
                          <li>Hanger</li>
                        </ul>
                      </div>
                    )}
                  </label>
                  <input
                    id="bedding-kit-people"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={formData.beddingKitPeople}
                    onChange={(e) => updateField('beddingKitPeople', e.target.value)}
                    className={inputClasses}
                    disabled={calculating}
                  />
                </div>

                {/* Mileage Options */}
                {formData.vehicleType !== 'trailer' && (
                  <div>
                    <label
                      htmlFor="mileage-type"
                      className={labelClasses}
                    >
                      Quantity of 1,000km packages ($350 each)
                    </label>
                    <select
                      id="mileage-type"
                      value={formData.mileagePackage}
                      onChange={(e) => updateField('mileagePackage', e.target.value)}
                      className={inputClasses}
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
                  <legend className={labelClasses}>
                    Generator options
                  </legend>
                  <div className="space-y-2">
                    <label className={radioLabelClasses}>
                      <input
                        type="radio"
                        name="generator"
                        value="none"
                        checked={formData.generatorType === 'none'}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('generatorType', e.target.value as RentalFormData['generatorType'])}
                        className={checkboxClasses}
                        disabled={calculating}
                      />
                      <span className="text-sm font-medium text-slate-800">
                        None ($0)
                      </span>
                    </label>
                    <label className={radioLabelClasses}>
                      <input
                        type="radio"
                        name="generator"
                        value="dailyUnlimited"
                        checked={formData.generatorType === 'dailyUnlimited'}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('generatorType', e.target.value as RentalFormData['generatorType'])}
                        className={checkboxClasses}
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
                    className={errorClasses}
                    role="alert"
                  >
                    {calcError}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={calculating || tooShortRental}
                  aria-disabled={calculating || tooShortRental}
                  title={tooShortRental ? 'Minimum rental period is 5 days' : undefined}
                  className={`${buttonClasses} w-full disabled:cursor-not-allowed disabled:opacity-60`}
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
                        {result.summaryMessage}
                      </p>
                    </div>

                    <BreakdownList breakdown={result.breakdown} totalFormatted={result.totalFormatted} />

                    <p className="mt-6 rounded-lg border border-slate-200 bg-slate-50/90 px-3 py-3 text-xs leading-relaxed text-slate-600">
                      Making a reservation request will only notify us of the request and is not a
                      guarantee that the vehicle will be reserved. If you do not hear from us within
                      24 hours, please contact us directly to confirm your reservation.
                    </p>

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
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Toll free
                  </p>
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
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email
                  </p>
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
        </div>
      </div>
    </div>
  )
}
