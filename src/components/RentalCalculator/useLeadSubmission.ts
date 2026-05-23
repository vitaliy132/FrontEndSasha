import type { FormEvent } from 'react'
import { useState } from 'react'
import { submitLead } from '../../lib/api'
import { buildSubmitLeadRequest } from '../../lib/rentalPayload'
import { validateLeadForm } from '../../lib/validation'
import type { LeadFormData, RentalCalculateResponse, RentalFormData } from '../../types/rental'

export function useLeadSubmission(params: {
  formData: RentalFormData
  leadFormData: LeadFormData
  selectedModelLabel: string
  result: RentalCalculateResponse | null
  userId: string | null
}) {
  const { formData, leadFormData, selectedModelLabel, result, userId } = params

  const [showBooking, setShowBooking] = useState(false)
  const [leadLoading, setLeadLoading] = useState(false)
  const [leadError, setLeadError] = useState<string | null>(null)
  const [leadSuccess, setLeadSuccess] = useState(false)

  function openBookingForm() {
    setShowBooking(true)
    setLeadSuccess(false)
    setLeadError(null)
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
          vehicleModelLabel: selectedModelLabel,
          result,
        }),
      )
      setLeadSuccess(true)
    } catch (err) {
      setLeadError(err instanceof Error ? err.message : 'Could not submit. Try again.')
    } finally {
      setLeadLoading(false)
    }
  }

  return {
    showBooking,
    leadLoading,
    leadError,
    leadSuccess,
    openBookingForm,
    handleLeadSubmit,
  }
}
