import { getAccessToken } from '../../../app/auth/services/authSession';
import { endSessionHere, refreshAccessToken } from '../../../app/auth/services/authApi';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

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

type QueryValue = string | number | boolean | undefined | null;

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

async function request<T>(path: string, init: RequestInit = {}, isRetry = false): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');

  // The token from the shared sign-in (src/app/auth).
  const token = getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  } catch {
    
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
  }

  // The access token lasts 15 minutes: renew it once and repeat the request.
  // If it can't be renewed, the session is over and the app sends the user to sign in.
  if (response.status === 401) {
    let renewed = false;
    if (!isRetry) {
      try {
        renewed = await refreshAccessToken();
      } catch {
        throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
      }
    }
    if (renewed) return request<T>(path, init, true);
    endSessionHere();
    throw new ApiError(401, 'Your session has ended. Sign in again to continue.');
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    let fieldErrors: Record<string, string> = {};
    try {
      const body = await response.json();
      message = body.message ?? message;
      fieldErrors = body.fieldErrors ?? {};
    } catch {
      // No JSON body: keep the default message.
    }
    if (response.status === 403) {
      message = "You don't have permission to do this.";
    }
    throw new ApiError(response.status, message, fieldErrors);
  }

  
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

export function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  return request<T>(path, { method: 'POST', body: formData });
}
