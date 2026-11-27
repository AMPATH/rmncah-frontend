import { apiGet } from './apiClient';

// The real backend (NestJS) wraps every reply as { success, data, meta? }.
// json-server returns the data bare, so calls that moved to the backend go through here.
interface Envelope<T> {
  success: boolean;
  data: T;
  meta?: { total: number; page: number; limit: number; totalPages: number };
}

type Query = Record<string, string | number | boolean | undefined | null>;

export async function backendGet<T>(path: string, query?: Query): Promise<T> {
  const body = await apiGet<Envelope<T>>(path, query);
  return body.data;
}

// Reads every page of a paged list (the backend gives at most 100 rows a page).
export async function backendGetAll<T>(path: string, query: Query = {}, limit = 100): Promise<T[]> {
  const first = await apiGet<Envelope<T[]>>(path, { ...query, page: 1, limit });
  const totalPages = first.meta?.totalPages ?? 1;
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) =>
      apiGet<Envelope<T[]>>(path, { ...query, page: index + 2, limit }),
    ),
  );
  return [first, ...rest].flatMap((body) => body.data);
}
