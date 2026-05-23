import { useState } from 'react'
import type { LeadFormData } from '../../types/rental'

export type { LeadFormData }

export function useLeadForm() {
  const [formData, setFormData] = useState<LeadFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
  })

  const updateField = (field: keyof LeadFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return {
    formData,
    updateField,
  }
}