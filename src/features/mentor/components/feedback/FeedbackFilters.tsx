
import { Search } from '@carbon/react'

import type {
  FeedbackCategory,
  FeedbackDirection,
  FeedbackStatus,
} from '../../data/mentorFeedbackData'

interface FeedbackFiltersProps {
  searchTerm: string
  selectedDirection: 'All' | FeedbackDirection
  selectedStatus: 'All' | FeedbackStatus
  selectedCategory: 'All' | FeedbackCategory
  onSearchChange: (value: string) => void
  onDirectionChange: (value: 'All' | FeedbackDirection) => void
  onStatusChange: (value: 'All' | FeedbackStatus) => void
  onCategoryChange: (value: 'All' | FeedbackCategory) => void
}

function FeedbackFilters({
  searchTerm,
  selectedDirection,
  selectedStatus,
  selectedCategory,
  onSearchChange,
  onDirectionChange,
  onStatusChange,
  onCategoryChange,
}: FeedbackFiltersProps) {
  return (
    <div className="mentor-feedback-filters">
      <div className="mentor-feedback-filters__search">
        <Search
          size="lg"
          labelText="Search feedback"
          placeholder="Search feedback, sender or cohort"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="feedback-filter-field">
        <label htmlFor="feedback-direction">Direction</label>
        <select
          id="feedback-direction"
          value={selectedDirection}
          onChange={(event) =>
            onDirectionChange(event.target.value as 'All' | FeedbackDirection)
          }
        >
          <option value="All">All feedback</option>
          <option value="Received">Received</option>
          <option value="Sent">Sent</option>
        </select>
      </div>

      <div className="feedback-filter-field">
        <label htmlFor="feedback-category">Category</label>
        <select
          id="feedback-category"
          value={selectedCategory}
          onChange={(event) =>
            onCategoryChange(event.target.value as 'All' | FeedbackCategory)
          }
        >
          <option value="All">All categories</option>
          <option value="Training">Training</option>
          <option value="Assessment">Assessment</option>
          <option value="Cohort">Cohort</option>
          <option value="Support">Support</option>
          <option value="General">General</option>
        </select>
      </div>

      <div className="feedback-filter-field">
        <label htmlFor="feedback-status">Status</label>
        <select
          id="feedback-status"
          value={selectedStatus}
          onChange={(event) =>
            onStatusChange(event.target.value as 'All' | FeedbackStatus)
          }
        >
          <option value="All">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>
    </div>
  )
}

export default FeedbackFilters
