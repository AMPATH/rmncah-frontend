
import { useMemo, useState } from 'react'

import LearningPlanSummary from '../components/learning-plan/LearningPlanSummary'
import LearningPlanFilters from '../components/learning-plan/LearningPlanFilters'
import LearningPlanList from '../components/learning-plan/LearningPlanList'

import { mentorLearningPlanData } from '../data/mentorLearningPlanData'

import '../styles/mentor-learning-plan.scss'

interface LearningPlanPageProps {
  title: string
}

function LearningPlanPage({ title }: LearningPlanPageProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCohort, setSelectedCohort] = useState('All cohorts')
  const [selectedStatus, setSelectedStatus] = useState('All statuses')
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null)

  const cohortOptions = useMemo(
    () => [
      ...new Set(
        mentorLearningPlanData.map((plan) => plan.cohortName),
      ),
    ],
    [],
  )

  const filteredPlans = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return mentorLearningPlanData.filter((plan) => {
      const matchesSearch =
        normalizedSearch === '' ||
        plan.title.toLowerCase().includes(normalizedSearch) ||
        plan.cohortName.toLowerCase().includes(normalizedSearch) ||
        plan.facility.toLowerCase().includes(normalizedSearch)

      const matchesCohort =
        selectedCohort === 'All cohorts' ||
        plan.cohortName === selectedCohort

      const matchesStatus =
        selectedStatus === 'All statuses' ||
        plan.status === selectedStatus

      return matchesSearch && matchesCohort && matchesStatus
    })
  }, [searchTerm, selectedCohort, selectedStatus])

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedCohort('All cohorts')
    setSelectedStatus('All statuses')
  }

  const handleTogglePlan = (planId: string) => {
    setExpandedPlanId((currentId) =>
      currentId === planId ? null : planId,
    )
  }

  return (
    <main className="mentor-learning-plan">
      <header className="mentor-learning-plan__header">
        <div>
          <h1>{title}</h1>
          <p>
            Plan, monitor and manage learning activities across your cohorts.
          </p>
        </div>
      </header>

      <LearningPlanSummary plans={mentorLearningPlanData} />

      <LearningPlanFilters
        searchTerm={searchTerm}
        selectedCohort={selectedCohort}
        selectedStatus={selectedStatus}
        cohortOptions={cohortOptions}
        onSearchChange={setSearchTerm}
        onCohortChange={setSelectedCohort}
        onStatusChange={setSelectedStatus}
        onClear={handleClearFilters}
      />

      <LearningPlanList
        plans={filteredPlans}
        expandedPlanId={expandedPlanId}
        onTogglePlan={handleTogglePlan}
      />
    </main>
  )
}

export default LearningPlanPage
