// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import TablePager from './TablePager';
import { pageOf } from './tablePagerUtils';

describe('pageOf', () => {
  const rows = Array.from({ length: 33 }, (_, index) => index + 1);

  it('returns the rows of the chosen page', () => {
    expect(pageOf(rows, 2, 20)).toEqual(rows.slice(20, 33));
  });

  it('shows the last page when the list got shorter than the chosen page', () => {
    expect(pageOf(rows.slice(0, 5), 3, 20)).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('TablePager', () => {
  afterEach(cleanup);
  const pager = { page: 1, pageSize: 20, setPage: () => {}, setPageSize: () => {} };

  it('is hidden for short lists', () => {
    const { container } = render(<TablePager total={8} pager={pager} />);
    expect(container.innerHTML).toBe('');
  });

  it('shows the range for long lists', () => {
    render(<TablePager total={33} pager={pager} />);
    expect(screen.getByText('1–20 of 33 items')).toBeTruthy();
  });
});
