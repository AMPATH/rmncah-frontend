
import {
  Add,
  ArrowRight,
  Calendar,
  ChartLine,
  CheckmarkFilled,
  ChevronRight,
  Time,
  Document,
  Download,
  Hospital,
  Location,
  Notification,
  UserMultiple,
  WarningAlt,
} from '@carbon/icons-react'

import {
  Button,
  Tag,
  Tile,
} from '@carbon/react'

interface OverviewPageProps {
  title: string
}

const statistics = [
  {
    label: 'Total mentors',
    value: '48',
    detail: 'Across all assigned counties',
    icon: UserMultiple,
    trend: '+8 this quarter',
    type: 'success',
  },
  {
    label: 'Total mentees',
    value: '126',
    detail: 'Currently enrolled',
    icon: UserMultiple,
    trend: '+14 this month',
    type: 'success',
  },
  {
    label: 'Facilities',
    value: '32',
    detail: 'Participating health facilities',
    icon: Hospital,
    trend: '4 counties',
    type: 'info',
  },
  {
    label: 'Active cohorts',
    value: '12',
    detail: 'Currently running cohorts',
    icon: ChartLine,
    trend: '3 starting soon',
    type: 'info',
  },
]

const activities = [
  {
    title: 'Site assessment completed',
    description: 'A facility assessment was submitted for review.',
    user: 'County Mentor',
    date: 'Today, 10:42 AM',
    status: 'Completed',
  },
  {
    title: 'New mentee enrolled',
    description: 'A new mentee was added to the mentorship programme.',
    user: 'Programme Coordinator',
    date: 'Today, 09:15 AM',
    status: 'Completed',
  },
  {
    title: 'Mentor assigned to facility',
    description: 'A mentor assignment was updated.',
    user: 'County Mentor',
    date: 'Yesterday, 03:30 PM',
    status: 'Completed',
  },
  {
    title: 'Feedback submitted',
    description: 'A mentorship challenge requires attention.',
    user: 'Facility Mentor',
    date: 'Yesterday, 11:20 AM',
    status: 'Pending',
  },
  {
    title: 'Cohort progress updated',
    description: 'Progress information was updated for an active cohort.',
    user: 'Programme Coordinator',
    date: 'Nov 4, 2026',
    status: 'Completed',
  },
  {
    title: 'Certification review requested',
    description: 'A mentee has submitted certification evidence.',
    user: 'Facility Mentor',
    date: 'Nov 3, 2026',
    status: 'Under review',
  },
]

const upcomingActivities = [
  {
    title: 'Facility mentorship visit',
    facility: 'Moi Teaching and Referral Hospital',
    date: 'Nov 9, 2026',
    type: 'Site visit',
  },
  {
    title: 'County mentor review meeting',
    facility: 'County Health Office',
    date: 'Nov 11, 2026',
    type: 'Meeting',
  },
  {
    title: 'Cohort progress assessment',
    facility: 'Uasin Gishu County',
    date: 'Nov 14, 2026',
    type: 'Assessment',
  },
  {
    title: 'Mentorship programme review',
    facility: 'Regional Coordination Office',
    date: 'Nov 18, 2026',
    type: 'Review',
  },
]

const programmeUpdates = [
  {
    title: 'Monthly mentorship reporting',
    description: 'Remember to complete and submit the monthly mentorship reports.',
    date: 'Nov 6, 2026',
    priority: 'Important',
  },
  {
    title: 'Upcoming cohort assessment',
    description: 'The next cohort progress assessment is approaching.',
    date: 'Nov 5, 2026',
    priority: 'Information',
  },
  {
    title: 'Facility data verification',
    description: 'Review facility records and confirm the assigned mentors.',
    date: 'Nov 3, 2026',
    priority: 'Important',
  },
]

const facilities = [
  {
    name: 'Moi Teaching and Referral Hospital',
    location: 'Eldoret',
    mentors: 6,
    mentees: 18,
    status: 'Active',
  },
  {
    name: 'Iten County Referral Hospital',
    location: 'Iten',
    mentors: 4,
    mentees: 12,
    status: 'Active',
  },
  {
    name: 'Turbo Sub-County Hospital',
    location: 'Turbo',
    mentors: 3,
    mentees: 9,
    status: 'Active',
  },
  {
    name: 'Burnt Forest Sub-County Hospital',
    location: 'Burnt Forest',
    mentors: 2,
    mentees: 7,
    status: 'Review',
  },
  {
    name: 'Kapsabet County Referral Hospital',
    location: 'Kapsabet',
    mentors: 5,
    mentees: 14,
    status: 'Active',
  },
]

export default function OverviewPage({ title }: OverviewPageProps) {
  return (
    <div className="overview">
      <div className="overview__heading">
        <div>
          <p className="overview__eyebrow">COUNTY MENTOR / RH</p>
          <h1>{title}</h1>
          <p className="overview__description">
            Monitor mentorship activities, facilities and programme progress.
          </p>
        </div>

        <Button renderIcon={Add} size="md">
          New activity
        </Button>
      </div>

      <div className="overview__welcome">
        <div>
          <span>PROGRAMME DASHBOARD</span>
          <h2>Welcome to your workspace</h2>
          <p>
            Here is an overview of mentorship activities and programme
            performance across your assigned facilities.
          </p>
        </div>
        <div className="overview__welcome-icon">
          <ChartLine size={40} />
        </div>
      </div>

      <div className="overview__section-heading">
        <div>
          <h2>Programme overview</h2>
          <p>Summary of mentorship programme participation.</p>
        </div>
        <Tag type="blue">November 2026</Tag>
      </div>

      <div className="overview__stats">
        {statistics.map((stat) => {
          const Icon = stat.icon

          return (
            <Tile className="stat-card" key={stat.label}>
              <div className="stat-card__top">
                <span>{stat.label}</span>
                <Icon size={22} />
              </div>
              <strong>{stat.value}</strong>
              <small>{stat.detail}</small>
              <Tag type={stat.type as 'green' | 'blue'}>
                {stat.trend}
              </Tag>
            </Tile>
          )
        })}
      </div>

      <div className="overview__section-heading">
        <div>
          <h2>Mentorship performance</h2>
          <p>Current programme progress and participation indicators.</p>
        </div>
      </div>

      <div className="overview__performance">
        <Tile className="performance-card">
          <div className="performance-card__heading">
            <h3>Mentorship completion</h3>
            <Tag type="green">On track</Tag>
          </div>
          <strong>76%</strong>
          <div className="performance-card__track">
            <div style={{ width: '76%' }} />
          </div>
          <p>96 of 126 mentees have completed their current milestones.</p>
        </Tile>

        <Tile className="performance-card">
          <div className="performance-card__heading">
            <h3>Facility participation</h3>
            <Tag type="blue">Active</Tag>
          </div>
          <strong>84%</strong>
          <div className="performance-card__track">
            <div style={{ width: '84%' }} />
          </div>
          <p>27 of 32 facilities have recorded recent mentorship activity.</p>
        </Tile>

        <Tile className="performance-card">
          <div className="performance-card__heading">
            <h3>Assessment completion</h3>
            <Tag type="warm-gray">In progress</Tag>
          </div>
          <strong>62%</strong>
          <div className="performance-card__track">
            <div style={{ width: '62%' }} />
          </div>
          <p>Assessment records submitted for the current reporting period.</p>
        </Tile>
      </div>

      <div className="overview__content">
        <section className="overview-panel">
          <div className="overview-panel__heading">
            <div>
              <h2>Recent mentorship activity</h2>
              <p>Latest actions recorded across the programme.</p>
            </div>
            <Button kind="ghost" size="sm" renderIcon={ArrowRight}>
              View all
            </Button>
          </div>

          <div className="activity-list">
            {activities.map((activity, index) => (
              <div className="activity-item" key={`${activity.title}-${index}`}>
                <div className="activity-item__icon">
                  {index === 3 ? (
                    <WarningAlt size={20} />
                  ) : (
                    <CheckmarkFilled size={20} />
                  )}
                </div>

                <div className="activity-item__details">
                  <strong>{activity.title}</strong>
                  <p>{activity.description}</p>
                  <small>
                    {activity.user} · {activity.date}
                  </small>
                </div>

                <Tag
                  type={
                    activity.status === 'Completed'
                      ? 'green'
                      : activity.status === 'Pending'
                        ? 'warm-gray'
                        : 'blue'
                  }
                >
                  {activity.status}
                </Tag>
              </div>
            ))}
          </div>
        </section>

        <section className="overview-panel">
          <div className="overview-panel__heading">
            <div>
              <h2>Programme updates</h2>
              <p>Important notices and reminders.</p>
            </div>
            <Notification size={20} />
          </div>

          <div className="updates-list">
            {programmeUpdates.map((update) => (
              <div className="update-item" key={update.title}>
                <div className="update-item__top">
                  <strong>{update.title}</strong>
                  <Tag type={update.priority === 'Important' ? 'red' : 'blue'}>
                    {update.priority}
                  </Tag>
                </div>
                <p>{update.description}</p>
                <small>{update.date}</small>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="overview__section-heading">
        <div>
          <h2>Upcoming activities</h2>
          <p>Scheduled mentorship activities and programme events.</p>
        </div>
        <Button kind="tertiary" size="sm" renderIcon={Calendar}>
          View calendar
        </Button>
      </div>

      <section className="overview-panel">
        <div className="upcoming-list">
          {upcomingActivities.map((activity) => (
            <div className="upcoming-item" key={activity.title}>
              <div className="upcoming-item__date">
                <Calendar size={20} />
              </div>
              <div className="upcoming-item__details">
                <strong>{activity.title}</strong>
                <span>
                  <Location size={14} />
                  {activity.facility}
                </span>
              </div>
              <Tag type="blue">{activity.type}</Tag>
              <div className="upcoming-item__time">
                <Time size={16} />
                {activity.date}
              </div>
              <ChevronRight size={18} />
            </div>
          ))}
        </div>
      </section>

      <div className="overview__section-heading">
        <div>
          <h2>Facility participation</h2>
          <p>Snapshot of facilities participating in mentorship activities.</p>
        </div>
        <Button kind="ghost" size="sm" renderIcon={ArrowRight}>
          All facilities
        </Button>
      </div>

      <section className="overview-panel">
        <div className="facility-table-wrapper">
          <table className="facility-table">
            <thead>
              <tr>
                <th>Facility name</th>
                <th>Location</th>
                <th>Mentors</th>
                <th>Mentees</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {facilities.map((facility) => (
                <tr key={facility.name}>
                  <td>{facility.name}</td>
                  <td>{facility.location}</td>
                  <td>{facility.mentors}</td>
                  <td>{facility.mentees}</td>
                  <td>
                    <Tag type={facility.status === 'Active' ? 'green' : 'warm-gray'}>
                      {facility.status}
                    </Tag>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="overview__section-heading">
        <div>
          <h2>Quick actions</h2>
          <p>Shortcuts to common County Mentor tasks.</p>
        </div>
      </div>

      <div className="overview__quick-actions">
        <Tile className="quick-action-card">
          <UserMultiple size={24} />
          <h3>Manage mentors</h3>
          <p>Review mentor records and assignments.</p>
          <Button kind="ghost" size="sm" renderIcon={ArrowRight}>
            Open mentors
          </Button>
        </Tile>

        <Tile className="quick-action-card">
          <Hospital size={24} />
          <h3>Review facilities</h3>
          <p>View participating health facilities.</p>
          <Button kind="ghost" size="sm" renderIcon={ArrowRight}>
            Open facilities
          </Button>
        </Tile>

        <Tile className="quick-action-card">
          <Document size={24} />
          <h3>Site assessments</h3>
          <p>Review assessment submissions.</p>
          <Button kind="ghost" size="sm" renderIcon={ArrowRight}>
            Open assessments
          </Button>
        </Tile>

        <Tile className="quick-action-card">
          <Download size={24} />
          <h3>Programme reports</h3>
          <p>Review and prepare programme reports.</p>
          <Button kind="ghost" size="sm" renderIcon={ArrowRight}>
            Open reports
          </Button>
        </Tile>
      </div>

      <div className="overview__footer">
        <span>EmONC Mentorship System</span>
        <span>County Mentor / RH Workspace</span>
      </div>
    </div>
  )
}
