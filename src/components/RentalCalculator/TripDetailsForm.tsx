import type { ChangeEvent, FormEvent } from 'react'
import type {
  RentalVehicleModelOption,
  RentalVehicleTypeOption,
  VehicleType,
} from '../../types/rental'
import { KitchenKitTooltip, PersonalKitTooltip } from './InfoTooltip'
import { Spinner } from './Spinner'
import {
  buttonClasses,
  checkboxClasses,
  checkboxLabelClasses,
  errorClasses,
  inputClasses,
  labelClasses,
  radioLabelClasses,
} from './formStyles'
import { getMinimumRentalErrorMessage, getMinimumRentalHint } from '../../lib/minimumRentalMessage'
import type { RentalFormData } from '../../types/rental'

export interface TripDetailsFormProps {
  formData: RentalFormData
  vehicleTypes: RentalVehicleTypeOption[]
  modelOptions: RentalVehicleModelOption[]
  minimumRentalDays: number
  rentalOptionsLoading: boolean
  rentalOptionsError: string | null
  calculating: boolean
  calcError: string | null
  tooShortRental: boolean
  cannotCalculate: boolean
  onSubmit: (e: FormEvent) => void
  onUpdateField: <K extends keyof RentalFormData>(field: K, value: RentalFormData[K]) => void
  onUpdateVehicleType: (vehicleType: VehicleType) => void
}

export function TripDetailsForm({
  formData,
  vehicleTypes,
  modelOptions,
  minimumRentalDays,
  rentalOptionsLoading,
  rentalOptionsError,
  calculating,
  calcError,
  tooShortRental,
  cannotCalculate,
  onSubmit,
  onUpdateField,
  onUpdateVehicleType,
}: TripDetailsFormProps) {
  return (
    <section className="lg:col-span-5">
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5 backdrop-blur sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">Trip details</h2>
        <p className="mt-1 text-sm text-slate-600">
          All fields are validated before we contact the server.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="start-date" className={labelClasses}>
                Start date
              </label>
              <input
                id="start-date"
                type="date"
                value={formData.startDate}
                onChange={(e) => onUpdateField('startDate', e.target.value)}
                className={inputClasses}
                disabled={calculating}
              />
            </div>
            <div>
              <label htmlFor="end-date" className={labelClasses}>
                End date
              </label>
              <input
                id="end-date"
                type="date"
                value={formData.endDate}
                onChange={(e) => onUpdateField('endDate', e.target.value)}
                className={inputClasses}
                disabled={calculating}
              />
            </div>
          </div>

          {tooShortRental ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-3">
              <p className="text-xs font-medium text-amber-900">
                {getMinimumRentalErrorMessage(minimumRentalDays)} to continue.
              </p>
            </div>
          ) : null}

          <div>
            <label htmlFor="vehicle-type" className={labelClasses}>
              Vehicle type
            </label>
            <select
              id="vehicle-type"
              value={formData.vehicleType}
              onChange={(e) => onUpdateVehicleType(e.target.value as VehicleType)}
              className={inputClasses}
              disabled={calculating || rentalOptionsLoading}
            >
              {vehicleTypes.length > 0 ? (
                vehicleTypes.map((vehicleType) => (
                  <option key={vehicleType.id} value={vehicleType.id}>
                    {vehicleType.label}
                  </option>
                ))
              ) : (
                <option value={formData.vehicleType}>
                  {rentalOptionsLoading ? 'Loading vehicle types...' : formData.vehicleType}
                </option>
              )}
            </select>
          </div>

          <div>
            <label htmlFor="vehicle-model" className={labelClasses}>
              Vehicle model
            </label>
            <select
              id="vehicle-model"
              value={formData.vehicleModel}
              onChange={(e) => onUpdateField('vehicleModel', e.target.value)}
              className={inputClasses}
              disabled={calculating || rentalOptionsLoading}
            >
              {modelOptions.length > 0 ? (
                modelOptions.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.label}
                  </option>
                ))
              ) : (
                <option value={formData.vehicleModel}>
                  {rentalOptionsLoading ? 'Loading vehicle models...' : 'No models available'}
                </option>
              )}
            </select>
          </div>

          <label className={checkboxLabelClasses}>
            <input
              type="checkbox"
              checked={formData.kitchenKit}
              onChange={(e) => onUpdateField('kitchenKit', e.target.checked)}
              className={checkboxClasses}
              disabled={calculating}
            />
            <span className="text-sm font-medium text-slate-800">
              Kitchen Kit ($85/trip)
              <KitchenKitTooltip />
            </span>
          </label>

          <div>
            <label htmlFor="bedding-kit-people" className={labelClasses}>
              Personal Kit ($35/person)
              <PersonalKitTooltip />
            </label>
            <input
              id="bedding-kit-people"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={formData.beddingKitPeople}
              onChange={(e) => onUpdateField('beddingKitPeople', e.target.value)}
              className={inputClasses}
              disabled={calculating}
            />
          </div>

          {formData.vehicleType !== 'trailer' && (
            <div>
              <label htmlFor="mileage-type" className={labelClasses}>
                Quantity of 1,000km packages ($350 each)
              </label>
              <select
                id="mileage-type"
                value={formData.mileagePackage}
                onChange={(e) => onUpdateField('mileagePackage', e.target.value)}
                className={inputClasses}
                disabled={calculating}
              >
                {['0', '1', '2', '3', '4', '5'].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-600">
                Additional kms are $0.41 per km, charged at drop off
              </p>
            </div>
          )}

          <fieldset className="space-y-3">
            <legend className={labelClasses}>Generator options</legend>
            <div className="space-y-2">
              <label className={radioLabelClasses}>
                <input
                  type="radio"
                  name="generator"
                  value="none"
                  checked={formData.generatorType === 'none'}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    onUpdateField('generatorType', e.target.value as RentalFormData['generatorType'])
                  }
                  className={checkboxClasses}
                  disabled={calculating}
                />
                <span className="text-sm font-medium text-slate-800">None ($0)</span>
              </label>
              <label className={radioLabelClasses}>
                <input
                  type="radio"
                  name="generator"
                  value="dailyUnlimited"
                  checked={formData.generatorType === 'dailyUnlimited'}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    onUpdateField('generatorType', e.target.value as RentalFormData['generatorType'])
                  }
                  className={checkboxClasses}
                  disabled={calculating}
                />
                <span className="text-sm font-medium text-slate-800">Daily unlimited ($60/day)</span>
              </label>
            </div>
          </fieldset>
          <p className="text-xs text-slate-600">
            Generator is charged upon drop off at $5 per hour of use.
          </p>

          {rentalOptionsError ? (
            <p className={errorClasses} role="alert">
              {rentalOptionsError}
            </p>
          ) : null}

          {calcError ? (
            <p className={errorClasses} role="alert">
              {calcError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={cannotCalculate}
            aria-disabled={cannotCalculate}
            title={tooShortRental ? getMinimumRentalHint(minimumRentalDays) : undefined}
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
  )
}
