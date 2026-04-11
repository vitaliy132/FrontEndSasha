const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateRentalForm(input: {
  startDate: string
  endDate: string
  kmPackages: number
  extraKm: number
  generatorHours: number
}): string | null {
  if (!input.startDate.trim()) return 'Please choose a start date.'
  if (!input.endDate.trim()) return 'Please choose an end date.'

  const start = new Date(input.startDate + 'T00:00:00')
  const end = new Date(input.endDate + 'T00:00:00')
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Dates are invalid.'
  }
  if (end <= start) return 'End date must be after the start date.'

  if (
    !Number.isFinite(input.kmPackages) ||
    input.kmPackages < 0 ||
    !Number.isInteger(input.kmPackages)
  ) {
    return 'KM packages must be a whole number zero or greater.'
  }
  if (
    !Number.isFinite(input.extraKm) ||
    input.extraKm < 0 ||
    !Number.isInteger(input.extraKm)
  ) {
    return 'Extra KM must be a whole number zero or greater.'
  }
  if (!Number.isFinite(input.generatorHours) || input.generatorHours < 0) {
    return 'Generator hours must be zero or greater.'
  }

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
