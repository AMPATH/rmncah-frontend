
import {
  UserMultiple,
  UserFollow,
  User,
  Group,
  Activity,
} from '@carbon/icons-react'

import type { MentorDirectoryRecord } from '../../services/mentor-management.service'

interface MentorSummaryProps {
  mentors: MentorDirectoryRecord[]
}

export default function MentorSummary({
  mentors,
}: MentorSummaryProps) {
  const totalMentors = mentors.length

  const activeMentors = mentors.filter(
    (mentor) => mentor.status === 'Active',
  ).length

  const inactiveMentors = mentors.filter(
    (mentor) => mentor.status === 'Inactive',
  ).length

  const totalCohorts = mentors.reduce(
    (total, mentor) => total + mentor.cohortsAssigned,
    0,
  )

  const totalMentees = mentors.reduce(
    (total, mentor) => total + mentor.menteesAssigned,
    0,
  )

  const summaryItems = [
    {
      label: 'Total mentors',
      value: totalMentors,
      description: 'Registered in the programme',
      icon: UserMultiple,
    },
    {
      label: 'Active mentors',
      value: activeMentors,
      description: 'Currently active',
      icon: UserFollow,
    },
    {
      label: 'Inactive mentors',
      value: inactiveMentors,
      description: 'Currently inactive',
      icon: User,
    },
    {
      label: 'Assigned cohorts',
      value: totalCohorts,
      description: 'Across all mentors',
      icon: Group,
    },
    {
      label: 'Assigned mentees',
      value: totalMentees,
      description: 'Across all mentors',
      icon: Activity,
    },
  ]

  return (
    <section className="county-mentor-summary">
      {summaryItems.map((item) => {
        const Icon = item.icon

        return (
          <article
            className="county-mentor-summary__card"
            key={item.label}
          >
            <div className="county-mentor-summary__icon">
              <Icon size={20} />
            </div>

            <div className="county-mentor-summary__content">
              <span>{item.label}</span>

              <strong>{item.value}</strong>

              <small>{item.description}</small>
            </div>
          </article>
        )
      })}
    </section>
  )
}
