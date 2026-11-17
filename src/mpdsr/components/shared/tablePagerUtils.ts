import { useState } from 'react';

// Available rows per page.
export const PAGE_SIZES = [10, 20, 50];

export interface Pager {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
}

// Tracks the current page and page size.
export function usePager(initialPageSize = 20): Pager {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  return { page, pageSize, setPage, setPageSize };
}

// Returns only the rows belonging to the current page.
export function pageOf<T>(
  rows: T[],
  page: number,
  pageSize: number,
): T[] {
  const lastPage = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, lastPage);

  return rows.slice((current - 1) * pageSize, current * pageSize);
}
