import type { VehicleType } from '../types/rental'

const VEHICLE_TYPES: VehicleType[] = ['classA', 'classC', 'trailer']

function getParam(search: URLSearchParams, ...keys: string[]): string | null {
  for (const key of keys) {
    const v = search.get(key)
    if (v !== null && v !== '') return v
  }
  return null
}

function parseBool(raw: string | null): boolean | undefined {
  if (raw === null) return undefined
  const l = raw.toLowerCase()
  if (l === '1' || l === 'true' || l === 'yes') return true
  if (l === '0' || l === 'false' || l === 'no') return false
  return undefined
}

function parseVehicleType(raw: string | null): VehicleType | undefined {
  if (!raw) return undefined
  const normalized = raw as VehicleType
  return VEHICLE_TYPES.includes(normalized) ? normalized : undefined
}

function parseNonNegNumber(raw: string | null): number | undefined {
  if (raw === null || raw === '') return undefined
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 0) return undefined
  return n
}

export interface RentalPrefill {
  userId: string | null
  startDate: string
  endDate: string
  vehicleType: VehicleType
  cdwPlus: boolean
  kmPackages: number
  extraKm: number
  generatorHours: number
}

export function readRentalQueryParams(search: string): RentalPrefill {
  const params = new URLSearchParams(search)

  const start =
    getParam(params, 'startDate', 'start_date') ?? ''
  const end = getParam(params, 'endDate', 'end_date') ?? ''
  const vehicle =
    parseVehicleType(getParam(params, 'vehicleType', 'vehicle_type')) ?? 'classA'
  const cdw =
    parseBool(getParam(params, 'cdwPlus', 'cdw_plus')) ?? false
  const kmPackages =
    parseNonNegNumber(getParam(params, 'kmPackages', 'km_packages')) ?? 0
  const extraKm =
    parseNonNegNumber(getParam(params, 'extraKm', 'extra_km')) ?? 0
  const generatorHours =
    parseNonNegNumber(
      getParam(params, 'generatorHours', 'generator_hours'),
    ) ?? 0

  const userId = getParam(params, 'user_id', 'userId')

  return {
    userId,
    startDate: start,
    endDate: end,
    vehicleType: vehicle,
    cdwPlus: cdw,
    kmPackages,
    extraKm,
    generatorHours,
  }
}
