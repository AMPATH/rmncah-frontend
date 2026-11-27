import { useEffect, useState } from 'react'
import { Button } from '@carbon/react'

import { facilityRepository } from '../../../data/repositories'
import AssessmentSectionRenderer from '../components/AssessmentSectionRenderer'
import { getOfficialAssessmentTemplate } from '../data/assessment-template.service'
import { assessmentService } from '../services/assessment.service'

import type {
  Assessment,
  AssessmentAnswer,
  AssessmentTemplate,
  AssessmentTemplateQuestion,
  AssessmentTemplateSection,
} from '../types'

import '../styles/facility-assessments.scss'

interface FacilityAssessmentsPageProps {
  title: string
}

function formatDate(value: string): string {
  if (!value) return 'Not recorded'

  const date = new Date(`${value.slice(0, 10)}T00:00:00`)

  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function getQuestionRows(
  template: AssessmentTemplate,
  item: AssessmentTemplateQuestion,
) {
  const block = template.blocks[item.source.block]

  if (!block?.rows) return []

  const indexes = item.source.rows ?? (
    item.source.row === undefined ? [] : [item.source.row]
  )

  return indexes
    .map((index) => block.rows?.[index])
    .filter((row) => row !== undefined)
}

function isAnswerable(
  template: AssessmentTemplate,
  item: AssessmentTemplateQuestion,
): boolean {
  if (item.response.type === 'unresolved') return false

  const rows = getQuestionRows(template, item)

  if (item.response.type === 'yesno') {
    return (
      rows.length > 0 &&
      rows.every((row) => {
        const yesIndex = row.cells.findIndex((cell) =>
          /^\s*YES(?:\s|\[|$)/i.test(cell.paragraphs.join(' ').trim()),
        )
        const noIndex = row.cells.findIndex((cell) =>
          /^\s*NO(?:\s|\[|$)/i.test(cell.paragraphs.join(' ').trim()),
        )

        if (yesIndex === -1 || noIndex === -1) return false

        return row.cells.some((cell, index) => {
          if (index === yesIndex || index === noIndex) return false

          return cell.paragraphs.some(
            (paragraph) =>
              paragraph.trim().length > 0 &&
              !/^\d+\.?$/.test(paragraph.trim()),
          )
        })
      })
    )
  }

  if (
    [
      'yesno-pair',
      'signal-function',
      'yesno-and-conditional-select',
      'number-group',
      'document-checklist',
    ].includes(item.response.type) &&
    rows.length === 0
  ) {
    return false
  }

  return true
}

function hasValue(value: unknown): boolean {
  if (typeof value === 'number') return Number.isFinite(value)
  if (typeof value === 'boolean') return true
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return value !== null && value !== undefined
}

function isQuestionAnswered(
  item: AssessmentTemplateQuestion,
  answer: AssessmentAnswer | undefined,
): boolean {
  if (!hasValue(answer)) return false

  if (item.response.type === 'yesno') {
    return answer === 'yes' || answer === 'no'
  }

  if (item.response.type === 'yesno-pair') {
    if (!answer || typeof answer !== 'object' || Array.isArray(answer)) {
      return false
    }

    const pair = answer as Record<string, unknown>
    return (
      (pair.available === 'yes' || pair.available === 'no') &&
      (pair.enoughForMonth === 'yes' || pair.enoughForMonth === 'no')
    )
  }

  if (item.response.type === 'signal-function') {
    if (!answer || typeof answer !== 'object' || Array.isArray(answer)) {
      return false
    }

    const fields = answer as Record<string, unknown>
    const yesNoFields = item.response.fields.filter(
      (field) => field.type === 'yesno',
    )
    const reasonFields = item.response.fields.filter(
      (field) => field.type === 'reason-select',
    )

    return yesNoFields.every((field) => {
      const response = fields[field.id]

      if (response !== 'yes' && response !== 'no') return false

      if (response === 'no') {
        const reasonField = reasonFields.find((reason) =>
          reason.id.toLowerCase().includes(field.id.toLowerCase()),
        )

        if (reasonField && !hasValue(fields[reasonField.id])) return false
      }

      return true
    })
  }

  if (item.response.type === 'yesno-and-conditional-select') {
    if (!answer || typeof answer !== 'object' || Array.isArray(answer)) {
      return false
    }

    const fields = answer as Record<string, unknown>
    const yesNoValue = Object.values(fields).find(
      (value) => value === 'yes' || value === 'no',
    )

    if (yesNoValue !== 'yes' && yesNoValue !== 'no') return false

    if (yesNoValue === 'no') return true

    return (
      Array.isArray(fields.serviceAreas) &&
      fields.serviceAreas.length > 0
    )
  }

  if (!answer || typeof answer !== 'object' || Array.isArray(answer)) {
    return hasValue(answer)
  }

  const values = Object.values(answer as Record<string, unknown>)
  return values.length > 0 && values.every(hasValue)
}

function getSectionProgress(
  template: AssessmentTemplate,
  section: AssessmentTemplateSection,
  answers: Record<string, AssessmentAnswer>,
) {
  const answerableItems = section.items.filter((item) =>
    isAnswerable(template, item),
  )

  const answered = answerableItems.filter((item) =>
    isQuestionAnswered(item, answers[item.id]),
  ).length

  return {
    answered,
    total: answerableItems.length,
    unanswered: answerableItems.length - answered,
  }
}

function getAssessmentProgress(
  template: AssessmentTemplate,
  assessment: Assessment,
) {
  return template.questionnaire.sections.reduce(
    (total, section) => {
      const record = assessment.sections.find(
        (entry) => entry.sectionId === section.id,
      )

      const progress = getSectionProgress(
        template,
        section,
        record?.answers ?? {},
      )

      return {
        answered: total.answered + progress.answered,
        total: total.total + progress.total,
      }
    },
    { answered: 0, total: 0 },
  )
}

export default function FacilityAssessmentsPage({
  title,
}: FacilityAssessmentsPageProps) {
  const allFacilities = facilityRepository.getAll()
  const facilities = allFacilities
    .filter((facility) => facility.status === 'Active')
    .sort((a, b) => a.name.localeCompare(b.name))

  const [template, setTemplate] = useState<AssessmentTemplate | null>(null)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null)
  const [selectedSectionIndex, setSelectedSectionIndex] = useState(0)
  const [facilityId, setFacilityId] = useState('')
  const [assessmentDate, setAssessmentDate] = useState(
    new Date().toISOString().slice(0, 10),
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function refreshAssessments() {
    const records = await assessmentService.getAll()
    setAssessments(records)
  }

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError('')

      try {
        const [officialTemplate, records] = await Promise.all([
          getOfficialAssessmentTemplate(),
          assessmentService.getAll(),
        ])

        if (!active) return

        setTemplate(officialTemplate)
        setAssessments(records)
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load Facility Assessment data.',
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [])

  async function startAssessment() {
    if (!template || !facilityId || !assessmentDate) {
      setError('Select a facility and assessment date.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const created = await assessmentService.createDraft(
        facilityId,
        assessmentDate,
        template,
      )

      await refreshAssessments()
      setSelectedAssessment(created)
      setSelectedSectionIndex(0)
    } catch (startError) {
      setError(
        startError instanceof Error
          ? startError.message
          : 'Unable to start the assessment.',
      )
    } finally {
      setSaving(false)
    }
  }

  function openAssessment(assessment: Assessment) {
    setSelectedAssessment(assessment)
    setSelectedSectionIndex(0)
    setError('')
  }

  function updateAnswer(
    questionId: string,
    answer: AssessmentAnswer,
  ) {
    if (!selectedAssessment || selectedAssessment.status !== 'draft') return

    const currentSection = template?.questionnaire.sections[
      selectedSectionIndex
    ]

    if (!currentSection) return

    setSelectedAssessment((current) => {
      if (!current) return current

      return {
        ...current,
        sections: current.sections.map((section) =>
          section.sectionId === currentSection.id
            ? {
                ...section,
                answers: {
                  ...section.answers,
                  [questionId]: answer,
                },
              }
            : section,
        ),
      }
    })
  }

  function updateSectionNotes(notes: string) {
    if (!selectedAssessment || selectedAssessment.status !== 'draft') return

    const currentSection = template?.questionnaire.sections[
      selectedSectionIndex
    ]

    if (!currentSection) return

    setSelectedAssessment((current) => {
      if (!current) return current

      return {
        ...current,
        sections: current.sections.map((section) =>
          section.sectionId === currentSection.id
            ? { ...section, notes }
            : section,
        ),
      }
    })
  }

  async function saveDraft() {
    if (!selectedAssessment || selectedAssessment.status !== 'draft') return

    setSaving(true)
    setError('')

    try {
      const updated = await assessmentService.updateDraft(
        selectedAssessment.id,
        {
          assessmentDate: selectedAssessment.assessmentDate,
          sections: selectedAssessment.sections,
          analysis: selectedAssessment.analysis,
          findings: selectedAssessment.findings,
        },
      )

      setSelectedAssessment(updated)
      await refreshAssessments()
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Unable to save the assessment.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function completeAssessment() {
    if (!selectedAssessment || !template) return

    const unanswered = template.questionnaire.sections.flatMap((section) => {
      const record = selectedAssessment.sections.find(
        (entry) => entry.sectionId === section.id,
      )

      return section.items
        .filter((item) => isAnswerable(template, item))
        .filter(
          (item) => !isQuestionAnswered(item, record?.answers[item.id]),
        )
        .map(() => ({
          sectionId: section.id,
          sectionTitle: section.title,
        }))
    })

    if (unanswered.length > 0) {
      const firstSectionIndex = template.questionnaire.sections.findIndex(
        (section) => section.id === unanswered[0].sectionId,
      )

      setSelectedSectionIndex(Math.max(firstSectionIndex, 0))
      setError(
        `${unanswered.length} answerable questionnaire item(s) remain unanswered. Complete them before finalizing the assessment.`,
      )
      return
    }

    setSaving(true)
    setError('')

    try {
      await assessmentService.updateDraft(selectedAssessment.id, {
        assessmentDate: selectedAssessment.assessmentDate,
        sections: selectedAssessment.sections,
        analysis: selectedAssessment.analysis,
        findings: selectedAssessment.findings,
      })

      const completed = await assessmentService.completeDraft(
        selectedAssessment.id,
      )

      setSelectedAssessment(completed)
      await refreshAssessments()
    } catch (completeError) {
      setError(
        completeError instanceof Error
          ? completeError.message
          : 'Unable to complete the assessment.',
      )
    } finally {
      setSaving(false)
    }
  }

  const currentSection = template?.questionnaire.sections[
    selectedSectionIndex
  ]

  const currentSectionRecord = currentSection && selectedAssessment
    ? selectedAssessment.sections.find(
        (section) => section.sectionId === currentSection.id,
      )
    : undefined

  const selectedFacility = selectedAssessment
    ? allFacilities.find(
        (facility) => facility.id === selectedAssessment.facilityId,
      )
    : undefined

  const overallProgress = template && selectedAssessment
    ? getAssessmentProgress(template, selectedAssessment)
    : { answered: 0, total: 0 }

  if (loading) {
    return (
      <div className="facility-assessments">
        <p>Loading Facility Assessment...</p>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="facility-assessments">
        <h1>{title}</h1>
        <p role="alert">{error || 'The official assessment template is unavailable.'}</p>
      </div>
    )
  }

  if (selectedAssessment && currentSection) {
    const sectionProgress = getSectionProgress(
      template,
      currentSection,
      currentSectionRecord?.answers ?? {},
    )

    const readOnly = selectedAssessment.status === 'completed'

    return (
      <main className="facility-assessments">
        <div className="facility-assessments__topbar">
          <Button
            kind="ghost"
            onClick={() => {
              setSelectedAssessment(null)
              setError('')
            }}
          >
            Back to assessments
          </Button>

          <span>
            {readOnly ? 'Completed assessment' : 'Draft assessment'}
          </span>
        </div>

        <header className="facility-assessments__header">
          <div>
            <p className="facility-assessments__eyebrow">
              MENTOR WORKSPACE
            </p>
            <h1>{selectedFacility?.name ?? 'Facility assessment'}</h1>
            <p>
              {selectedFacility?.county ?? 'County not recorded'}
              {' · '}
              {formatDate(selectedAssessment.assessmentDate)}
            </p>
          </div>

          <span className={`facility-assessments__status facility-assessments__status--${selectedAssessment.status}`}>
            {selectedAssessment.status === 'draft' ? 'Draft' : 'Completed'}
          </span>
        </header>

        <section className="facility-assessments__progress">
          <div>
            <strong>
              {overallProgress.answered} of {overallProgress.total}
            </strong>
            <span>answerable items completed</span>
          </div>
          <progress
            value={overallProgress.answered}
            max={Math.max(overallProgress.total, 1)}
          />
        </section>

        <nav className="facility-assessments__section-nav" aria-label="Assessment sections">
          {template.questionnaire.sections.map((section, index) => {
            const progress = getSectionProgress(
              template,
              section,
              selectedAssessment.sections.find(
                (record) => record.sectionId === section.id,
              )?.answers ?? {},
            )

            return (
              <button
                type="button"
                key={section.id}
                className={index === selectedSectionIndex ? 'is-active' : ''}
                onClick={() => setSelectedSectionIndex(index)}
              >
                <span>{index + 1}. {section.title}</span>
                <small>{progress.answered}/{progress.total}</small>
              </button>
            )
          })}
        </nav>

        <div className="facility-assessments__section-content">
          <div className="facility-assessments__section-summary">
            <div>
              <h2>{currentSection.title}</h2>
              <p>
                {sectionProgress.answered} answered · {sectionProgress.unanswered} remaining
              </p>
            </div>
            <span>Section {selectedSectionIndex + 1} of {template.questionnaire.sections.length}</span>
          </div>

          <AssessmentSectionRenderer
            template={template}
            section={currentSection}
            answers={currentSectionRecord?.answers ?? {}}
            onAnswerChange={updateAnswer}
          />

          <div className="facility-assessments__notes">
            <label htmlFor="assessment-section-notes">Section notes</label>
            <textarea
              id="assessment-section-notes"
              rows={3}
              value={currentSectionRecord?.notes ?? ''}
              disabled={readOnly}
              onChange={(event) => updateSectionNotes(event.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="facility-assessments__error" role="alert">
            {error}
          </p>
        )}

        <footer className="facility-assessments__footer">
          <Button
            kind="secondary"
            disabled={selectedSectionIndex === 0}
            onClick={() =>
              setSelectedSectionIndex((index) => Math.max(index - 1, 0))
            }
          >
            Previous section
          </Button>

          <div>
            {!readOnly && (
              <>
                <Button
                  kind="secondary"
                  disabled={saving}
                  onClick={() => void saveDraft()}
                >
                  {saving ? 'Saving...' : 'Save draft'}
                </Button>

                <Button
                  disabled={saving}
                  onClick={() => void completeAssessment()}
                >
                  Complete assessment
                </Button>
              </>
            )}

            {selectedSectionIndex < template.questionnaire.sections.length - 1 && (
              <Button
                kind="tertiary"
                onClick={() =>
                  setSelectedSectionIndex((index) =>
                    Math.min(index + 1, template.questionnaire.sections.length - 1),
                  )
                }
              >
                Next section
              </Button>
            )}
          </div>
        </footer>
      </main>
    )
  }

  return (
    <main className="facility-assessments">
      <header className="facility-assessments__header">
        <div>
          <p className="facility-assessments__eyebrow">MENTOR WORKSPACE</p>
          <h1>{title}</h1>
          <p>
            Conduct and review facility assessments using the official
            EMONC Mentorship Assessment Tool.
          </p>
        </div>
      </header>

      <section className="facility-assessments__start">
        <div>
          <h2>Start a facility assessment</h2>
          <p>Select a registered facility and record the assessment date.</p>
        </div>

        <div className="facility-assessments__start-fields">
          <label>
            Facility
            <select
              value={facilityId}
              onChange={(event) => setFacilityId(event.target.value)}
            >
              <option value="">Select a facility</option>
              {facilities.map((facility) => (
                <option value={facility.id} key={facility.id}>
                  {facility.name} — {facility.county}
                </option>
              ))}
            </select>
          </label>

          <label>
            Assessment date
            <input
              type="date"
              value={assessmentDate}
              onChange={(event) => setAssessmentDate(event.target.value)}
            />
          </label>

          <Button
            disabled={saving || !facilityId || !assessmentDate}
            onClick={() => void startAssessment()}
          >
            {saving ? 'Starting...' : 'Start assessment'}
          </Button>
        </div>
      </section>

      {error && (
        <p className="facility-assessments__error" role="alert">
          {error}
        </p>
      )}

      <section className="facility-assessments__history">
        <div className="facility-assessments__history-heading">
          <div>
            <h2>Assessment history</h2>
            <p>Each facility visit is retained as a separate assessment.</p>
          </div>
          <span>{assessments.length} records</span>
        </div>

        {assessments.length === 0 ? (
          <div className="facility-assessments__empty">
            No facility assessments have been started.
          </div>
        ) : (
          <div className="facility-assessments__table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Facility</th>
                  <th>County</th>
                  <th>Assessment date</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((assessment) => {
                  const facility = allFacilities.find(
                    (entry) => entry.id === assessment.facilityId,
                  )
                  const progress = getAssessmentProgress(template, assessment)

                  return (
                    <tr key={assessment.id}>
                      <td>{facility?.name ?? 'Facility no longer available'}</td>
                      <td>{facility?.county ?? '—'}</td>
                      <td>{formatDate(assessment.assessmentDate)}</td>
                      <td>
                        <span className={`facility-assessments__status facility-assessments__status--${assessment.status}`}>
                          {assessment.status === 'draft' ? 'Draft' : 'Completed'}
                        </span>
                      </td>
                      <td>{progress.answered}/{progress.total}</td>
                      <td>
                        <Button
                          kind="ghost"
                          size="sm"
                          onClick={() => openAssessment(assessment)}
                        >
                          {assessment.status === 'draft' ? 'Continue' : 'View'}
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
