export type VehicleType = 'classA' | 'classB' | 'classC' | 'trailer'

export interface RentalCalculateRequest {
  startDate: string
  endDate: string
  vehicleType: VehicleType
  /** Fleet unit key from `rentalPricing.json` → PRICING[vehicleType]. */
  vehicleModel: string
  cancellationWaiver: boolean
  windshieldCoverage: boolean
  /** When true, generator line uses $60 × billed daily days (min 5); hourly rate ignored. */
  generatorDailyUnlimited: boolean
  kmPackages: number
  extraKm: number
  kitchenKit: boolean
  beddingKitPeople: number
  bikeRack: boolean
}

/** API + SPA quote breakdown (amounts in `kmPackages` / `extraKm` are dollars). */
export interface RentalQuoteBreakdown {
  /** Calendar rental days (inclusive). */
  days: number
  dailyRateTotal: number
  cdw: number
  prepFee: number
  /** Dollar cost for 1000 km packages ($350 each). */
  kmPackages: number
  hitch: number
  extraKm: number
  generator: number
  cancellationWaiver: number
  windshield: number
  kitchenKit: number
  beddingKit: number
  bikeRack: number
  tax: number
}

export interface BreakdownLine {
  label: string
  value?: string
  amount?: string
}

export interface RentalCalculateResponse {
  /** Grand total including tax (also in breakdown math). */
  total?: number
  totalFormatted: string
  summaryMessage: string
  breakdown?: BreakdownLine[] | RentalQuoteBreakdown
  lineItems?: { name: string; value: number }[]
}

export interface SubmitLeadRequest {
  userId: string
  name: string
  email: string
  phone: string
  address: string
  quote: string
}
