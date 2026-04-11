import { useState } from 'react'

export interface LeadFormData {
  name: string
  email: string
  phone: string
}

export function useLeadForm() {
  const [formData, setFormData] = useState<LeadFormData>({
    name: '',
    email: '',
    phone: '',
  })

  const updateField = (field: keyof LeadFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const reset = () => {
    setFormData({ name: '', email: '', phone: '' })
  }

  return {
    formData,
    updateField,
    reset,
  }
}