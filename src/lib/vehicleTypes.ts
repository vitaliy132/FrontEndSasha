import type { VehicleType } from '../types/rental'

/** Canonical order for selects and URL parsing. */
export const VEHICLE_TYPES: VehicleType[] = [
  'classA',
  'classB',
  'classC',
  'trailer',
]

/**
 * Short labels for UI and lead copy.
 * Keep in sync with `Sasha-Project/src/routes/submitLead.js` → `VEHICLE_TYPE_SHORT`.
 */
export const VEHICLE_TYPE_LABEL: Record<VehicleType, string> = {
  classA: 'Class A',
  classB: 'Class B',
  classC: 'Class C',
  trailer: 'Travel trailer',
}
