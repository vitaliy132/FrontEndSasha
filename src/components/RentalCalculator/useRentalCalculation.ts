import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { calculateRental } from '../../lib/api'
import { getMinimumRentalErrorMessage } from '../../lib/minimumRentalMessage'
import { buildRentalCalculateRequest } from '../../lib/rentalPayload'
import { validateRentalForm } from '../../lib/validation'
import type { RentalCalculateResponse, RentalFormData } from '../../types/rental'
import { computeRentalDays } from './rentalDays'

export function useRentalCalculation(params: {
  formData: RentalFormData
  minimumRentalDays: number
  rentalOptionsLoading: boolean
  rentalOptionsError: string | null
}) {
  const { formData, minimumRentalDays, rentalOptionsLoading, rentalOptionsError } = params

  const [calculating, setCalculating] = useState(false)
  const [calcError, setCalcError] = useState<string | null>(null)
  const [result, setResult] = useState<RentalCalculateResponse | null>(null)

  useEffect(() => {
    setResult(null)
    setCalcError(null)
  }, [formData])

  const selectedDays = useMemo(
    () => computeRentalDays(formData.startDate, formData.endDate),
    [formData.startDate, formData.endDate],
  )

  const tooShortRental = selectedDays !== null && selectedDays < minimumRentalDays
  const cannotCalculate =
    calculating ||
    tooShortRental ||
    rentalOptionsLoading ||
    !!rentalOptionsError ||
    !formData.vehicleModel

  async function handleCalculate(e: FormEvent) {
    e.preventDefault()
    setCalcError(null)

    if (rentalOptionsLoading) {
      setCalcError('Rental options are still loading. Please wait a moment.')
      return
    }

    if (rentalOptionsError) {
      setCalcError(rentalOptionsError)
      return
    }

    if (tooShortRental) {
      setCalcError(getMinimumRentalErrorMessage(minimumRentalDays))
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

  return {
    calculating,
    calcError,
    result,
    tooShortRental,
    cannotCalculate,
    handleCalculate,
  }
}
