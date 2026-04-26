export function formatModelLabel(id: string): string {
  const parts = id.split('_')
  if (parts.length < 2) return id.replaceAll('_', ' ')

  const size = parts[0].replace('ft', '') // Remove 'ft' from size
  const hasSlideOut = parts.includes('slide') && parts.includes('out')
  const isEconomy = parts.includes('economy')
  const yearParts = parts.filter(p => /^\d{4}$/.test(p))

  let label = size
  if (hasSlideOut) {
    label += ' Slide Out'
  }
  if (isEconomy) {
    label += ' Economy'
  }

  if (yearParts.length > 0) {
    if (yearParts.length === 1) {
      label += ` (${yearParts[0]})`
    } else if (yearParts.length === 2) {
      label += ` (${yearParts[0]}–${yearParts[1]})`
    }
  }

  return label
}