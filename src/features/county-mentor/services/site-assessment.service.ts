import {
  facilityRepository,
  siteAssessmentFindingRepository,
  siteAssessmentRepository,
} from '../../../core/data/repositories'

import type {
  SiteAssessment,
  SiteAssessmentFinding,
} from '../../../core/data/models'

import type {
  SiteAssessmentFindingFormData,
  SiteAssessmentFormData,
  SiteAssessmentRecord,
  SiteAssessmentSummary,
} from '../types/site-assessment.types'

const createId = (): string => {
  return `SA-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const getTimestamp = (): string => new Date().toISOString()

class SiteAssessmentService {
  getAll(): SiteAssessmentRecord[] {
    const facilities = facilityRepository.getAll()
    const findings = siteAssessmentFindingRepository.getAll()

    return siteAssessmentRepository
      .getAll()
      .map((assessment) => {
        const facility =
          facilities.find((item) => item.id === assessment.facilityId) ?? null

        const assessmentFindings = findings.filter(
          (finding) => finding.siteAssessmentId === assessment.id,
        )

        return {
          ...assessment,
          facility,
          findings: assessmentFindings,
          openFindings: assessmentFindings.filter(
            (finding) =>
              finding.status === 'Open' ||
              finding.status === 'In Progress',
          ).length,
          resolvedFindings: assessmentFindings.filter(
            (finding) => finding.status === 'Resolved',
          ).length,
        }
      })
      .sort(
        (first, second) =>
          new Date(second.assessmentDate).getTime() -
          new Date(first.assessmentDate).getTime(),
      )
  }

  getById(id: string): SiteAssessmentRecord | null {
    return this.getAll().find((assessment) => assessment.id === id) ?? null
  }

  getSummary(): SiteAssessmentSummary {
    const assessments = this.getAll()

    return {
      totalAssessments: assessments.length,

      facilitiesAssessed: new Set(
        assessments
          .filter((assessment) => assessment.status === 'Completed')
          .map((assessment) => assessment.facilityId),
      ).size,

      pendingAssessments: assessments.filter(
        (assessment) =>
          assessment.status === 'Scheduled' ||
          assessment.status === 'In Progress',
      ).length,

      completedAssessments: assessments.filter(
        (assessment) => assessment.status === 'Completed',
      ).length,

      openFollowUps: assessments.reduce(
        (total, assessment) => total + assessment.openFindings,
        0,
      ),
    }
  }

  create(data: SiteAssessmentFormData): SiteAssessment {
    const timestamp = getTimestamp()

    const assessment: SiteAssessment = {
      id: createId(),
      facilityId: data.facilityId,
      assessmentDate: data.assessmentDate,
      assessorId: null,
      assessorName: data.assessorName.trim(),
      status: data.status,
      summary: data.summary.trim(),
      nextFollowUpDate: data.nextFollowUpDate || null,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    return siteAssessmentRepository.create(assessment)
  }

  update(
    id: string,
    changes: Partial<SiteAssessmentFormData>,
  ): SiteAssessment | null {
    const updateData: Partial<Omit<SiteAssessment, 'id'>> = {
      ...changes,
      updatedAt: getTimestamp(),
    }

    if (changes.nextFollowUpDate !== undefined) {
      updateData.nextFollowUpDate = changes.nextFollowUpDate || null
    }

    return siteAssessmentRepository.update(id, updateData)
  }

  updateStatus(
    id: string,
    status: SiteAssessment['status'],
  ): SiteAssessment | null {
    return siteAssessmentRepository.update(id, {
      status,
      updatedAt: getTimestamp(),
    })
  }

  delete(id: string): boolean {
    const assessment = siteAssessmentRepository.findById(id)

    if (!assessment) {
      return false
    }

    const relatedFindings = siteAssessmentFindingRepository
      .getAll()
      .filter((finding) => finding.siteAssessmentId !== id)

    siteAssessmentFindingRepository.replaceAll(relatedFindings)

    return siteAssessmentRepository.delete(id)
  }

  getFindings(assessmentId: string): SiteAssessmentFinding[] {
    return siteAssessmentFindingRepository
      .getAll()
      .filter((finding) => finding.siteAssessmentId === assessmentId)
  }

  createFinding(
    assessmentId: string,
    data: SiteAssessmentFindingFormData,
  ): SiteAssessmentFinding {
    if (!siteAssessmentRepository.findById(assessmentId)) {
      throw new Error('The selected site assessment could not be found.')
    }

    const timestamp = getTimestamp()

    const finding: SiteAssessmentFinding = {
      id: createId(),
      siteAssessmentId: assessmentId,
      title: data.title.trim(),
      description: data.description.trim(),
      assignedTo: data.assignedTo.trim(),
      dueDate: data.dueDate || null,
      status: data.status,
      resolutionNotes: data.resolutionNotes.trim(),
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    return siteAssessmentFindingRepository.create(finding)
  }

  updateFinding(
    id: string,
    changes: Partial<SiteAssessmentFindingFormData>,
  ): SiteAssessmentFinding | null {
    const updateData: Partial<Omit<SiteAssessmentFinding, 'id'>> = {
      ...changes,
      updatedAt: getTimestamp(),
    }

    if (changes.dueDate !== undefined) {
      updateData.dueDate = changes.dueDate || null
    }

    return siteAssessmentFindingRepository.update(id, updateData)
  }

  deleteFinding(id: string): boolean {
    return siteAssessmentFindingRepository.delete(id)
  }
}

export const siteAssessmentService = new SiteAssessmentService()