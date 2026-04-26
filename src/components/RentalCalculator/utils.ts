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

// Common CSS classes for form elements
export const inputClasses = 'mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
export const labelClasses = 'text-xs font-medium text-slate-700'
export const checkboxClasses = 'h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500'
export const checkboxLabelClasses = 'flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-3'
export const radioLabelClasses = 'flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 transition hover:bg-slate-50'
export const buttonClasses = 'inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-60'
export const errorClasses = 'rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 ring-1 ring-red-200'