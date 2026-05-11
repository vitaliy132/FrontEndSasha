import type { SubmitLeadRequest, RentalCalculateRequest, RentalCalculateResponse } from '../types/rental'

/** Empty string = same origin (Vite dev server proxies to the API). Set VITE_API_BASE in production. */
const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, '') ?? ''

export function getApiBase(): string {
  return API_BASE || '(same origin / proxy)'
}

export async function calculateRental(body: RentalCalculateRequest): Promise<RentalCalculateResponse> {
  const url = `${API_BASE}/calculate-rental`
  console.log('API Request:', { url, body })
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  console.log('API Response:', { status: res.status, statusText: res.statusText, headers: res.headers })

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
    console.error('API Error:', errorMessage)
    throw new Error(errorMessage)
  }

  if (!isJson) {
    const text = await res.text()
    const err = `Invalid response type: expected JSON, got ${contentType || 'unknown'}. Response: ${text}`
    console.error('Content Type Error:', err)
    throw new Error(err)
  }

  try {
    const responseText = await res.text()
    console.log('Response Text:', responseText)
    
    if (!responseText || responseText.trim() === '') {
      throw new Error('Response body is empty')
    }
    
    const data = JSON.parse(responseText) as RentalCalculateResponse
    console.log('Parsed Response:', data)
    return data
  } catch (err) {
    const errorMsg = `Failed to parse response: ${err instanceof Error ? err.message : 'Unknown error'}`
    console.error('Parse Error:', errorMsg)
    throw new Error(errorMsg)
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
