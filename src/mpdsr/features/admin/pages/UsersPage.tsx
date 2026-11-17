import TablePager from '../../../components/shared/TablePager';
import { pageOf, usePager } from '../../../components/shared/tablePagerUtils';
import type { ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tag,
} from '@carbon/react';
import { Add } from '@carbon/icons-react';
import { useCurrentUser } from '../../../context/currentUserContext';
import { roleLabels } from '../../../auth/permissions';
import '../admin.scss';

const headers = [
  { key: 'fullName', header: 'Name' },
  { key: 'role', header: 'Role' },
  { key: 'cadre', header: 'Cadre' },
  { key: 'email', header: 'Email' },
  { key: 'places', header: 'Places' },
  { key: 'status', header: 'Status' },
];

// Admin: everyone who can use MPDSR, with their role and places.
function UsersPage() {
  const pager = usePager();
  const navigate = useNavigate();
  const { users, ready } = useCurrentUser();

  const rows = users.map((user) => ({
    id: user.id,
    fullName: user.fullName,
    role: roleLabels[user.role],
    cadre: user.cadre,
    email: user.email,
    places: user.assignedLocations.join(', ') || '—',
    status: user.active === false ? 'Deactivated' : 'Active',
  }));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p className="page-subtitle">Who can use MPDSR, their role, and the places they cover.</p>
        </div>
        <Button renderIcon={Add} onClick={() => navigate('/admin/users/new')}>
          Add user
        </Button>
      </div>

      {!ready ? (
        <DataTableSkeleton columnCount={5} rowCount={5} />
      ) : (
        <DataTable rows={rows} headers={headers} isSortable>
          {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getCellProps, onInputChange }) => (
            <TableContainer>
              <TableToolbar>
                <TableToolbarContent>
                  <TableToolbarSearch
                    persistent
                    placeholder="Search users"
                    onChange={(event) => onInputChange(event as ChangeEvent<HTMLInputElement>)}
                  />
                </TableToolbarContent>
              </TableToolbar>
              <Table {...getTableProps()} aria-label="Users">
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
                  {pageOf(rows, pager.page, pager.pageSize).map((row) => {
                    const { key, ...rowProps } = getRowProps({ row });
                    return (
                      <TableRow key={key} {...rowProps}>
                        {row.cells.map((cell) => {
                          const { key: cellKey, ...cellProps } = getCellProps({ cell });
                          return (
                            <TableCell key={cellKey} {...cellProps}>
                              {cell.info.header === 'status' ? (
                                <Tag type={cell.value === 'Active' ? 'green' : 'gray'}>{cell.value}</Tag>
                              ) : cell.info.header === 'fullName' ? (
                                <Link className="cds--link" to={`/admin/users/${row.id}`}>
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
                  })}
                </TableBody>
              </Table>
              <TablePager total={rows.length} pager={pager} />
            </TableContainer>
          )}
        </DataTable>
      )}
    </div>
  );
}

export default UsersPage;
