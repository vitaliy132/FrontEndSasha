export function getMinimumRentalErrorMessage(minimumRentalDays: number): string {
  return `Minimum rental period is ${minimumRentalDays} days. Please pick a longer date range.`
}

export function getMinimumRentalHint(minimumRentalDays: number): string {
  return `Minimum rental period is ${minimumRentalDays} days`
}
