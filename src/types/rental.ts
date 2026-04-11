export type VehicleType = 'classA' | 'classB' | 'classC' | 'trailer'

export type SeasonName = 'PREMIUM' | 'PRIME' | 'SHOULDER' | 'ECONOMY'

export type KmPackageType = 'package' | 'per_km'

export interface KmPackage {
  type: KmPackageType
  value: number // package count or per_km amount
}

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
  kmPackage: KmPackage
  generatorHours: number
  kitchenKit: boolean
  beddingKitPeople: number
  bikeRack: boolean
}

/** API + SPA quote breakdown (amounts in `kmPackage` / pricing are in dollars). */
export interface RentalQuoteBreakdown {
  /** Calendar rental days (inclusive). */
  days: number
  dailyRates: { date: string; season: string; price: number }[]
  basePrice: number
  cdw: number
  prepFee: number
  kmPrice: number
  hitch: number
  generator: number
  cancellationWaiver: number
  windshield: number
  kitchenKit: number
  beddingKit: number
  bikeRack: number
  subtotal: number
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
  quote: string
}
