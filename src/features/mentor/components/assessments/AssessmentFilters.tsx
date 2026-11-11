
import { Search, Button } from '@carbon/react'


interface AssessmentFiltersProps {
  searchTerm: string
  selectedCohort: string
  selectedType: string
  selectedStatus: string
  cohortOptions: string[]
  onSearchChange: (value: string) => void
  onCohortChange: (value: string) => void
  onTypeChange: (value: string) => void
  onStatusChange: (value: string) => void
  onClear: () => void
}

export default function AssessmentFilters({
  searchTerm,
  selectedCohort,
  selectedType,
  selectedStatus,
  cohortOptions,
  onSearchChange,
  onCohortChange,
  onTypeChange,
  onStatusChange,
  onClear,
}: AssessmentFiltersProps) {
  const hasFilters =
    searchTerm !== '' ||
    selectedCohort !== 'All cohorts' ||
    selectedType !== 'All types' ||
    selectedStatus !== 'All statuses'

  return (
    <section className="assessment-filters">
      <div className="assessment-filters__search">
        <Search
          size="lg"
          labelText="Search assessments"
          placeholder="Search mentee, module or facility"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="assessment-filters__field">
        <label htmlFor="assessment-cohort">Cohort</label>
        <select
          id="assessment-cohort"
          value={selectedCohort}
          onChange={(event) => onCohortChange(event.target.value)}
        >
          <option>All cohorts</option>
          {cohortOptions.map((cohort) => (
            <option key={cohort} value={cohort}>
              {cohort}
            </option>
          ))}
        </select>
      </div>

      <div className="assessment-filters__field">
        <label htmlFor="assessment-type">Assessment type</label>
        <select
          id="assessment-type"
          value={selectedType}
          onChange={(event) => onTypeChange(event.target.value)}
        >
          <option>All types</option>
          <option value="Theory">Theory</option>
          <option value="Practical">Practical</option>
        </select>
      </div>

      <div className="assessment-filters__field">
        <label htmlFor="assessment-status">Status</label>
        <select
          id="assessment-status"
          value={selectedStatus}
          onChange={(event) => onStatusChange(event.target.value)}
        >
          <option>All statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="assessment-filters__clear">
        <Button
          kind="ghost"
          size="md"
          disabled={!hasFilters}
          onClick={onClear}
        >
          Clear filters
        </Button>
      </div>
    </section>
  )
}
