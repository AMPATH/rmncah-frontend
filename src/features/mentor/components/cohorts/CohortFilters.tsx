interface CohortFiltersProps {
  search: string
  status: string
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
}

function CohortFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: CohortFiltersProps) {
  return (
    <div className="mentor-cohort-filters">
      <div className="mentor-cohort-filters__search">
        <label htmlFor="cohort-search">
          Search cohorts
        </label>

        <input
          id="cohort-search"
          type="search"
          placeholder="Search by cohort or facility..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="mentor-cohort-filters__status">
        <label htmlFor="cohort-status">
          Status
        </label>

        <select
          id="cohort-status"
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
        >
          <option value="All">All statuses</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Paused">Paused</option>
        </select>
      </div>
    </div>
  )
}

export default CohortFilters