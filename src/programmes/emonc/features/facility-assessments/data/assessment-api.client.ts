const BASE_URL = '/assessment-api'

export class AssessmentApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'AssessmentApiError'
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
    throw new AssessmentApiError(
      'Unable to connect to the Facility Assessment API.',
    )
  }

  if (!response.ok) {
    const message = await response.text()

    throw new AssessmentApiError(
      message || `Assessment API request failed with status ${response.status}.`,
      response.status,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const assessmentApi = {
  get<T>(collection: string): Promise<T[]> {
    return request<T[]>(`/${collection}`)
  },

  getById<T>(collection: string, id: string): Promise<T> {
    return request<T>(
      `/${collection}/${encodeURIComponent(id)}`,
    )
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
    return request<T>(
      `/${collection}/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(changes),
      },
    )
  },

  delete(collection: string, id: string): Promise<void> {
    return request<void>(
      `/${collection}/${encodeURIComponent(id)}`,
      { method: 'DELETE' },
    )
  },
}
