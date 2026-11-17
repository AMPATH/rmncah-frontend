import { Select, SelectItem } from '@carbon/react';
import type { DashboardFilterValues } from '../types/dashboard.types';

interface DashboardFiltersProps {
  filters: DashboardFilterValues;
  counties: string[];
  subCounties: string[];
  facilities: string[];
  onFilterChange: (name: keyof DashboardFilterValues, value: string) => void;
}

// Narrows every figure on the dashboard. Location lists come from the backend.
function DashboardFilters({
  filters,
  counties,
  subCounties,
  facilities,
  onFilterChange,
}: DashboardFiltersProps) {
  return (
    <div className="dashboard-filters">
      <Select
        id="filterCounty"
        labelText="County"
        value={filters.county}
        onChange={(event) => onFilterChange('county', event.target.value)}
      >
        <SelectItem value="" text="All counties" />
        {counties.map((name) => (
          <SelectItem key={name} value={name} text={name} />
        ))}
      </Select>

      <Select
        id="filterSubCounty"
        labelText="Sub-county"
        value={filters.subCounty}
        onChange={(event) => onFilterChange('subCounty', event.target.value)}
      >
        <SelectItem value="" text="All sub-counties" />
        {subCounties.map((name) => (
          <SelectItem key={name} value={name} text={name} />
        ))}
      </Select>

      <Select
        id="filterFacility"
        labelText="Facility"
        value={filters.facility}
        onChange={(event) => onFilterChange('facility', event.target.value)}
      >
        <SelectItem value="" text="All facilities" />
        {facilities.map((name) => (
          <SelectItem key={name} value={name} text={name} />
        ))}
      </Select>

      <Select
        id="filterIssueType"
        labelText="Issue type"
        value={filters.issueType}
        onChange={(event) => onFilterChange('issueType', event.target.value)}
      >
        <SelectItem value="" text="All types" />
        <SelectItem value="perinatal" text="Perinatal" />
        <SelectItem value="maternal" text="Maternal" />
        <SelectItem value="near-miss" text="Near miss" />
      </Select>

      <Select
        id="filterSetting"
        labelText="Setting"
        value={filters.setting}
        onChange={(event) => onFilterChange('setting', event.target.value)}
      >
        <SelectItem value="" text="All settings" />
        <SelectItem value="facility" text="Facility" />
        <SelectItem value="community" text="Community" />
      </Select>

      <Select
        id="filterPeriod"
        labelText="Period"
        value={filters.period}
        onChange={(event) => onFilterChange('period', event.target.value)}
      >
        <SelectItem value="" text="All time" />
        <SelectItem value="this-month" text="This month" />
        <SelectItem value="last-3-months" text="Last 3 months" />
        <SelectItem value="last-6-months" text="Last 6 months" />
        <SelectItem value="this-year" text="This year" />
      </Select>
    </div>
  );
}

export default DashboardFilters;
