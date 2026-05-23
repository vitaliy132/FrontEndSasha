import type {
  RentalCalculateRequest,
  RentalCalculateResponse,
  RentalFormData,
  RentalQuoteBreakdown,
  SubmitLeadRequest,
} from '../types/rental'
import { parseNonNegativeInt } from './parse'

/** Shared API field mapping from trip form state. */
export function mapRentalFormToApiFields(rental: RentalFormData) {
  return {
    startDate: rental.startDate,
    endDate: rental.endDate,
    vehicleType: rental.vehicleType,
    vehicleModel: rental.vehicleModel,
    cancellationWaiver: false as const,
    windshieldCoverage: false as const,
    generatorDailyUnlimited: rental.generatorType === 'dailyUnlimited',
    kmPackages:
      rental.vehicleType === 'trailer' ? 0 : parseNonNegativeInt(rental.mileagePackage, 0),
    kitchenKit: rental.kitchenKit,
    beddingKitPeople: parseNonNegativeInt(rental.beddingKitPeople, 0),
    bikeRack: false as const,
  }
}

export function buildRentalCalculateRequest(formData: RentalFormData): RentalCalculateRequest {
  return {
    ...mapRentalFormToApiFields(formData),
    extraKm: 0,
  }
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
  rental: RentalFormData
  vehicleModelLabel: string
  result: RentalCalculateResponse | null
}): SubmitLeadRequest {
  const { rental, result, vehicleModelLabel, ...contact } = params
  const apiFields = mapRentalFormToApiFields(rental)
  const extraKm =
    rental.vehicleType === 'trailer' ? 0 : parseNonNegativeInt(rental.mileagePerKm, 0)
  const personalKit = apiFields.beddingKitPeople

  const quoteBreakdown =
    result && isQuoteBreakdownObject(result.breakdown) ? result.breakdown : undefined

  return {
    ...contact,
    vehicleType: rental.vehicleType,
    vehicleModel: rental.vehicleModel,
    vehicleModelLabel,
    startDate: rental.startDate,
    endDate: rental.endDate,
    cancellationWaiver: apiFields.cancellationWaiver,
    windshieldCoverage: apiFields.windshieldCoverage,
    generatorDailyUnlimited: apiFields.generatorDailyUnlimited,
    kmPackages: apiFields.kmPackages,
    extraKm,
    kitchenKit: apiFields.kitchenKit,
    personalKitPeople: personalKit,
    beddingKitPeople: personalKit,
    bikeRack: apiFields.bikeRack,
    quoteBreakdown,
  }
}
