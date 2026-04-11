import type { SubmitLeadRequest, RentalCalculateRequest, RentalCalculateResponse } from '../types/rental'

/** Empty string = same origin (Vite dev server proxies to the API). Set VITE_API_BASE in production. */
const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, '') ?? ''

export function getApiBase(): string {
  return API_BASE || '(same origin / proxy)'
}

export async function calculateRental(body: RentalCalculateRequest): Promise<RentalCalculateResponse> {
  const res = await fetch(`${API_BASE}/calculate-rental`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const contentType = res.headers.get('content-type')
  const isJson = contentType?.includes('application/json')

  if (!res.ok) {
    let errorMessage = `Request failed (${res.status})`
    if (isJson) {
      try {
        const errorData = await res.json() as { error?: string; message?: string }
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        // If JSON parsing fails, try to get text
        try {
          const text = await res.text()
          errorMessage = text || errorMessage
        } catch {
          // Fallback to status code message
        }
      }
    } else {
      try {
        const text = await res.text()
        errorMessage = text || errorMessage
      } catch {
        // Fallback to status code message
      }
    }
    throw new Error(errorMessage)
  }

  if (!isJson) {
    const text = await res.text()
    throw new Error(`Invalid response type: expected JSON, got ${contentType || 'unknown'}. Response: ${text}`)
  }

  try {
    return (await res.json()) as RentalCalculateResponse
  } catch (err) {
    throw new Error(`Failed to parse response: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }
}

export async function submitLead(body: SubmitLeadRequest): Promise<void> {
  const res = await fetch(`${API_BASE}/submit-lead`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const contentType = res.headers.get('content-type')
  const isJson = contentType?.includes('application/json')

  if (!res.ok) {
    let errorMessage = `Request failed (${res.status})`
    if (isJson) {
      try {
        const errorData = await res.json() as { error?: string; message?: string }
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        // If JSON parsing fails, try to get text
        try {
          const text = await res.text()
          errorMessage = text || errorMessage
        } catch {
          // Fallback to status code message
        }
      }
    } else {
      try {
        const text = await res.text()
        errorMessage = text || errorMessage
      } catch {
        // Fallback to status code message
      }
    }
    throw new Error(errorMessage)
  }
}
