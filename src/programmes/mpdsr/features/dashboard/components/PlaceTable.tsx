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
import type { PlaceRow } from '../utils/reportFigures';

const headers = [
  { key: 'place', header: 'Place' },
  { key: 'issues', header: 'Issues' },
  { key: 'recommendations', header: 'Recommendations' },
  { key: 'running', header: 'Still running' },
  { key: 'overdue', header: 'Overdue' },
  { key: 'closed', header: 'Closed' },
];

function PlaceTable({ rows }: { rows: PlaceRow[] }) {
  return (
    <DataTable rows={rows} headers={headers} isSortable size="sm">
      {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getCellProps }) => (
        <TableContainer title="By place" description="Where issues were logged, and how their recommendations stand">
          <Table {...getTableProps()} aria-label="Figures by place">
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
                  <TableCell colSpan={headers.length}>No issues match these filters.</TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  const { key, ...rowProps } = getRowProps({ row });
                  return (
                    <TableRow key={key} {...rowProps}>
                      {row.cells.map((cell) => {
                        const { key: cellKey, ...cellProps } = getCellProps({ cell });
                        return (
                          <TableCell key={cellKey} {...cellProps}>
                            {cell.value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DataTable>
  );
}

export default PlaceTable;
