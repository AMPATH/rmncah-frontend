import { Button } from '@carbon/react'

import ProgramStatistics from '../components/dashboard/ProgramStatistics'
import ModuleStatusOverview from '../components/dashboard/ModuleStatusOverview'
import RecentModules from '../components/dashboard/RecentModules'
import RecentActivity from '../components/dashboard/RecentActivity'
import ContentAttention from '../components/dashboard/ContentAttention'

import {
  programDashboardStatistics,
  programModules,
  programActivities,
  contentAttentionItems,
} from '../data/programLeadDashboardData'

import {
  programLeadMentorService,
} from '../services/program-lead-mentor.service'

import {
  programLeadMenteeService,
} from '../services/program-lead-mentee.service'

import {
  programLeadCohortService,
} from '../services/program-lead-cohort.service'

import {
  facilityRepository,
  feedbackRepository,
} from '../../../data/repositories'

import '../styles/program-lead-dashboard.scss'

interface OverviewPageProps {
  title: string
  onNavigate?: (path: string) => void
}

function OverviewPage({ title, onNavigate }: OverviewPageProps) {
  function handleNavigate(path: string) {
    onNavigate?.(path)
  }

  const mentors = programLeadMentorService.getAll()
  const mentees = programLeadMenteeService.getAll()
  const cohorts = programLeadCohortService.getAll()

  const mentorSummary = programLeadMentorService.getSummary(mentors)
  const menteeSummary = programLeadMenteeService.getSummary(mentees)
  const cohortSummary = programLeadCohortService.getSummary(cohorts)

  const facilityCount = facilityRepository.getAll().length

  const followUpsRequired = mentees.reduce(
    (total, mentee) => total + mentee.followUpsRequired,
    0,
  )

  const unassignedCohorts = cohorts.filter(
    (cohort) => !cohort.mentorId,
  ).length

  const submissionsAwaitingReview = cohorts.reduce(
    (total, cohort) =>
      total +
      cohort.submissions.filter(
        (submission) =>
          submission.status === 'Submitted' ||
          submission.status === 'Under Review',
      ).length,
    0,
  )

  const openFeedback = feedbackRepository.getAll().filter(
    (feedback) =>
      feedback.status === 'Pending' ||
      feedback.status === 'In Progress',
  ).length

  const programmeStatistics = [
    {
      label: 'Mentors',
      value: mentorSummary.total,
      description: `${mentorSummary.active} active · ${mentorSummary.inactive} inactive`,
      path: '/program-lead/mentors',
      action: 'View mentors',
    },
    {
      label: 'Mentees',
      value: menteeSummary.total,
      description: `${menteeSummary.competent} competent · ${menteeSummary.inProgress} in progress`,
      path: '/program-lead/mentees',
      action: 'View mentees',
    },
    {
      label: 'Cohorts',
      value: cohortSummary.total,
      description: `${cohortSummary.active} active · ${cohortSummary.completed} completed`,
      path: '/program-lead/cohorts',
      action: 'View cohorts',
    },
    {
      label: 'Facilities',
      value: facilityCount,
      description: 'Facilities in programme records',
      path: '/program-lead/cohorts',
      action: 'View programme cohorts',
    },
  ]

  const attentionItems = [
    {
      label: 'Mentees needing support',
      value: menteeSummary.needsSupport,
      description: 'Mentees currently marked as needing support',
    },
    {
      label: 'Assessment follow-ups',
      value: followUpsRequired,
      description: 'Assessment records flagged for follow-up',
    },
    {
      label: 'Cohorts without a confirmed mentor',
      value: unassignedCohorts,
      description: 'Cohorts with no linked mentor assignment',
    },
    {
      label: 'Submissions awaiting review',
      value: submissionsAwaitingReview,
      description: 'Submitted or under-review cohort records',
    },
    {
      label: 'Open feedback and challenges',
      value: openFeedback,
      description: 'Feedback records pending or in progress',
    },
  ]

  return (
    <div className="program-dashboard">
      <header className="program-dashboard__header">
        <div>
          <span className="program-dashboard__eyebrow">
            PROGRAMME MANAGEMENT
          </span>

          <h1>{title}</h1>

          <p>
            Oversee mentors, mentees, cohorts and facilities while
            managing EmONC training content and curriculum completeness.
          </p>
        </div>
      </header>

      <section className="programme-overview">
        <div className="programme-overview__heading">
          <div>
            <h2>Programme overview</h2>
            <p>Current records across the mentorship programme</p>
          </div>
        </div>

        <div className="programme-overview__statistics">
          {programmeStatistics.map((item) => (
            <article
              className="programme-overview__card"
              key={item.label}
            >
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <p>{item.description}</p>

              <Button
                kind="ghost"
                size="sm"
                onClick={() => handleNavigate(item.path)}
              >
                {item.action}
              </Button>
            </article>
          ))}
        </div>

        <section className="programme-overview__attention">
          <div className="programme-overview__heading">
            <div>
              <h2>Programme attention</h2>
              <p>Items that may require programme-level follow-up</p>
            </div>
          </div>

          <div className="programme-overview__attention-list">
            {attentionItems.map((item) => (
              <article
                className="programme-overview__attention-item"
                key={item.label}
              >
                <strong>{item.value}</strong>
                <div>
                  <h3>{item.label}</h3>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="programme-curriculum">
        <div className="programme-curriculum__heading">
          <div>
            <h2>Curriculum management</h2>
            <p>Training modules, sections and learning materials</p>
          </div>
        </div>

        <ProgramStatistics
          statistics={programDashboardStatistics}
          onNavigate={handleNavigate}
        />

        <div className="program-dashboard__main-grid">
          <ModuleStatusOverview
            statistics={programDashboardStatistics}
          />

          <ContentAttention
            items={contentAttentionItems}
            onNavigate={handleNavigate}
          />
        </div>

        <div className="program-dashboard__content-grid">
          <RecentModules
            modules={programModules}
            onViewAll={() =>
              handleNavigate('/program-lead/training-modules')
            }
          />

          <RecentActivity activities={programActivities} />
        </div>
      </section>

      <p className="program-dashboard__demo-notice">
        Demonstration and locally stored programme records are displayed.
        Live programme information will appear when backend services
        are integrated.
      </p>
    </div>
  )
}

export default OverviewPage
