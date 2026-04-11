import {
  addDays,
  differenceInCalendarDays,
  format,
  isValid,
  parseISO,
} from 'date-fns'
import pricingConfig from '../config/rentalPricing.json'
import type {
  RentalCalculateRequest,
  RentalCalculateResponse,
  RentalQuoteBreakdown,
  VehicleType,
} from '../types/rental'

const TAX_RATE = 0.13
const MIN_CHARGE_DAYS_FOR_DAILY_RATE = 5
const CDW_DAILY_RATE = 30
const CDW_MINIMUM = 210
const KM_PACKAGE_RATE = 350
const TRAILER_HITCH_FEE = 150
const EXTRA_KM_RATE = 0.41

const { SEASONS: SEASON_DEFINITIONS, PRICING, ADD_ONS, defaults } = pricingConfig as {
  SEASONS: {
    PREMIUM: { start: string; end: string }
    PRIME: { start: string; end: string }[]
    SHOULDER: { start: string; end: string }[]
    ECONOMY: { start: string; end: string }[]
  }
  PRICING: Record<
    string,
    Record<string, Record<string, number>>
  >
  ADD_ONS: {
    generator: { hourly: number; daily: number }
    windshieldCoverage: {
      classA: { perTrip: number; min: number; max: number }
      classC: { perTrip: number; max: number }
    }
    cancellationWaiver: { daily: number; min: number }
    kitchenKit: { perTrip: number }
    beddingKit: { perPerson: number }
    bikeRack: { perTrip: number }
  }
  defaults: { vehicleModelByType: Record<string, string> }
}

const roundToTwo = (num: number) => {
  const n = Number(num)
  if (!Number.isFinite(n)) return 0
  return Number(n.toFixed(2))
}

const formatCurrency = (value: number) => `$${roundToTwo(value).toFixed(2)}`

function mmdd(date: Date) {
  return format(date, 'MM-dd')
}

function inSeasonRange(d: string, start: string, end: string) {
  if (start <= end) {
    return d >= start && d <= end
  }
  return d >= start || d <= end
}

export type SeasonName = 'PREMIUM' | 'PRIME' | 'SHOULDER' | 'ECONOMY'

export function getSeason(date: Date): SeasonName {
  const d = mmdd(date)
  const premium = SEASON_DEFINITIONS.PREMIUM
  if (inSeasonRange(d, premium.start, premium.end)) {
    return 'PREMIUM'
  }
  for (const r of SEASON_DEFINITIONS.PRIME) {
    if (inSeasonRange(d, r.start, r.end)) return 'PRIME'
  }
  for (const r of SEASON_DEFINITIONS.SHOULDER) {
    if (inSeasonRange(d, r.start, r.end)) return 'SHOULDER'
  }
  for (const r of SEASON_DEFINITIONS.ECONOMY) {
    if (inSeasonRange(d, r.start, r.end)) return 'ECONOMY'
  }
  return 'ECONOMY'
}

export function listVehicleModels(vehicleType: VehicleType): string[] {
  const table = PRICING[vehicleType]
  if (!table) return []
  return Object.keys(table)
}

export function defaultVehicleModel(vehicleType: VehicleType): string {
  return defaults?.vehicleModelByType?.[vehicleType] ?? ''
}

function resolvePricingRow(vehicleType: VehicleType, vehicleModel: string) {
  const table = PRICING[vehicleType]
  if (!table) {
    throw new RentalQuoteError(`Unknown vehicle type: ${vehicleType}`)
  }
  const row = table[vehicleModel]
  if (!row) {
    throw new RentalQuoteError(
      `Unknown vehicle model "${vehicleModel}" for ${vehicleType}. Valid models: ${Object.keys(table).join(', ')}`,
    )
  }
  return row
}

const calendarRentalDays = (startDate: Date, endDate: Date) =>
  differenceInCalendarDays(endDate, startDate) + 1

const billedDaysForDailyRates = (calendarDays: number) =>
  Math.max(calendarDays, MIN_CHARGE_DAYS_FOR_DAILY_RATE)

function calculateDailyRateTotal(
  startDate: Date,
  daysToSum: number,
  vehicleType: VehicleType,
  vehicleModel: string,
) {
  const row = resolvePricingRow(vehicleType, vehicleModel)
  let total = 0
  for (let dayOffset = 0; dayOffset < daysToSum; dayOffset += 1) {
    const day = addDays(startDate, dayOffset)
    const season = getSeason(day)
    const price = row[season]
    if (price == null || !Number.isFinite(Number(price))) {
      throw new RentalQuoteError(`Missing rate for season ${season} on model ${vehicleModel}`)
    }
    total += Number(price)
  }
  return roundToTwo(total)
}

const getPrepFee = (vehicleType: VehicleType) =>
  vehicleType === 'classA' ? 199 : 149

const calculateCDW = (calendarDays: number) =>
  roundToTwo(Math.max(calendarDays * CDW_DAILY_RATE, CDW_MINIMUM))

const calculateCancellationWaiver = (enabled: boolean, calendarDays: number) => {
  if (!enabled) return 0
  return roundToTwo(Math.max(calendarDays * ADD_ONS.cancellationWaiver.daily, ADD_ONS.cancellationWaiver.min))
}

const calculateWindshield = (
  vehicleType: VehicleType,
  calendarDays: number,
  enabled: boolean,
) => {
  if (!enabled) return 0
  const days = Math.max(0, calendarDays)
  if (vehicleType === 'classA') {
    const raw = days * ADD_ONS.windshieldCoverage.classA.perTrip
    return roundToTwo(Math.min(Math.max(raw, ADD_ONS.windshieldCoverage.classA.min), ADD_ONS.windshieldCoverage.classA.max))
  }
  if (vehicleType === 'classB' || vehicleType === 'classC' || vehicleType === 'trailer') {
    const raw = days * ADD_ONS.windshieldCoverage.classC.perTrip
    return roundToTwo(Math.min(raw, ADD_ONS.windshieldCoverage.classC.max))
  }
  return 0
}

const calculateKitchenKit = (enabled: boolean) => {
  return enabled ? roundToTwo(ADD_ONS.kitchenKit.perTrip) : 0
}

const calculateBeddingKit = (people: number) => {
  return roundToTwo(people * ADD_ONS.beddingKit.perPerson)
}

const calculateBikeRack = (enabled: boolean) => {
  return enabled ? roundToTwo(ADD_ONS.bikeRack.perTrip) : 0
}

const calculateGenerator = (
  generatorDailyUnlimited: boolean,
  generatorHours: number,
  billedDayCount: number,
) => {
  if (generatorDailyUnlimited) {
    return roundToTwo(ADD_ONS.generator.daily * billedDayCount)
  }
  return roundToTwo(toNonNegativeNumber(generatorHours, 0) * ADD_ONS.generator.hourly)
}

const toFiniteNumber = (value: unknown, defaultValue = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : defaultValue
}

const toNonNegativeNumber = (value: unknown, defaultValue = 0) => {
  const n = toFiniteNumber(value, defaultValue)
  return n < 0 ? defaultValue : n
}

const toNonNegativeInteger = (value: unknown, defaultValue = 0) => {
  const n = Math.trunc(toFiniteNumber(value, defaultValue))
  if (!Number.isFinite(n) || n < 0) return defaultValue
  return n
}

const VALID_VEHICLE_TYPES: VehicleType[] = [
  'classA',
  'classB',
  'classC',
  'trailer',
]

export function sanitizePayload(
  raw: Partial<RentalCalculateRequest> | null | undefined,
) {
  const vt = raw?.vehicleType
  const vehicleType = VALID_VEHICLE_TYPES.includes(vt as VehicleType)
    ? (vt as VehicleType)
    : 'classC'

  const defaultModel = defaults?.vehicleModelByType?.[vehicleType] ?? ''
  const rawModel =
    typeof raw?.vehicleModel === 'string' ? raw.vehicleModel.trim() : ''
  const vehicleModel = rawModel || defaultModel

  return {
    startDate: raw?.startDate,
    endDate: raw?.endDate,
    vehicleType,
    vehicleModel,
    cancellationWaiver: Boolean(raw?.cancellationWaiver),
    windshieldCoverage: Boolean(raw?.windshieldCoverage),
    generatorDailyUnlimited: Boolean(raw?.generatorDailyUnlimited),
    kmPackages: toNonNegativeInteger(raw?.kmPackages, 0),
    extraKm: toNonNegativeInteger(raw?.extraKm, 0),
    generatorHours: toNonNegativeNumber(raw?.generatorHours, 0),
    kitchenKit: Boolean(raw?.kitchenKit),
    beddingKitPeople: toNonNegativeInteger(raw?.beddingKitPeople, 0),
    bikeRack: Boolean(raw?.bikeRack),
  }
}

const buildLineItems = (b: RentalQuoteBreakdown) => [
  { name: 'Daily Rental', value: b.dailyRateTotal },
  { name: 'CDW', value: b.cdw },
  { name: 'Prep Fee', value: b.prepFee },
  { name: 'KM Packages', value: b.kmPackages },
  { name: 'Hitch', value: b.hitch },
  { name: 'Extra KM', value: b.extraKm },
  { name: 'Generator', value: b.generator },
  { name: 'Cancellation Waiver', value: b.cancellationWaiver },
  { name: 'Windshield Coverage', value: b.windshield },
  { name: 'Kitchen Kit', value: b.kitchenKit },
  { name: 'Bedding Kit', value: b.beddingKit },
  { name: 'Bike Rack', value: b.bikeRack },
  { name: 'Tax', value: b.tax },
]

const buildSummaryMessage = ({
  total,
  vehicleType,
  calendarDays,
}: {
  total: number
  vehicleType: VehicleType
  calendarDays: number
}) => {
  let summary =
    `Your estimated total for this rental is ${formatCurrency(total)}. ` +
    'This includes the daily rental rate, preparation fee, kilometer packages where applicable, taxes, a full tank of propane, and a full demonstration of the vehicle.'

  if (vehicleType === 'trailer') {
    summary +=
      ' Please note: You must have a properly rated tow vehicle with hitch receiver, brake controller, and electrical adaptor installed.'
  }

  if (calendarDays < MIN_CHARGE_DAYS_FOR_DAILY_RATE) {
    summary += ` Base daily rates are charged for a minimum of ${MIN_CHARGE_DAYS_FOR_DAILY_RATE} days even when your selected dates are shorter.`
  }

  summary +=
    ' CDW Plus (Collision Damage Waiver) is included in the total shown above, as listed in the breakdown.'
  summary += ' A $3000 security deposit is required.'
  return summary
}

export class RentalQuoteError extends Error {
  statusCode: number
  constructor(message: string, statusCode = 400) {
    super(message)
    this.name = 'RentalQuoteError'
    this.statusCode = statusCode
  }
}

/** Aligned with `Sasha-Project/src/services/rentalQuote.js` and `rentalPricing.json`. */
export function calculateRentalQuote(
  payload: RentalCalculateRequest,
): RentalCalculateResponse & {
  total: number
  lineItems: { name: string; value: number }[]
} {
  const sanitized = sanitizePayload(payload)
  const startDate = parseISO(sanitized.startDate as string)
  const endDate = parseISO(sanitized.endDate as string)

  if (!isValid(startDate) || !isValid(endDate)) {
    throw new RentalQuoteError('Invalid startDate or endDate')
  }
  if (endDate <= startDate) {
    throw new RentalQuoteError('endDate must be after startDate')
  }

  if (!sanitized.vehicleModel) {
    throw new RentalQuoteError(
      'vehicleModel is required (no default configured for this vehicle type)',
    )
  }

  resolvePricingRow(sanitized.vehicleType, sanitized.vehicleModel)

  const days = calendarRentalDays(startDate, endDate)
  const daysForDailyRateSum = billedDaysForDailyRates(days)
  const dailyRateTotal = calculateDailyRateTotal(
    startDate,
    daysForDailyRateSum,
    sanitized.vehicleType,
    sanitized.vehicleModel,
  )
  const cdw = calculateCDW(days)

  const prepFee = roundToTwo(getPrepFee(sanitized.vehicleType))
  const kmPackages = roundToTwo(sanitized.kmPackages * KM_PACKAGE_RATE)
  const hitch = roundToTwo(sanitized.vehicleType === 'trailer' ? TRAILER_HITCH_FEE : 0)
  const extraKm = roundToTwo(sanitized.extraKm * EXTRA_KM_RATE)
  const generator = calculateGenerator(
    sanitized.generatorDailyUnlimited,
    sanitized.generatorHours,
    daysForDailyRateSum,
  )
  const cancellationWaiver = calculateCancellationWaiver(
    sanitized.cancellationWaiver,
    days,
  )
  const windshield = calculateWindshield(
    sanitized.vehicleType,
    days,
    sanitized.windshieldCoverage,
  )
  const kitchenKit = calculateKitchenKit(sanitized.kitchenKit)
  const beddingKit = calculateBeddingKit(sanitized.beddingKitPeople)
  const bikeRack = calculateBikeRack(sanitized.bikeRack)

  const subtotal = roundToTwo(dailyRateTotal + cdw)
  const totalBeforeTax = roundToTwo(
    subtotal +
      prepFee +
      kmPackages +
      hitch +
      extraKm +
      generator +
      cancellationWaiver +
      windshield +
      kitchenKit +
      beddingKit +
      bikeRack,
  )
  const tax = roundToTwo(totalBeforeTax * TAX_RATE)
  const total = roundToTwo(totalBeforeTax + tax)

  const breakdown: RentalQuoteBreakdown = {
    days,
    dailyRateTotal: roundToTwo(dailyRateTotal),
    cdw: roundToTwo(cdw),
    prepFee: roundToTwo(prepFee),
    kmPackages: roundToTwo(kmPackages),
    hitch: roundToTwo(hitch),
    extraKm: roundToTwo(extraKm),
    generator: roundToTwo(generator),
    cancellationWaiver: roundToTwo(cancellationWaiver),
    windshield: roundToTwo(windshield),
    kitchenKit: roundToTwo(kitchenKit),
    beddingKit: roundToTwo(beddingKit),
    bikeRack: roundToTwo(bikeRack),
    tax: roundToTwo(tax),
  }

  return {
    total,
    totalFormatted: formatCurrency(total),
    summaryMessage: buildSummaryMessage({
      total,
      vehicleType: sanitized.vehicleType,
      calendarDays: days,
    }),
    breakdown,
    lineItems: buildLineItems(breakdown),
  }
}
