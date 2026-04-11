import pricingConfig from '../config/rentalPricing.json'
import type { VehicleType } from '../types/rental'

const { PRICING, defaults } = pricingConfig as {
  PRICING: Record<
    string,
    Record<string, Record<string, number>>
  >
  defaults: { vehicleModelByType: Record<string, string> }
}

export function listVehicleModels(vehicleType: VehicleType): string[] {
  const table = PRICING[vehicleType]
  if (!table) return []
  return Object.keys(table)
}

export function defaultVehicleModel(vehicleType: VehicleType): string {
  return defaults?.vehicleModelByType?.[vehicleType] ?? ''
}

