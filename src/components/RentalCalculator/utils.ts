import type { VehicleType } from '../../types/rental'

const VEHICLE_TYPE_PREFIX: Record<VehicleType, string> = {
  classA: 'Class A',
  classB: 'Class B',
  classC: 'Class C',
  trailer: 'Trailer',
}

/**
 * Display labels aligned with operator rate sheet (internal model keys unchanged).
 */
const MODEL_OPTION_LABEL: Record<string, string> = {
  '30ft_2024': '30 with slide out — 2024-2026',
  '32ft_2017': '32 with slide out/bunks (Economy) — 2017',
  '34ft_2023': '34 with slide out — 2023-2026',
  '35ft_2025': '35 with slide out/bunks — 2025-2026',
  '36ft_2025': '36 with slide out/bunks — 2025-2026',
  '31ft_slideout_bunks_2019': '31 with slide out/bunks — 2019-2026',
  '25ft_slideout_2021_2023': '25 with slide out — 2021-2026',
  '25ft_slideout_2018_economy': '25 with slide out (Economy) — 2018',
  '23ft_2020_2026': '23 — 2020-2026',
  '23ft_2021_2023': '23 — 2021-2026',
  '19ft_2023': '19 — 2023-2026',
  '27ft_bunks_2024': '27 with bunks — 2024-2026',
}

export function formatModelLabel(id: string, vehicleType: VehicleType): string {
  const custom = MODEL_OPTION_LABEL[id]
  if (custom) {
    return `${VEHICLE_TYPE_PREFIX[vehicleType]} — ${custom}`
  }
  const parts = id.split('_')
  if (parts.length < 2) return id.replaceAll('_', ' ')
  const size = parts[0].replace('ft', '')
  return `${VEHICLE_TYPE_PREFIX[vehicleType]} ${size}`
}

// Common CSS classes for form elements
export const inputClasses = 'mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
export const labelClasses = 'text-xs font-medium text-slate-700'
export const checkboxClasses = 'h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500'
export const checkboxLabelClasses = 'flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-3'
export const radioLabelClasses = 'flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 transition hover:bg-slate-50'
export const buttonClasses = 'inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-60'
export const errorClasses = 'rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 ring-1 ring-red-200'
