import { clearAuthToken, getAuthToken } from './authToken';

// One place for talking to the API. The address comes from VITE_API_BASE_URL in .env:
// in development /api (json-server through the Vite proxy), later the real backend.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

// The error shape the backend is asked to return (see docs/api-contract.md):
// { "message": "Validation failed", "fieldErrors": { "dateOfDeath": "Must be after date of birth" } }
export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string>;

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

// Fired when the server says the sign-in is missing or expired (401).
// The app listens for it and sends the user to sign in.
export const UNAUTHORIZED_EVENT = 'mpdsr:unauthorized';

type QueryValue = string | number | boolean | undefined | null;

// Turns { status: 'Open', page: 2, mine: undefined } into "?status=Open&page=2".
function toQueryString(params?: Record<string, QueryValue>): string {
  if (!params) return '';
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, String(value));
    }
  }
  const text = search.toString();
  return text ? `?${text}` : '';
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  // A FormData body (file upload) sets its own Content-Type.
  if (!(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');

  const token = getAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  } catch {
    // No answer at all: offline, or the server isn't running.
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
  }

  if (response.status === 401) {
    clearAuthToken();
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    let fieldErrors: Record<string, string> = {};
    try {
      const body = await response.json();
      message = body.message ?? message;
      fieldErrors = body.fieldErrors ?? {};
    } catch {
      // The server sent no JSON error body; keep the default message.
    }
    if (response.status === 403) {
      message = "You don't have permission to do this.";
    }
    throw new ApiError(response.status, message, fieldErrors);
  }

  // 204 No Content: nothing to read.
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export function apiGet<T>(path: string, params?: Record<string, QueryValue>): Promise<T> {
  return request<T>(`${path}${toQueryString(params)}`);
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });
}

export function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
}

export function apiPut<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
}

export function apiDelete<T = void>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}

// For forms with a file, e.g. supporting evidence on Mark as done.
export function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  return request<T>(path, { method: 'POST', body: formData });
}
