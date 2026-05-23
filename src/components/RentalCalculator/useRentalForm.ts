import { useEffect, useMemo, useState } from 'react'
import { fetchRentalOptions } from '../../lib/api'
import { readRentalQueryParams } from '../../lib/urlParams'
import type {
  RentalOptionsResponse,
  RentalVehicleTypeOption,
  VehicleType,
} from '../../types/rental'

export interface RentalFormData {
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

const FALLBACK_MINIMUM_RENTAL_DAYS = 5

function findVehicleOption(
  options: RentalOptionsResponse | null,
  vehicleType: VehicleType,
): RentalVehicleTypeOption | undefined {
  return options?.vehicleTypes.find(option => option.id === vehicleType)
}

function resolveVehicleModel(
  vehicleOption: RentalVehicleTypeOption | undefined,
  preferredModel: string,
): string {
  if (!vehicleOption) return preferredModel
  if (vehicleOption.models.some(model => model.id === preferredModel)) {
    return preferredModel
  }
  return vehicleOption.defaultModel || vehicleOption.models[0]?.id || ''
}

export function useRentalForm() {
  const initial = useMemo(() => readRentalQueryParams(window.location.search), [])
  const [rentalOptions, setRentalOptions] = useState<RentalOptionsResponse | null>(null)
  const [rentalOptionsLoading, setRentalOptionsLoading] = useState(true)
  const [rentalOptionsError, setRentalOptionsError] = useState<string | null>(null)

  const [formData, setFormData] = useState<RentalFormData>({
    startDate: initial.startDate,
    endDate: initial.endDate,
    vehicleType: initial.vehicleType,
    vehicleModel: initial.vehicleModel,
    generatorType: initial.generatorDailyUnlimited ? 'dailyUnlimited' : 'none',
    mileagePackage: '0',
    mileagePerKm: String(initial.extraKm || ''),
    kitchenKit: initial.kitchenKit,
    beddingKitPeople: String(initial.beddingKitPeople),
  })

  useEffect(() => {
    let cancelled = false

    async function loadRentalOptions() {
      setRentalOptionsLoading(true)
      setRentalOptionsError(null)

      try {
        const options = await fetchRentalOptions()
        if (cancelled) return

        setRentalOptions(options)
        setFormData(prev => {
          const requestedVehicle = options.vehicleTypes.some(option => option.id === prev.vehicleType)
            ? prev.vehicleType
            : options.vehicleTypes[0]?.id ?? prev.vehicleType
          const vehicleOption = options.vehicleTypes.find(option => option.id === requestedVehicle)

          return {
            ...prev,
            vehicleType: requestedVehicle,
            vehicleModel: resolveVehicleModel(vehicleOption, prev.vehicleModel),
          }
        })
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'Could not load rental options.'
        setRentalOptionsError(message)
      } finally {
        if (!cancelled) {
          setRentalOptionsLoading(false)
        }
      }
    }

    void loadRentalOptions()

    return () => {
      cancelled = true
    }
  }, [])

  const currentVehicleOption = useMemo(
    () => findVehicleOption(rentalOptions, formData.vehicleType),
    [rentalOptions, formData.vehicleType],
  )
  const modelOptions = useMemo(
    () => currentVehicleOption?.models ?? [],
    [currentVehicleOption],
  )
  const selectedModelLabel =
    modelOptions.find(model => model.id === formData.vehicleModel)?.label ?? formData.vehicleModel
  const minimumRentalDays =
    rentalOptions?.minimumRentalDays ?? FALLBACK_MINIMUM_RENTAL_DAYS

  const updateField = <K extends keyof RentalFormData>(
    field: K,
    value: RentalFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateVehicleType = (vehicleType: VehicleType) => {
    const vehicleOption = findVehicleOption(rentalOptions, vehicleType)
    setFormData(prev => ({
      ...prev,
      vehicleType,
      vehicleModel: resolveVehicleModel(vehicleOption, ''),
      mileagePackage: vehicleType === 'trailer' ? '0' : prev.mileagePackage,
    }))
  }

  return {
    formData,
    vehicleTypes: rentalOptions?.vehicleTypes ?? [],
    modelOptions,
    selectedModelLabel,
    minimumRentalDays,
    rentalOptionsLoading,
    rentalOptionsError,
    updateField,
    updateVehicleType,
    userId: initial.userId,
  }
}