import { useMemo, useState } from 'react'
import {
  defaultVehicleModel,
  listVehicleModels,
} from '../../lib/rentalQuote'
import { readRentalQueryParams } from '../../lib/urlParams'
import type { VehicleType } from '../../types/rental'

export interface RentalFormData {
  startDate: string
  endDate: string
  vehicleType: VehicleType
  vehicleModel: string
  cancellationWaiver: boolean
  windshieldCoverage: boolean
  generatorType: 'none' | 'dailyUnlimited'
  mileagePackage: string
  mileagePerKm: string
  kitchenKit: boolean
  beddingKitPeople: string
}

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
    generatorType: initial.generatorDailyUnlimited ? 'dailyUnlimited' : 'none',
    mileagePackage: '0',
    mileagePerKm: String(initial.extraKm || ''),
    kitchenKit: initial.kitchenKit,
    beddingKitPeople: String(initial.beddingKitPeople),
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

  const updateVehicleType = (vehicleType: VehicleType) => {
    const defaultModel = defaultVehicleModel(vehicleType)
    setFormData(prev => ({
      ...prev,
      vehicleType,
      vehicleModel: defaultModel,
      mileagePackage: vehicleType === 'trailer' ? '0' : prev.mileagePackage,
    }))
  }

  return {
    formData,
    modelOptions,
    updateField,
    updateVehicleType,
    userId: initial.userId,
  }
}