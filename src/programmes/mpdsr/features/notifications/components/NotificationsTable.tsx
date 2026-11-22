import TablePager from '../../../components/shared/TablePager';
import { pageOf, usePager } from '../../../components/shared/tablePagerUtils';
import { Link } from 'react-router';
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
import { formatDateTime } from '../../../utils/dates';
import type { AppNotification } from '../types/notification.types';

const headers = [
  { key: 'when', header: 'When' },
  { key: 'message', header: 'Message' },
  { key: 'recommendationId', header: 'Record' },
  { key: 'from', header: 'From' },
  { key: 'read', header: 'Status' },
];

interface NotificationsTableProps {
  notifications: AppNotification[];
  onOpen: (notification: AppNotification) => void;
}

function NotificationsTable({ notifications, onOpen }: NotificationsTableProps) {
  const pager = usePager();
  const rows = notifications.map((notification) => ({
    ...notification,
    when: notification.at ? formatDateTime(notification.at) : notification.date,
  }));

  return (
    <DataTable rows={rows} headers={headers}>
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
                  <TableCell colSpan={headers.length}>No notifications here.</TableCell>
                </TableRow>
              ) : (
                pageOf(rows, pager.page, pager.pageSize).map((row) => {
                  const { key, ...rowProps } = getRowProps({ row });
                  const notification = notifications.find((item) => item.id === row.id)!;
                  return (
                    <TableRow
                      key={key}
                      {...rowProps}
                      className={notification.read ? undefined : 'notifications__row--unread'}
                    >
                      {row.cells.map((cell) => {
                        const { key: cellKey, ...cellProps } = getCellProps({ cell });
                        return (
                          <TableCell key={cellKey} {...cellProps}>
                            {cell.info.header === 'read' ? (
                              <Tag type={cell.value ? 'gray' : 'blue'}>
                                {cell.value ? 'Read' : 'Unread'}
                              </Tag>
                            ) : cell.info.header === 'recommendationId' ? (
                              <Link
                                className="cds--link"
                                to={
                                  notification.category === 'review-needed'
                                    ? `/issues/${cell.value}/review`
                                    : notification.category === 'reviewed'
                                      ? `/issues/${cell.value}`
                                      : `/recommendations/${cell.value}`
                                }
                                onClick={() => onOpen(notification)}
                              >
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

export default NotificationsTable;
