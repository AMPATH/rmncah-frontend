
import { useMemo, useState } from 'react'

import AssessmentSummary from '../components/assessments/AssessmentSummary'
import AssessmentFilters from '../components/assessments/AssessmentFilters'
import AssessmentTable from '../components/assessments/AssessmentTable'
import AssessmentDetails from '../components/assessments/AssessmentDetails'
import AssessmentForm from '../components/assessments/AssessmentForm'

import { mentorAssessmentsData } from '../data/mentorAssessmentsData'

import type {
  MentorAssessment,
  MentorAssessmentFormValues,
} from '../types/mentor.types'

import '../styles/mentor-assessments.scss'

interface AssessmentsPageProps {
  title: string
}

function AssessmentsPage({ title }: AssessmentsPageProps) {
  const [assessments, setAssessments] = useState<MentorAssessment[]>(
    mentorAssessmentsData,
  )

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCohort, setSelectedCohort] = useState('All cohorts')
  const [selectedType, setSelectedType] = useState('All types')
  const [selectedStatus, setSelectedStatus] = useState('All statuses')

  const [selectedAssessmentId, setSelectedAssessmentId] =
    useState<string | null>(null)

  const [isEditing, setIsEditing] = useState(false)

  const cohortOptions = useMemo(
    () => [
      ...new Set(assessments.map((item) => item.cohortName)),
    ],
    [assessments],
  )

  const filteredAssessments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return assessments.filter((assessment) => {
      const matchesSearch =
        query === '' ||
        assessment.menteeName.toLowerCase().includes(query) ||
        assessment.moduleTitle.toLowerCase().includes(query) ||
        assessment.facility.toLowerCase().includes(query)

      const matchesCohort =
        selectedCohort === 'All cohorts' ||
        assessment.cohortName === selectedCohort

      const matchesType =
        selectedType === 'All types' ||
        assessment.assessmentType === selectedType

      const matchesStatus =
        selectedStatus === 'All statuses' ||
        assessment.status === selectedStatus

      return (
        matchesSearch &&
        matchesCohort &&
        matchesType &&
        matchesStatus
      )
    })
  }, [
    assessments,
    searchTerm,
    selectedCohort,
    selectedType,
    selectedStatus,
  ])

  const selectedAssessment = assessments.find(
    (item) => item.id === selectedAssessmentId,
  )

  function handleClearFilters() {
    setSearchTerm('')
    setSelectedCohort('All cohorts')
    setSelectedType('All types')
    setSelectedStatus('All statuses')
  }

  function handleView(assessment: MentorAssessment) {
    setSelectedAssessmentId(assessment.id)
    setIsEditing(false)
  }

  function handleSave(values: MentorAssessmentFormValues) {
    if (!selectedAssessmentId) return

    setAssessments((current) =>
      current.map((assessment) =>
        assessment.id === selectedAssessmentId
          ? { ...assessment, ...values }
          : assessment,
      ),
    )

    setIsEditing(false)
  }

  function handleCloseDetails() {
    setSelectedAssessmentId(null)
    setIsEditing(false)
  }

  return (
    <main className="mentor-assessments">
      <header className="mentor-assessments__header">
        <div>
          <h1>{title}</h1>
          <p>
            Assess mentee knowledge and practical competencies across your
            assigned cohorts.
          </p>
        </div>
      </header>

      <AssessmentSummary assessments={assessments} />

      <section className="mentor-assessments__directory">
        <div className="mentor-assessments__section-heading">
          <div>
            <h2>Assessment directory</h2>
            <p>
              Review assessment records and monitor competency outcomes.
            </p>
          </div>

          <span>
            {filteredAssessments.length}{' '}
            {filteredAssessments.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        <AssessmentFilters
          searchTerm={searchTerm}
          selectedCohort={selectedCohort}
          selectedType={selectedType}
          selectedStatus={selectedStatus}
          cohortOptions={cohortOptions}
          onSearchChange={setSearchTerm}
          onCohortChange={setSelectedCohort}
          onTypeChange={setSelectedType}
          onStatusChange={setSelectedStatus}
          onClear={handleClearFilters}
        />

        <AssessmentTable
          assessments={filteredAssessments}
          onView={handleView}
        />
      </section>

      {selectedAssessment && (
        <div className="assessment-overlay">
          <div className="assessment-overlay__panel">
            {isEditing ? (
              <AssessmentForm
                key={selectedAssessment.id}
                assessment={selectedAssessment}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <AssessmentDetails
                assessment={selectedAssessment}
                onClose={handleCloseDetails}
                onEdit={() => setIsEditing(true)}
              />
            )}
          </div>
        </div>
      )}
    </main>
  )
}

export default AssessmentsPage
