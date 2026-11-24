import { useState } from 'react';
import { Link } from 'react-router';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Search,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
  TextInput,
} from '@carbon/react';
import TablePager from '../../../components/shared/TablePager';
import { pageOf, usePager } from '../../../components/shared/tablePagerUtils';
import DownloadMenu from '../../../components/shared/DownloadMenu';
import { useCurrentUser } from '../../../context/currentUserContext';
import { can } from '../../../auth/permissions';
import { issuesInScope } from '../../../auth/scope';
import { placesWithin } from '../../../auth/locations';
import { useApiData } from '../../../hooks/useApiData';
import { getToday } from '../../../utils/dates';
import ApiErrorNotice from '../../../components/shared/ApiErrorNotice';
import { getIssues, getStoredRecommendations } from '../services/issueService';
import type { StoredIssue, StoredRecommendation } from '../services/issueService';
import { filterIssues, noIssueFilters, reviewState } from '../utils/issueFilters';
import type { IssueFilterValues } from '../utils/issueFilters';
import './IssuesPage.scss';

const issueTypeLabels: Record<string, string> = {
  perinatal: 'Perinatal',
  maternal: 'Maternal',
  'near-miss': 'Near miss',
};

const reviewLabels: Record<string, string> = {
  pending: 'Pending review',
  reviewed: 'Reviewed',
  cancelled: 'Cancelled',
};

const placeTypeOrder = ['county', 'sub-county', 'facility', 'community-unit'];

const headers = [
  { key: 'code', header: 'Issue' },
  { key: 'issueType', header: 'Type' },
  { key: 'loggedAt', header: 'Logged at' },
  { key: 'dateLogged', header: 'Date logged' },
  { key: 'review', header: 'Review' },
  { key: 'recommendations', header: 'Recommendations' },
  { key: 'stillOpen', header: 'Not closed' },
];

function IssuesPage() {
  const pager = usePager();
  const { currentUser, locations, scope } = useCurrentUser();
  const issuesData = useApiData<StoredIssue[]>(getIssues, []);
  const recommendationsData = useApiData<StoredRecommendation[]>(getStoredRecommendations, []);
  const [filters, setFilters] = useState<IssueFilterValues>(noIssueFilters);
  const canReview = can(currentUser, 'issue.review');
  const today = getToday();

  const placeOptions = locations
    .filter((location) => scope.has(location.name))
    .sort((a, b) => placeTypeOrder.indexOf(a.type) - placeTypeOrder.indexOf(b.type) || a.name.localeCompare(b.name));
  const placeSet = filters.place ? placesWithin([filters.place], locations) : null;

  const shown = filterIssues(issuesInScope(issuesData.data, scope), filters, placeSet).sort((a, b) =>
    b.code.localeCompare(a.code)
  );

  const rows = shown.map((issue) => {
    const ofIssue = recommendationsData.data.filter((recommendation) => recommendation.issueId === issue.id);
    return {
      id: issue.code,
      code: issue.code,
      issueType: issueTypeLabels[issue.issueType] ?? issue.issueType,
      loggedAt: issue.loggedAt,
      dateLogged: issue.dateLogged,
      review: reviewLabels[reviewState(issue)],
      recommendations: ofIssue.length,
      stillOpen: ofIssue.filter((recommendation) => recommendation.status !== 'Closed' && recommendation.status !== 'Cancelled')
        .length,
    };
  });

  const filtered = JSON.stringify(filters) !== JSON.stringify(noIssueFilters);

  function change(name: keyof IssueFilterValues, value: string) {
    setFilters((current) => ({ ...current, [name]: value }));
    pager.setPage(1);
  }

  function buildReport(extension: 'xlsx' | 'pdf') {
    const chosen = [
      filters.search && `Search: ${filters.search}`,
      filters.issueType && `Type: ${issueTypeLabels[filters.issueType]}`,
      filters.place && `Place: ${filters.place}`,
      filters.review && `Review: ${reviewLabels[filters.review]}`,
      (filters.from || filters.to) && `Logged: ${filters.from || '…'} to ${filters.to || '…'}`,
    ].filter(Boolean);
    return {
      fileName: `mpdsr-issues-${today}.${extension}`,
      title: 'MPDSR issues',
      details: [
        `Generated ${today}${currentUser ? ` by ${currentUser.fullName}` : ''}`,
        chosen.length ? chosen.join(' · ') : 'All issues in your places',
      ],
      sections: [
        {
          title: `${rows.length} issue(s)`,
          head: ['Issue', 'Type', 'Logged at', 'Date logged', 'Review', 'Recommendations', 'Not closed'],
          rows: rows.map((row) => [
            row.code,
            row.issueType,
            row.loggedAt,
            row.dateLogged,
            row.review,
            row.recommendations,
            row.stillOpen,
          ]),
        },
      ],
    };
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Issues</h1>
          <p className="page-subtitle">Issues logged at your places, and their recommendations.</p>
        </div>
        <DownloadMenu build={buildReport} disabled={rows.length === 0} />
      </div>

      {(issuesData.failed || recommendationsData.failed) && <ApiErrorNotice />}

      <div className="issue-filters">
        <Search
          id="issueSearch"
          size="md"
          labelText="Search"
          placeholder="Search by code, place or cause"
          value={filters.search}
          onChange={(event) => change('search', event.target.value)}
        />
        <Select id="issueTypeFilter" labelText="Type" value={filters.issueType} onChange={(event) => change('issueType', event.target.value)}>
          <SelectItem value="" text="All types" />
          {Object.entries(issueTypeLabels).map(([value, text]) => (
            <SelectItem key={value} value={value} text={text} />
          ))}
        </Select>
        <Select id="issuePlaceFilter" labelText="Place" value={filters.place} onChange={(event) => change('place', event.target.value)}>
          <SelectItem value="" text="All places" />
          {placeOptions.map((location) => (
            <SelectItem key={location.id} value={location.name} text={location.name} />
          ))}
        </Select>
        <Select id="issueReviewFilter" labelText="Review" value={filters.review} onChange={(event) => change('review', event.target.value)}>
          <SelectItem value="" text="Any" />
          {Object.entries(reviewLabels).map(([value, text]) => (
            <SelectItem key={value} value={value} text={text} />
          ))}
        </Select>
        <TextInput
          id="issueFrom"
          type="date"
          labelText="Logged from"
          value={filters.from}
          max={filters.to || today}
          onChange={(event) => change('from', event.target.value)}
        />
        <TextInput
          id="issueTo"
          type="date"
          labelText="Logged to"
          value={filters.to}
          min={filters.from}
          max={today}
          onChange={(event) => change('to', event.target.value)}
        />
        {filtered && (
          <Button kind="ghost" size="md" onClick={() => setFilters(noIssueFilters)}>
            Clear filters
          </Button>
        )}
      </div>

      {issuesData.loading || recommendationsData.loading ? (
        <DataTableSkeleton columnCount={6} rowCount={4} />
      ) : (
        <DataTable rows={rows} headers={headers} isSortable>
          {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getCellProps }) => (
            <TableContainer description={`${rows.length} issue(s)${filtered ? ' match the filters' : ''}`}>
              <Table {...getTableProps()} aria-label="Issues">
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
                        {filtered ? 'No issues match these filters.' : 'No issues logged at your places yet.'}
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
                                {cell.info.header === 'code' ? (
                                  <Link className="cds--link" to={`/issues/${row.id}`}>
                                    {cell.value}
                                  </Link>
                                ) : cell.info.header === 'review' ? (
                                  cell.value === 'Pending review' && canReview ? (
                                    <Link className="cds--link" to={`/issues/${row.id}/review`}>
                                      Review case
                                    </Link>
                                  ) : (
                                    <Tag
                                      type={cell.value === 'Reviewed' ? 'green' : cell.value === 'Cancelled' ? 'gray' : 'purple'}
                                      size="sm"
                                    >
                                      {cell.value}
                                    </Tag>
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