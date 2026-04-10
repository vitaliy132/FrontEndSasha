import {
  addDays,
  differenceInCalendarDays,
  format,
  parseISO,
} from 'date-fns'
import type { RentalCalculateRequest, RentalCalculateResponse } from '../types/rental'

const TAX_RATE = 0.13
const MIN_DAYS = 5
const CDW_DAILY_RATE = 30
const CDW_MINIMUM = 210
const KM_PACKAGE_RATE = 350
const TRAILER_HITCH_FEE = 150
const EXTRA_KM_RATE = 0.41
const GENERATOR_HOUR_RATE = 5

const SEASONS: { name: string; start: string; end: string; price: number }[] = [
  { name: 'high', start: '06-01', end: '08-31', price: 200 },
  { name: 'mid', start: '04-01', end: '05-31', price: 150 },
  { name: 'low', start: '09-01', end: '03-31', price: 100 },
]

const roundToTwo = (num: number) => Number(num.toFixed(2))

const formatCurrency = (value: number) => `$${roundToTwo(value).toFixed(2)}`

const isDateInSeason = (mmdd: string, season: (typeof SEASONS)[0]) => {
  if (season.start <= season.end) {
    return mmdd >= season.start && mmdd <= season.end
  }
  return mmdd >= season.start || mmdd <= season.end
}

const getDailyRate = (date: Date) => {
  const mmdd = format(date, 'MM-dd')
  const season = SEASONS.find((item) => isDateInSeason(mmdd, item))
  return season ? season.price : 100
}

const calculateDays = (startDate: Date, endDate: Date) =>
  differenceInCalendarDays(endDate, startDate) + 1

const calculateDailyRateTotal = (startDate: Date, days: number) => {
  let total = 0
  for (let dayOffset = 0; dayOffset < days; dayOffset += 1) {
    total += getDailyRate(addDays(startDate, dayOffset))
  }
  return roundToTwo(total)
}

const getPrepFee = (vehicleType: RentalCalculateRequest['vehicleType']) =>
  vehicleType === 'classA' ? 199 : 149

const calculateCDW = (cdwPlus: boolean, days: number) => {
  if (!cdwPlus) return 0
  return roundToTwo(Math.max(days * CDW_DAILY_RATE, CDW_MINIMUM))
}

const calculateExtras = (payload: RentalCalculateRequest) => {
  return {
    prepFee: roundToTwo(getPrepFee(payload.vehicleType)),
    kmPackages: roundToTwo(payload.kmPackages * KM_PACKAGE_RATE),
    hitch: roundToTwo(
      payload.vehicleType === 'trailer' ? TRAILER_HITCH_FEE : 0,
    ),
    extraKm: roundToTwo((payload.extraKm || 0) * EXTRA_KM_RATE),
    generator: roundToTwo((payload.generatorHours || 0) * GENERATOR_HOUR_RATE),
  }
}

const calculateTotal = ({
  dailyRateTotal,
  cdw,
  extras,
}: {
  dailyRateTotal: number
  cdw: number
  extras: ReturnType<typeof calculateExtras>
}) => {
  const subtotal = roundToTwo(dailyRateTotal + cdw)
  const totalBeforeTax = roundToTwo(
    subtotal +
      extras.prepFee +
      extras.kmPackages +
      extras.hitch +
      extras.extraKm +
      extras.generator,
  )
  const tax = roundToTwo(totalBeforeTax * TAX_RATE)
  const total = roundToTwo(totalBeforeTax + tax)
  return { subtotal, totalBeforeTax, tax, total }
}

const buildSummaryMessage = ({
  total,
  vehicleType,
}: {
  total: number
  vehicleType: RentalCalculateRequest['vehicleType']
}) => {
  let summary =
    `Your estimated total for this rental is ${formatCurrency(total)}. ` +
    'This includes the daily rental rate, Collision Damage Waiver, preparation fee, selected kilometer packages, taxes, a full tank of propane, and a full demonstration of the vehicle.'

  if (vehicleType === 'trailer') {
    summary +=
      ' Please note: You must have a properly rated tow vehicle with hitch receiver, brake controller, and electrical adaptor installed.'
  }

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

/** Matches backend `rentalQuote.js` so estimates stay consistent with POST /calculate-rental. */
export function calculateRentalQuote(
  payload: RentalCalculateRequest,
): RentalCalculateResponse & { total: number } {
  const startDate = parseISO(payload.startDate)
  const endDate = parseISO(payload.endDate)
  const days = calculateDays(startDate, endDate)

  if (days < MIN_DAYS) {
    throw new RentalQuoteError(`Rental must be at least ${MIN_DAYS} days`)
  }

  const dailyRateTotal = calculateDailyRateTotal(startDate, days)
  const cdw = calculateCDW(payload.cdwPlus, days)
  const extras = calculateExtras(payload)
  const totals = calculateTotal({ dailyRateTotal, cdw, extras })

  return {
    total: roundToTwo(totals.total),
    totalFormatted: formatCurrency(totals.total),
    summaryMessage: buildSummaryMessage({
      total: totals.total,
      vehicleType: payload.vehicleType,
    }),
    breakdown: {
      days,
      dailyRateTotal: roundToTwo(dailyRateTotal),
      cdw: roundToTwo(cdw),
      prepFee: roundToTwo(extras.prepFee),
      kmPackages: roundToTwo(extras.kmPackages),
      hitch: roundToTwo(extras.hitch),
      extraKm: roundToTwo(extras.extraKm),
      generator: roundToTwo(extras.generator),
      tax: roundToTwo(totals.tax),
    },
  }
}
