import type { SubmitLeadRequest, RentalCalculateRequest, RentalCalculateResponse } from '../types/rental'
import { handleApiResponse } from './fetchUtils'

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

  console.log('API Response:', { status: res.status, statusText: res.statusText })
  const data = await handleApiResponse<RentalCalculateResponse>(res, '/calculate-rental')
  console.log('Parsed Response:', data)
  return data
}

export async function submitLead(body: SubmitLeadRequest): Promise<void> {
  const res = await fetch(`${API_BASE}/submit-lead`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  await handleApiResponse<{ message?: string }>(res, '/submit-lead')
}
