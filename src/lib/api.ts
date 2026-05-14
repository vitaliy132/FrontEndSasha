import type {
  SubmitLeadRequest,
  RentalCalculateRequest,
  RentalCalculateResponse,
  RentalOptionsResponse,
} from '../types/rental'

/** Empty string = same origin (Vite dev server proxies to the API). Set VITE_API_BASE in production. */
const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, '') ?? ''

export function getApiBase(): string {
  return API_BASE || '(same origin / proxy)'
}

async function buildErrorMessage(res: Response, isJson: boolean): Promise<string> {
  let errorMessage = `Request failed (${res.status})`

  if (isJson) {
    try {
      const errorData = await res.json() as { error?: string; message?: string }
      return errorData.message || errorData.error || errorMessage
    } catch {
      // Fall through to text fallback
    }
  }

  try {
    const text = await res.text()
    errorMessage = text || errorMessage
  } catch {
    // Keep default status-based message
  }

  return errorMessage
}

export async function fetchRentalOptions(): Promise<RentalOptionsResponse> {
  const res = await fetch(`${API_BASE}/rental-options`)
  const contentType = res.headers.get('content-type')
  const isJson = contentType?.includes('application/json')

  if (!res.ok) {
    const errorMessage = await buildErrorMessage(res, !!isJson)
    throw new Error(errorMessage)
  }

  if (!isJson) {
    throw new Error('Invalid response type: expected JSON for rental options.')
  }

  return await res.json() as RentalOptionsResponse
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
    const errorMessage = await buildErrorMessage(res, !!isJson)
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

export interface SubmitLeadResponse {
  message: string
}

export async function submitLead(body: SubmitLeadRequest): Promise<SubmitLeadResponse> {
  const res = await fetch(`${API_BASE}/submit-lead`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const contentType = res.headers.get('content-type')
  const isJson = contentType?.includes('application/json')

  if (!res.ok) {
    const errorMessage = await buildErrorMessage(res, !!isJson)
    throw new Error(errorMessage)
  }

  if (!isJson) {
    return { message: 'Request submitted' }
  }

  const text = await res.text()
  if (!text.trim()) {
    return { message: 'Request submitted' }
  }

  try {
    const data = JSON.parse(text) as { message?: string }
    return { message: data.message ?? 'Request submitted' }
  } catch {
    throw new Error('Could not read server response after submit.')
  }
}
