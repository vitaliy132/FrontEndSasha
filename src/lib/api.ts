import type { SubmitLeadRequest } from '../types/rental'

/** Empty string = same origin (Vite dev server proxies to the API). Set VITE_API_BASE in production. */
const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, '') ?? ''

export function getApiBase(): string {
  return API_BASE || '(same origin / proxy)'
}

export async function submitLead(body: SubmitLeadRequest): Promise<void> {
  const res = await fetch(`${API_BASE}/submit-lead`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed (${res.status})`)
  }
}
