/**
 * Shared error handling for API responses
 * Handles JSON parsing, error extraction, and fallbacks
 */
export async function handleApiResponse<T>(
  response: Response,
  endpoint: string
): Promise<T> {
  const contentType = response.headers.get('content-type')
  const isJson = contentType?.includes('application/json')

  if (!response.ok) {
    let errorMessage = `Request failed (${response.status})`
    
    if (isJson) {
      try {
        const errorData = (await response.json()) as { error?: string; message?: string }
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        try {
          const text = await response.text()
          errorMessage = text || errorMessage
        } catch {
          // Fallback to status code message
        }
      }
    } else {
      try {
        const text = await response.text()
        errorMessage = text || errorMessage
      } catch {
        // Fallback to status code message
      }
    }
    
    console.error(`API Error (${endpoint}):`, errorMessage)
    throw new Error(errorMessage)
  }

  if (!isJson) {
    const text = await response.text()
    const err = `Invalid response type: expected JSON, got ${contentType || 'unknown'}. Response: ${text}`
    console.error(`Content Type Error (${endpoint}):`, err)
    throw new Error(err)
  }

  try {
    const responseText = await response.text()
    
    if (!responseText || responseText.trim() === '') {
      throw new Error('Response body is empty')
    }
    
    const data = JSON.parse(responseText) as T
    return data
  } catch (err) {
    const errorMsg = `Failed to parse response: ${err instanceof Error ? err.message : 'Unknown error'}`
    console.error(`Parse Error (${endpoint}):`, errorMsg)
    throw new Error(errorMsg)
  }
}
