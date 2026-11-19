import TablePager from '../../../components/shared/TablePager';
import { pageOf, usePager } from '../../../components/shared/tablePagerUtils';
import {
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import type { Recommendation } from '../../issues/types/issue.types';
import StatusTag from '../../../components/shared/StatusTag';
import { Link } from 'react-router';
import { CheckmarkOutline } from '@carbon/icons-react';

const headers = [
  { key: 'id', header: 'ID' },
  { key: 'text', header: 'Recommendation' },
  { key: 'level', header: 'Level' },
  { key: 'dueDate', header: 'Due' },
  { key: 'status', header: 'Status' },
];

interface RecommendationsTableProps {
  recommendations: Recommendation[];
  description: string;
  emptyText?: string;
}

function RecommendationsTable({ recommendations, description, emptyText = 'No recommendations yet.' }: RecommendationsTableProps) {
  const pager = usePager();
  return (
    <DataTable rows={recommendations} headers={headers} isSortable>
      {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getCellProps }) => (
        <TableContainer
          title="Action plan"
          description={description}
        >
          <Table {...getTableProps()} aria-label="Action plan">
            <TableHead>
              <TableRow>
                {headers.map((header) => {
                  const { key, ...headerProps } = getHeaderProps({ header });
                  return (
                    <TableHeader key={key} {...headerProps}>
                      {header.header}
                    </TableHeader>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={headers.length}>
                    <span className="table-empty">
                      <CheckmarkOutline size={16} />
                      {emptyText}
                    </span>
                  </TableCell>
                </TableRow>
              ) : (
                pageOf(rows, pager.page, pager.pageSize).map((row) => {
                  const { key, ...rowProps } = getRowProps({ row });
                  return (
                    <TableRow key={key} {...rowProps}>
                      {row.cells.map((cell) => {
                        const { key: cellKey, ...cellProps } = getCellProps({ cell });
                        return (
                          <TableCell key={cellKey} {...cellProps}>
                            {cell.info.header === 'status' ? (
                              <StatusTag status={cell.value} />
                            ) : cell.info.header === 'id' ? (
                              <Link className="cds--link" to={`/recommendations/${cell.value}`}>
                                {cell.value}
                              </Link>
                            ) : (
                              cell.value
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <TablePager total={rows.length} pager={pager} />
        </TableContainer>
      )}
    </DataTable>
  );
}

export default RecommendationsTable;
