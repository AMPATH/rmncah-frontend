import TablePager from '../../../components/shared/TablePager';
import { pageOf, usePager } from '../../../components/shared/tablePagerUtils';
import type { ChangeEvent } from 'react';
import { Link } from 'react-router';
import { isReviewed } from '../utils/caseReview';
import {
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
import { useCurrentUser } from '../../../context/currentUserContext';
import { can } from '../../../auth/permissions';
import { issuesInScope } from '../../../auth/scope';
import { useApiData } from '../../../hooks/useApiData';
import ApiErrorNotice from '../../../components/shared/ApiErrorNotice';
import { getIssues, getStoredRecommendations } from '../services/issueService';
import type { StoredIssue, StoredRecommendation } from '../services/issueService';

const issueTypeLabels: Record<string, string> = {
  perinatal: 'Perinatal',
  maternal: 'Maternal',
  'near-miss': 'Near miss',
};

const headers = [
  { key: 'code', header: 'Issue' },
  { key: 'issueType', header: 'Type' },
  { key: 'loggedAt', header: 'Logged at' },
  { key: 'dateLogged', header: 'Date logged' },
  { key: 'review', header: 'Review' },
  { key: 'recommendations', header: 'Recommendations' },
  { key: 'stillOpen', header: 'Not closed' },
  { key: 'action', header: 'Actions' },
];

function IssuesPage() {
  const pager = usePager();
  const { currentUser, scope } = useCurrentUser();
  const issuesData = useApiData<StoredIssue[]>(getIssues, []);
  const recommendationsData = useApiData<StoredRecommendation[]>(getStoredRecommendations, []);
  const canAdd = can(currentUser, 'recommendation.add');
  const canReview = can(currentUser, 'issue.review');

  const rows = issuesInScope(issuesData.data, scope)
    .sort((a, b) => b.code.localeCompare(a.code))
    .map((issue) => {
      const ofIssue = recommendationsData.data.filter((recommendation) => recommendation.issueId === issue.id);
      return {
        id: issue.code,
        code: issue.code,
        issueType: (issueTypeLabels[issue.issueType] ?? issue.issueType) + (issue.cancelled ? ' · Cancelled' : ''),
        loggedAt: issue.loggedAt,
        dateLogged: issue.dateLogged,
        review: issue.cancelled ? '—' : isReviewed(issue) ? 'Reviewed' : 'Pending review',
        recommendations: ofIssue.length,
        stillOpen: ofIssue.filter((recommendation) => recommendation.status !== 'Closed' && recommendation.status !== 'Cancelled').length,
        action: '',
      };
    });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Issues</h1>
          <p className="page-subtitle">Issues logged at your places, and their recommendations.</p>
        </div>
      </div>

      {(issuesData.failed || recommendationsData.failed) && <ApiErrorNotice />}

      {issuesData.loading || recommendationsData.loading ? (
        <DataTableSkeleton columnCount={6} rowCount={4} />
      ) : (
        <DataTable rows={rows} headers={headers} isSortable>
          {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getCellProps, onInputChange }) => (
            <TableContainer>
              <TableToolbar>
                <TableToolbarContent>
                  <TableToolbarSearch
                    persistent
                    placeholder="Search issues"
                    onChange={(event) => onInputChange(event as ChangeEvent<HTMLInputElement>)}
                  />
                </TableToolbarContent>
              </TableToolbar>
              <Table {...getTableProps()} aria-label="Issues">
                <TableHead>
                  <TableRow>
                    {headers.map((header) => {
                      const { key, ...headerProps } = getHeaderProps({ header, isSortable: header.key !== 'action' });
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
                      <TableCell colSpan={headers.length}>No issues logged at your places yet.</TableCell>
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
                                {cell.info.header === 'code' ? (
                                  <Link className="cds--link" to={`/issues/${row.id}`}>
                                    {cell.value}
                                  </Link>
                                ) : cell.info.header === 'review' ? (
                                  cell.value === '—' ? (
                                    '—'
                                  ) : cell.value === 'Pending review' && canReview ? (
                                    <Link className="cds--link" to={`/issues/${row.id}/review`}>
                                      Review case
                                    </Link>
                                  ) : (
                                    <Tag type={cell.value === 'Reviewed' ? 'green' : 'purple'} size="sm">
                                      {cell.value}
                                    </Tag>
                                  )
                                ) : cell.info.header === 'action' ? (
                                  canAdd && (
                                    <Link className="cds--link" to={`/issues/${row.id}/recommendation`}>
                                      Add recommendation
                                    </Link>
                                  )
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
      )}
    </div>
  );
}

export default IssuesPage;
