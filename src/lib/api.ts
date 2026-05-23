import type {
  SubmitLeadRequest,
  RentalCalculateRequest,
  RentalCalculateResponse,
  RentalOptionsResponse,
} from '../types/rental'

/** Empty string = same origin (Vite dev server proxies to the API). Set VITE_API_BASE in production. */
const API_BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') ?? ''

async function buildErrorMessage(res: Response, isJson: boolean): Promise<string> {
  let errorMessage = `Request failed (${res.status})`

  if (isJson) {
    try {
      const errorData = (await res.json()) as { error?: string; message?: string }
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

function isJsonResponse(res: Response): boolean {
  return res.headers.get('content-type')?.includes('application/json') ?? false
}

interface FetchJsonOptions {
  allowEmptyBody?: boolean
}

async function fetchJson<T>(path: string, init?: RequestInit, options?: FetchJsonOptions): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init)
  const isJson = isJsonResponse(res)

  if (!res.ok) {
    throw new Error(await buildErrorMessage(res, isJson))
  }

  if (!isJson) {
    if (options?.allowEmptyBody) {
      return { message: 'Request submitted' } as T
    }
    throw new Error(`Invalid response type: expected JSON from ${path}.`)
  }

  const text = await res.text()
  if (!text.trim()) {
    if (options?.allowEmptyBody) {
      return { message: 'Request submitted' } as T
    }
    throw new Error(`Empty JSON response from ${path}.`)
  }

  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error(`Could not parse JSON from ${path}.`)
  }
}

export async function fetchRentalOptions(): Promise<RentalOptionsResponse> {
  return fetchJson<RentalOptionsResponse>('/rental-options')
}

export async function calculateRental(body: RentalCalculateRequest): Promise<RentalCalculateResponse> {
  return fetchJson<RentalCalculateResponse>('/calculate-rental', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export interface SubmitLeadResponse {
  message: string
}

export async function submitLead(body: SubmitLeadRequest): Promise<SubmitLeadResponse> {
  const data = await fetchJson<{ message?: string }>(
    '/submit-lead',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    { allowEmptyBody: true },
  )
  return { message: data.message ?? 'Request submitted' }
}
