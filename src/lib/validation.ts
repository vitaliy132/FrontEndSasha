const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateRentalForm(input: {
  startDate: string
  endDate: string
  vehicleType?: string
  vehicleModel?: string
}): string | null {
  if (!input.startDate.trim()) return 'Please choose a start date.'
  if (!input.endDate.trim()) return 'Please choose an end date.'
  if (!input.vehicleType?.trim()) return 'Please select a vehicle type.'
  if (!input.vehicleModel?.trim()) return 'Please select a vehicle model.'

  const start = new Date(input.startDate + 'T00:00:00')
  const end = new Date(input.endDate + 'T00:00:00')
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Dates must be in valid ISO format (YYYY-MM-DD).'
  }
  if (end <= start) return 'End date must be after the start date.'

  return null
}

export function validateLeadForm(input: {
  name: string
  email: string
  phone: string
  userId: string | null
}): string | null {
  if (!input.name.trim()) return 'Please enter your name.'
  if (input.name.trim().length < 2) {
    return 'Please enter your full name (at least 2 characters).'
  }
  if (!input.email.trim()) return 'Please enter your email.'
  if (!EMAIL_RE.test(input.email.trim())) return 'Please enter a valid email.'
  if (!input.phone.trim()) return 'Please enter your phone number.'
  return null
}
