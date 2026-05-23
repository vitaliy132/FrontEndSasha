/** Parse a non-negative integer from a string; returns fallback when invalid. */
export function parseNonNegativeInt(raw: string, fallback = 0): number {
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n >= 0 ? n : fallback
}

/** Parse a non-negative number from a URL/query param string. */
export function parseNonNegNumber(raw: string | null): number | undefined {
  if (raw === null || raw === '') return undefined
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 0) return undefined
  return n
}
