import {
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
} from '@carbon/react';
import type { AppNotification } from '../types/notification.types';

const headers = [
  { key: 'date', header: 'Date' },
  { key: 'message', header: 'Message' },
  { key: 'recommendationId', header: 'Recommendation' },
  { key: 'from', header: 'From' },
  { key: 'read', header: 'Status' },
];

interface NotificationsTableProps {
  notifications: AppNotification[];
}

// The notifications in the chosen tab, newest first (the backend sorts them).
function NotificationsTable({ notifications }: NotificationsTableProps) {
  return (
    <DataTable rows={notifications} headers={headers} isSortable>
      {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getCellProps }) => (
        <TableContainer>
          <Table {...getTableProps()} aria-label="Notifications">
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
                  <TableCell colSpan={headers.length}>No notifications yet.</TableCell>
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
                            {cell.info.header === 'read' ? (
                              <Tag type={cell.value ? 'gray' : 'blue'}>
                                {cell.value ? 'Read' : 'Unread'}
                              </Tag>
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

export default NotificationsTable;
