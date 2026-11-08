
import { Search } from '@carbon/react'

import type { CohortSubmissionStatus } from '../../types/mentor.types'

interface CohortSubmissionFiltersProps {
  searchTerm: string
  selectedStatus: 'All' | CohortSubmissionStatus
  onSearchChange: (value: string) => void
  onStatusChange: (value: 'All' | CohortSubmissionStatus) => void
}

const statusOptions: Array<'All' | CohortSubmissionStatus> = [
  'All',
  'Not Ready',
  'Draft',
  'Submitted',
  'Under Review',
  'Returned',
  'Approved',
]

function CohortSubmissionFilters({
  searchTerm,
  selectedStatus,
  onSearchChange,
  onStatusChange,
}: CohortSubmissionFiltersProps) {
  return (
    <div className="cohort-submission-filters">
      <div className="cohort-submission-filters__search">
        <Search
          size="lg"
          labelText="Search cohort submissions"
          placeholder="Search by cohort or facility"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="cohort-submission-filters__status">
        <label htmlFor="submission-status-filter">
          Submission status
        </label>

        <select
          id="submission-status-filter"
          value={selectedStatus}
          onChange={(event) =>
            onStatusChange(
              event.target.value as 'All' | CohortSubmissionStatus,
            )
          }
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status === 'All' ? 'All statuses' : status}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default CohortSubmissionFilters
