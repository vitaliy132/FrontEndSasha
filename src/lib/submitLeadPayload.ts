import type {
  RentalCalculateResponse,
  RentalQuoteBreakdown,
  SubmitLeadRequest,
  VehicleType,
} from '../types/rental'

/** Snapshot of trip form state when submitting a lead (from `useRentalForm`). */
export interface RentalFormSnapshot {
  startDate: string
  endDate: string
  vehicleType: VehicleType
  vehicleModel: string
  generatorType: 'none' | 'dailyUnlimited'
  mileagePackage: string
  mileagePerKm: string
  kitchenKit: boolean
  beddingKitPeople: string
}

function parseNonNegativeInt(raw: string, fallback = 0): number {
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n >= 0 ? n : fallback
}

function isQuoteBreakdownObject(
  b: RentalCalculateResponse['breakdown'],
): b is RentalQuoteBreakdown {
  return (
    !!b &&
    typeof b === 'object' &&
    !Array.isArray(b) &&
    'days' in (b as unknown as Record<string, unknown>)
  )
}

export function buildSubmitLeadRequest(params: {
  userId: string
  name: string
  email: string
  phone: string
  address: string
  quote: string
  rental: RentalFormSnapshot
  vehicleModelLabel: string
  result: RentalCalculateResponse | null
}): SubmitLeadRequest {
  const { rental, result, vehicleModelLabel, ...contact } = params
  const generatorDailyUnlimited = rental.generatorType === 'dailyUnlimited'
  const kmPackages =
    rental.vehicleType === 'trailer' ? 0 : parseNonNegativeInt(rental.mileagePackage, 0)
  const extraKm =
    rental.vehicleType === 'trailer' ? 0 : parseNonNegativeInt(rental.mileagePerKm, 0)
  const personalKit = parseNonNegativeInt(rental.beddingKitPeople, 0)

  const quoteBreakdown =
    result && isQuoteBreakdownObject(result.breakdown) ? result.breakdown : undefined

  return {
    ...contact,
    vehicleType: rental.vehicleType,
    vehicleModel: rental.vehicleModel,
    vehicleModelLabel,
    startDate: rental.startDate,
    endDate: rental.endDate,
    cancellationWaiver: false,
    windshieldCoverage: false,
    generatorDailyUnlimited,
    kmPackages,
    extraKm,
    kitchenKit: rental.kitchenKit,
    personalKitPeople: personalKit,
    beddingKitPeople: personalKit,
    bikeRack: false,
    quoteBreakdown,
  }
}
