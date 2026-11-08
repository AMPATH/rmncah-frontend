import { Dropdown, Search } from '@carbon/react'

interface MenteeFiltersProps {
  search: string
  cohort: string
  competencyStatus: string
  onSearchChange: (value: string) => void
  onCohortChange: (value: string) => void
  onCompetencyStatusChange: (value: string) => void
}

const cohortOptions = [
  { id: 'All', text: 'All cohorts' },
  { id: 'Cohort A', text: 'Cohort A' },
  { id: 'Cohort B', text: 'Cohort B' },
  { id: 'Cohort C', text: 'Cohort C' },
  { id: 'Cohort D', text: 'Cohort D' },
]

const competencyOptions = [
  { id: 'All', text: 'All statuses' },
  { id: 'Competent', text: 'Competent' },
  { id: 'In Progress', text: 'In Progress' },
  { id: 'Needs Support', text: 'Needs Support' },
]

function MenteeFilters({
  search,
  cohort,
  competencyStatus,
  onSearchChange,
  onCohortChange,
  onCompetencyStatusChange,
}: MenteeFiltersProps) {
  return (
    <div className="mentee-filters">
      <div className="mentee-filters__search">
        <Search
          id="mentee-search"
          labelText="Search mentees"
          placeholder="Search by name or facility"
          value={search}
          onChange={(event) => onSearchChange(event.currentTarget.value)}
          size="lg"
        />
      </div>

      <div className="mentee-filters__dropdown">
        <Dropdown
          id="mentee-cohort-filter"
          titleText="Cohort"
          label="All cohorts"
          items={cohortOptions}
          itemToString={(item) => item?.text ?? ''}
          selectedItem={
            cohortOptions.find((item) => item.id === cohort) ??
            cohortOptions[0]
          }
          onChange={({ selectedItem }) => {
            if (selectedItem) {
              onCohortChange(selectedItem.id)
            }
          }}
        />
      </div>

      <div className="mentee-filters__dropdown">
        <Dropdown
          id="mentee-status-filter"
          titleText="Competency status"
          label="All statuses"
          items={competencyOptions}
          itemToString={(item) => item?.text ?? ''}
          selectedItem={
            competencyOptions.find(
              (item) => item.id === competencyStatus,
            ) ?? competencyOptions[0]
          }
          onChange={({ selectedItem }) => {
            if (selectedItem) {
              onCompetencyStatusChange(selectedItem.id)
            }
          }}
        />
      </div>
    </div>
  )
}

export default MenteeFilters