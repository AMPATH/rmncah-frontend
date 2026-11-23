const BASE_URL = '/emonc-api'

export class EmONCApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'EmONCApiError'
    this.status = status
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
  } catch {
    throw new EmONCApiError(
      'Unable to connect to the EmONC development API.',
    )
  }

  if (!response.ok) {
    const message = await response.text()

    throw new EmONCApiError(
      message || `API request failed with status ${response.status}.`,
      response.status,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const emoncApi = {
  get<T>(collection: string): Promise<T[]> {
    return request<T[]>(`/${collection}`)
  },

  create<T>(collection: string, record: T): Promise<T> {
    return request<T>(`/${collection}`, {
      method: 'POST',
      body: JSON.stringify(record),
    })
  },

  update<T>(
    collection: string,
    id: string,
    changes: Partial<T>,
  ): Promise<T> {
    return request<T>(`/${collection}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
    })
  },

  delete(collection: string, id: string): Promise<void> {
    return request<void>(
      `/${collection}/${encodeURIComponent(id)}`,
      { method: 'DELETE' },
    )
  },
}
