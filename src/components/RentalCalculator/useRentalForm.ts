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
  generatorDailyUnlimited: boolean
  kmPackages: string
  extraKm: string
  generatorHours: string
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
    generatorDailyUnlimited: initial.generatorDailyUnlimited,
    kmPackages: String(initial.kmPackages),
    extraKm: String(initial.extraKm),
    generatorHours: String(initial.generatorHours),
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