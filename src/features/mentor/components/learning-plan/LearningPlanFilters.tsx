
import { Search, Dropdown, Button } from '@carbon/react'

interface LearningPlanFiltersProps {
  searchTerm: string
  selectedCohort: string
  selectedStatus: string
  cohortOptions: string[]
  onSearchChange: (value: string) => void
  onCohortChange: (value: string) => void
  onStatusChange: (value: string) => void
  onClear: () => void
}

const statusOptions = [
  'All statuses',
  'Not Started',
  'In Progress',
  'Completed',
  'Needs Attention',
]

function LearningPlanFilters({
  searchTerm,
  selectedCohort,
  selectedStatus,
  cohortOptions,
  onSearchChange,
  onCohortChange,
  onStatusChange,
  onClear,
}: LearningPlanFiltersProps) {
  return (
    <section className="learning-plan-filters">
      <div className="learning-plan-filters__search">
        <Search
          id="learning-plan-search"
          labelText="Search learning plans"
          placeholder="Search by plan, cohort or facility"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="learning-plan-filters__dropdown">
        <Dropdown
          id="learning-plan-cohort-filter"
          titleText="Cohort"
          label="All cohorts"
          items={['All cohorts', ...cohortOptions]}
          selectedItem={selectedCohort}
          itemToString={(item) => item ?? ''}
          onChange={({ selectedItem }) =>
            onCohortChange(selectedItem ?? 'All cohorts')
          }
        />
      </div>

      <div className="learning-plan-filters__dropdown">
        <Dropdown
          id="learning-plan-status-filter"
          titleText="Plan status"
          label="All statuses"
          items={statusOptions}
          selectedItem={selectedStatus}
          onChange={({ selectedItem }) =>
            onStatusChange(selectedItem ?? 'All statuses')
          }
        />
      </div>

      <div className="learning-plan-filters__clear">
        <Button
          kind="ghost"
          size="md"
          onClick={onClear}
        >
          Clear filters
        </Button>
      </div>
    </section>
  )
}

export default LearningPlanFilters
