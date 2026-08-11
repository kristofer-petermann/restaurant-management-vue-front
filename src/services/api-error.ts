export function parseApiError(error: unknown): string | null {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: unknown } }).response
    const data = response?.data

    if (typeof data === 'object' && data !== null) {
      if ('messages' in data && Array.isArray(data.messages)) {
        return data.messages.join(' ')
      }
      if ('error' in data && typeof data.error === 'string') {
        return data.error
      }
      if ('title' in data && typeof data.title === 'string') {
        return data.title
      }
      if ('detail' in data && typeof data.detail === 'string') {
        return data.detail
      }
    }
  }

  return error instanceof Error ? error.message : null
}
