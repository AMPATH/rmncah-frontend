import { Select, SelectItem, Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@carbon/react';
import { CheckmarkOutline } from '@carbon/icons-react';
import TablePager from '../../../components/shared/TablePager';
import { pageOf, usePager } from '../../../components/shared/tablePagerUtils';
import type { FacilityRow, Period, PeriodKey } from '../utils/trackerFigures';
import './Tracker.scss';

interface FacilityTableProps {
  rows: FacilityRow[];
  periods: Period[];
  period: Period;
  onPeriodChange: (key: PeriodKey) => void;
}

function FacilityTable({ rows, periods, period, onPeriodChange }: FacilityTableProps) {
  const pager = usePager(10);

  return (
    <TableContainer
      className="facility-table"
      title={`Issues by place — ${period.label}`}
      description="Places with logged issues, highest first"
    >
      <div className="facility-table__tools">
        <Select
          id="facilityPeriod"
          labelText="Period"
          inline
          size="sm"
          value={period.key}
          onChange={(event) => {
            onPeriodChange(event.target.value as PeriodKey);
            pager.setPage(1);
          }}
        >
          {periods.map((item) => (
            <SelectItem key={item.key} value={item.key} text={item.label} />
          ))}
        </Select>
      </div>
      <Table aria-label="Issues by place" size="md">
        <TableHead>
          <TableRow>
            <TableHeader>#</TableHeader>
            <TableHeader>Place</TableHeader>
            <TableHeader>Sub-county</TableHeader>
            <TableHeader>County</TableHeader>
            <TableHeader className="facility-table__number">Maternal</TableHeader>
            <TableHeader className="facility-table__number">Perinatal</TableHeader>
            <TableHeader className="facility-table__number">Near miss</TableHeader>
            <TableHeader className="facility-table__number">Total</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8}>
                <span className="table-empty">
                  <CheckmarkOutline size={16} />
                  No issues logged in this period.
                </span>
              </TableCell>
            </TableRow>
          ) : (
            pageOf(rows, pager.page, pager.pageSize).map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{(pager.page - 1) * pager.pageSize + index + 1}</TableCell>
                <TableCell className="facility-table__name">{row.facility}</TableCell>
                <TableCell>{row.subCounty}</TableCell>
                <TableCell>{row.county}</TableCell>
                <TableCell className="facility-table__number">{row.maternal}</TableCell>
                <TableCell className="facility-table__number">{row.perinatal}</TableCell>
                <TableCell className="facility-table__number">{row.nearMiss}</TableCell>
                <TableCell className="facility-table__number facility-table__total">{row.total}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <TablePager total={rows.length} pager={pager} />
    </TableContainer>
  );
}

export default FacilityTable;