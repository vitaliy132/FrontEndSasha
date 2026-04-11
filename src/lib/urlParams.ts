import { defaultVehicleModel } from './rentalQuote'
import type { VehicleType } from '../types/rental'

const VEHICLE_TYPES: VehicleType[] = [
  'classA',
  'classB',
  'classC',
  'trailer',
]

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
  vehicleModel: string
  cancellationWaiver: boolean
  windshieldCoverage: boolean
  generatorDailyUnlimited: boolean
  kmPackages: number
  extraKm: number
  generatorHours: number
  kitchenKit: boolean
  beddingKitPeople: number
  bikeRack: boolean
}

export function readRentalQueryParams(search: string): RentalPrefill {
  const params = new URLSearchParams(search)

  const start =
    getParam(params, 'startDate', 'start_date') ?? ''
  const end = getParam(params, 'endDate', 'end_date') ?? ''
  const vehicle =
    parseVehicleType(getParam(params, 'vehicleType', 'vehicle_type')) ?? 'classA'
  const vehicleModelRaw = getParam(
    params,
    'vehicleModel',
    'vehicle_model',
    'model',
  )
  const vehicleModel =
    vehicleModelRaw?.trim() || defaultVehicleModel(vehicle)
  const cancellationWaiver =
    parseBool(
      getParam(params, 'cancellationWaiver', 'cancellation_waiver'),
    ) ?? false
  const windshieldCoverage =
    parseBool(
      getParam(params, 'windshieldCoverage', 'windshield_coverage'),
    ) ?? false
  const generatorDailyUnlimited =
    parseBool(
      getParam(
        params,
        'generatorDailyUnlimited',
        'generator_daily_unlimited',
      ),
    ) ?? false
  const kmPackages =
    parseNonNegNumber(getParam(params, 'kmPackages', 'km_packages')) ?? 0
  const extraKm =
    parseNonNegNumber(getParam(params, 'extraKm', 'extra_km')) ?? 0
  const generatorHours =
    parseNonNegNumber(
      getParam(params, 'generatorHours', 'generator_hours'),
    ) ?? 0
  const kitchenKit =
    parseBool(getParam(params, 'kitchenKit', 'kitchen_kit')) ?? false
  const beddingKitPeople =
    parseNonNegNumber(getParam(params, 'beddingKitPeople', 'bedding_kit_people')) ?? 0
  const bikeRack =
    parseBool(getParam(params, 'bikeRack', 'bike_rack')) ?? false

  const userId = getParam(params, 'user_id', 'userId')

  return {
    userId,
    startDate: start,
    endDate: end,
    vehicleType: vehicle,
    vehicleModel,
    cancellationWaiver,
    windshieldCoverage,
    generatorDailyUnlimited,
    kmPackages,
    extraKm,
    generatorHours,
    kitchenKit,
    beddingKitPeople,
    bikeRack,
  }
}
