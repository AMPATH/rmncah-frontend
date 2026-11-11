import { useState } from 'react';
import DashboardFilters from '../components/DashboardFilters';
import StatPanel from '../components/StatPanel';
import type { DashboardFilterValues } from '../types/dashboard.types';
import './DashboardPage.scss';

const noFilters: DashboardFilterValues = {
  county: '',
  subCounty: '',
  facility: '',
  issueType: '',
  setting: '',
  period: '',
};

// Page 8: counts and performance, calculated by the backend from the records.
function DashboardPage() {
  const [filters, setFilters] = useState<DashboardFilterValues>(noFilters);

  // Location lists. Empty until the backend provides them.
  const counties: string[] = [];
  const subCounties: string[] = [];
  const facilities: string[] = [];

  // Changes one filter and keeps the others as they are.
  function handleFilterChange(name: keyof DashboardFilterValues, value: string) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard and reports</h1>
      </div>

      <DashboardFilters
        filters={filters}
        counties={counties}
        subCounties={subCounties}
        facilities={facilities}
        onFilterChange={handleFilterChange}
      />

      <div className="dashboard-grid">
        <StatPanel
          title="Issues by type"
          rows={[
            { label: 'Perinatal', value: 0 },
            { label: 'Maternal', value: 0 },
            { label: 'Near miss', value: 0 },
          ]}
          note="Also by setting, delay, cause and period of death."
        />

        <StatPanel
          title="Recommendations by status"
          rows={[
            { label: 'Open', value: 0 },
            { label: 'In progress', value: 0 },
            { label: 'Overdue', value: 0 },
            { label: 'Pending approval', value: 0 },
            { label: 'Closed', value: 0 },
          ]}
          note="Also by classification and level."
        />

        <StatPanel
          title="Needs action"
          rows={[
            { label: 'Pending acceptance', value: 0 },
            { label: 'Pending approval', value: 0 },
            { label: 'Rejected', value: 0 },
            { label: 'Escalated', value: 0 },
            { label: 'Due within 7 days', value: 0 },
            { label: 'Overdue', value: 0 },
          ]}
        />
      </div>

      <StatPanel
        title="Performance"
        rows={[
          { label: 'Time to acceptance', value: '—' },
          { label: 'Completed by due date', value: '—' },
          { label: 'Redone, and how many times', value: '—' },
        ]}
      />

      <p className="form-note">
        Figures are calculated from the records and limited to your access level.
      </p>
    </div>
  );
}

export default DashboardPage;
