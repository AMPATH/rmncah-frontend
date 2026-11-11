
import { Button, Search } from '@carbon/react'

interface ResourceFiltersProps {
  searchTerm: string
  selectedModule: string
  selectedType: string
  moduleOptions: string[]
  onSearchChange: (value: string) => void
  onModuleChange: (value: string) => void
  onTypeChange: (value: string) => void
  onClear: () => void
}

export default function ResourceFilters({
  searchTerm,
  selectedModule,
  selectedType,
  moduleOptions,
  onSearchChange,
  onModuleChange,
  onTypeChange,
  onClear,
}: ResourceFiltersProps) {
  const hasFilters =
    searchTerm !== '' ||
    selectedModule !== 'All modules' ||
    selectedType !== 'All types'

  return (
    <div className="resource-filters">
      <div className="resource-filters__search">
        <Search
          size="lg"
          labelText="Search resources"
          placeholder="Search by title, module or keyword"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="resource-filters__field">
        <label htmlFor="resource-module-filter">
          Training module
        </label>

        <select
          id="resource-module-filter"
          value={selectedModule}
          onChange={(event) => onModuleChange(event.target.value)}
        >
          <option value="All modules">All modules</option>

          {moduleOptions.map((module) => (
            <option value={module} key={module}>
              {module}
            </option>
          ))}
        </select>
      </div>

      <div className="resource-filters__field">
        <label htmlFor="resource-type-filter">
          Resource type
        </label>

        <select
          id="resource-type-filter"
          value={selectedType}
          onChange={(event) => onTypeChange(event.target.value)}
        >
          <option value="All types">All types</option>
          <option value="E-book">E-book</option>
          <option value="Slides">Slides</option>
          <option value="Video">Video</option>
        </select>
      </div>

      <div className="resource-filters__actions">
        <Button
          kind="ghost"
          size="md"
          disabled={!hasFilters}
          onClick={onClear}
        >
          Clear filters
        </Button>
      </div>
    </div>
  )
}
