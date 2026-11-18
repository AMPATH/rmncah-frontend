import { Pagination } from '@carbon/react';
import { PAGE_SIZES, type Pager } from './tablePagerUtils';

interface TablePagerProps {
  total: number;
  pager: Pager;
}
function TablePager({ total, pager }: TablePagerProps) {
  if (total <= PAGE_SIZES[0]) {
    return null;
  }

  const lastPage = Math.max(1, Math.ceil(total / pager.pageSize));

  return (
    <Pagination
      page={Math.min(pager.page, lastPage)}
      pageSize={pager.pageSize}
      pageSizes={PAGE_SIZES}
      totalItems={total}
      backwardText="Previous page"
      forwardText="Next page"
      itemsPerPageText="Rows per page:"
      onChange={({ page, pageSize }) => {
        pager.setPage(page);
        pager.setPageSize(pageSize);
      }}
    />
  );
}

export default TablePager;
