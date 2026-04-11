import { useMemo, useState } from 'react'
import {
  defaultVehicleModel,
  listVehicleModels,
} from '../../lib/rentalQuote'
import { readRentalQueryParams } from '../../lib/urlParams'
import type { VehicleType, KmPackage } from '../../types/rental'

export interface RentalFormData {
  startDate: string
  endDate: string
  vehicleType: VehicleType
  vehicleModel: string
  cancellationWaiver: boolean
  windshieldCoverage: boolean
  generatorDailyUnlimited: boolean
  kmPackage: KmPackage
  generatorHours: string
  kitchenKit: boolean
  beddingKitPeople: string
  bikeRack: boolean
}

export const KM_PACKAGE_OPTIONS = [
  { value: 0, label: 'No package' },
  { value: 1000, label: '1,000 km - $350' },
  { value: 2000, label: '2,000 km - $700' },
  { value: 3000, label: '3,000 km - $1,050' },
  { value: 4000, label: '4,000 km - $1,400' },
  { value: 5000, label: '5,000 km - $1,750' },
  { value: -1, label: 'Pay-per-km ($0.41/km)' },
]

export function useRentalForm() {
  const initial = useMemo(() => readRentalQueryParams(window.location.search), [])

  const initialVehicleType = initial.vehicleType
  const initialModelOptions = useMemo(() => listVehicleModels(initialVehicleType), [initialVehicleType])
  const initialVehicleModel = initialModelOptions.includes(initial.vehicleModel) ? initial.vehicleModel : defaultVehicleModel(initialVehicleType)

  const [formData, setFormData] = useState<RentalFormData>({
    startDate: initial.startDate,
    endDate: initial.endDate,
    vehicleType: initialVehicleType,
    vehicleModel: initialVehicleModel,
    cancellationWaiver: initial.cancellationWaiver,
    windshieldCoverage: initial.windshieldCoverage,
    generatorDailyUnlimited: initial.generatorDailyUnlimited,
    kmPackage: { type: 'package', value: 0 },
    generatorHours: String(initial.generatorHours),
    kitchenKit: initial.kitchenKit,
    beddingKitPeople: String(initial.beddingKitPeople),
    bikeRack: initial.bikeRack,
  })

  const modelOptions = useMemo(
    () => listVehicleModels(formData.vehicleType),
    [formData.vehicleType],
  )

  const updateField = <K extends keyof RentalFormData>(
    field: K,
    value: RentalFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateKmPackage = (packageValue: number) => {
    if (packageValue === -1) {
      // Pay-per-km mode
      setFormData(prev => ({
        ...prev,
        kmPackage: { type: 'per_km', value: 0 },
      }))
    } else {
      // Package mode
      setFormData(prev => ({
        ...prev,
        kmPackage: { type: 'package', value: packageValue },
      }))
    }
  }

  const updatePerKmAmount = (amount: number) => {
    if (formData.kmPackage.type === 'per_km') {
      setFormData(prev => ({
        ...prev,
        kmPackage: { type: 'per_km', value: Math.max(0, amount) },
      }))
    }
  }

  const updateVehicleType = (vehicleType: VehicleType) => {
    const defaultModel = defaultVehicleModel(vehicleType)
    setFormData(prev => ({
      ...prev,
      vehicleType,
      vehicleModel: defaultModel,
    }))
  }

  return {
    formData,
    modelOptions,
    updateField,
    updateKmPackage,
    updatePerKmAmount,
    updateVehicleType,
    userId: initial.userId,
  }
}