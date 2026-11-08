import {
  Button,
  ProgressBar,
  Tag,
} from '@carbon/react'

import { View } from '@carbon/icons-react'

import type { MentorMentee } from '../../types/mentor.types'

interface MenteeTableProps {
  mentees: MentorMentee[]
  onViewMentee: (mentee: MentorMentee) => void
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function getStatusTag(status: MentorMentee['competencyStatus']) {
  switch (status) {
    case 'Competent':
      return <Tag type="green">{status}</Tag>

    case 'In Progress':
      return <Tag type="blue">{status}</Tag>

    case 'Needs Support':
      return <Tag type="red">{status}</Tag>

    default:
      return <Tag type="gray">{status}</Tag>
  }
}

function MenteeTable({
  mentees,
  onViewMentee,
}: MenteeTableProps) {
  if (mentees.length === 0) {
    return (
      <div className="mentee-table__empty">
        <h3>No mentees found</h3>
        <p>Try changing your search or filter criteria.</p>
      </div>
    )
  }

  return (
    <div className="mentee-table-wrapper">
      <table className="mentee-table">
        <thead>
          <tr>
            <th>Mentee</th>
            <th>Facility</th>
            <th>Cohort</th>
            <th>Learning progress</th>
            <th>Competency status</th>
            <th>Last activity</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {mentees.map((mentee) => (
            <tr key={mentee.id}>
              <td>
                <div className="mentee-table__person">
                  <strong>{mentee.name}</strong>
                  <span>{mentee.role}</span>
                </div>
              </td>

              <td>{mentee.facility}</td>

              <td>{mentee.cohort}</td>

              <td>
                <div className="mentee-table__progress">
                  <span>
                    {mentee.modulesCompleted}/{mentee.modulesAssigned} modules
                  </span>

                  <ProgressBar
                    label={`${mentee.name} learning progress`}
                    value={mentee.progress}
                    max={100}
                    size="small"
                    hideLabel
                  />
                </div>
              </td>

              <td>{getStatusTag(mentee.competencyStatus)}</td>

              <td>{formatDate(mentee.lastActivity)}</td>

              <td>
                <Button
                  kind="ghost"
                  size="sm"
                  renderIcon={View}
                  onClick={() => onViewMentee(mentee)}
                >
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default MenteeTable