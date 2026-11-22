// An in-memory stand-in for the json-server API, used by the flow tests.
type Row = Record<string, unknown> & { id: string };

export const fakeDb: Record<string, Row[] | Record<string, unknown>> = {};
let nextId = 1;

export function resetFakeDb(seed: Record<string, unknown>) {
  for (const key of Object.keys(fakeDb)) delete fakeDb[key];
  Object.assign(fakeDb, structuredClone(seed) as typeof fakeDb);
  nextId = 1;
}

export function rows<T = Row>(collection: string): T[] {
  return ((fakeDb[collection] as Row[] | undefined) ?? []) as T[];
}

function collectionOf(path: string): string {
  return path.replace(/^\//, '').split('/')[0];
}

export const fakeApiClient = {
  apiGet: async (path: string, params: Record<string, unknown> = {}) => {
    const data = fakeDb[collectionOf(path)];
    if (!Array.isArray(data)) return structuredClone(data ?? {});
    const filters = Object.entries(params).filter(([, value]) => value !== undefined && value !== '');
    return structuredClone(data.filter((row) => filters.every(([key, value]) => String(row[key]) === String(value))));
  },
  apiPost: async (path: string, body: Record<string, unknown>) => {
    const name = collectionOf(path);
    const list = (fakeDb[name] as Row[] | undefined) ?? [];
    const row = { ...body, id: (body.id as string) ?? `id${nextId++}` } as Row;
    list.push(row);
    fakeDb[name] = list;
    return structuredClone(row);
  },
  apiPatch: async (path: string, changes: Record<string, unknown>) => {
    const [name, id] = path.replace(/^\//, '').split('/');
    const list = (fakeDb[name] as Row[] | undefined) ?? [];
    const row = list.find((item) => item.id === id);
    if (!row) throw new Error(`Not found: ${path}`);
    Object.assign(row, changes);
    return structuredClone(row);
  },
};