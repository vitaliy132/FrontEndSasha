export type VehicleType = 'classA' | 'classC' | 'trailer'

export interface RentalCalculateRequest {
  startDate: string
  endDate: string
  vehicleType: VehicleType
  cdwPlus: boolean
  kmPackages: number
  extraKm: number
  generatorHours: number
}

export interface BreakdownLine {
  label: string
  value?: string
  amount?: string
}

export interface RentalCalculateResponse {
  totalFormatted: string
  summaryMessage: string
  breakdown?: BreakdownLine[] | Record<string, string | number>
}

export interface SubmitLeadRequest {
  userId: string
  name: string
  email: string
  phone: string
  quote: string
}
