import { useState } from 'react'

export interface LeadFormData {
  name: string
  email: string
  phone: string
  address: string
}

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

  const reset = () => {
    setFormData({ name: '', email: '', phone: '', address: '' })
  }

  return {
    formData,
    updateField,
    reset,
  }
}