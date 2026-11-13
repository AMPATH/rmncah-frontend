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
}


function RecommendationsTable({ recommendations, description }: RecommendationsTableProps) {
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
                  <TableCell colSpan={headers.length}>No recommendations yet.</TableCell>
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
        </TableContainer>
      )}
    </DataTable>
  );
}

export default RecommendationsTable;
