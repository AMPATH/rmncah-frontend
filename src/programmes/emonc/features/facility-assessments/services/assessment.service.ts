import { assessmentApi } from '../data/assessment-api.client'
import type {
  Assessment,
  AssessmentAnalysis,
  AssessmentFinding,
  AssessmentTemplate,
  AssessmentTemplateSectionRecord,
  SectionScore,
} from '../types'

const ASSESSMENTS_COLLECTION = 'assessments'

function createEmptySectionScore(unanswered: number): SectionScore {
  return {
    pointsObtained: 0,
    maximumPoints: 0,
    percentage: null,
    answered: 0,
    unanswered,
  }
}

function createInitialSections(
  template: AssessmentTemplate,
): AssessmentTemplateSectionRecord[] {
  return template.questionnaire.sections.map((section) => ({
    sectionId: section.id,
    answers: {},
    notes: '',
  }))
}

function createInitialScoreSummary(
  template: AssessmentTemplate,
): Record<string, SectionScore> {
  return Object.fromEntries(
    template.questionnaire.sections.map((section) => [
      section.id,
      createEmptySectionScore(
        section.items.filter(
          (item) => item.response.type !== 'unresolved',
        ).length,
      ),
    ]),
  )
}

function createInitialAnalysis(): AssessmentAnalysis {
  return {
    strengths: '',
    gaps: '',
    recommendations: '',
    overallNotes: '',
  }
}

function assertDraft(assessment: Assessment): void {
  if (assessment.status !== 'draft') {
    throw new Error(
      'Completed assessments cannot be modified.',
    )
  }
}

export const assessmentService = {
  async getAll(): Promise<Assessment[]> {
    const assessments = await assessmentApi.get<Assessment>(
      ASSESSMENTS_COLLECTION,
    )

    return assessments.sort(
      (a, b) =>
        new Date(b.assessmentDate).getTime() -
        new Date(a.assessmentDate).getTime(),
    )
  },

  async getById(id: string): Promise<Assessment> {
    return assessmentApi.getById<Assessment>(
      ASSESSMENTS_COLLECTION,
      id,
    )
  },

  async getByFacility(facilityId: string): Promise<Assessment[]> {
    const assessments = await this.getAll()

    return assessments.filter(
      (assessment) => assessment.facilityId === facilityId,
    )
  },

  async createDraft(
    facilityId: string,
    assessmentDate: string,
    template: AssessmentTemplate,
  ): Promise<Assessment> {
    if (!facilityId.trim()) {
      throw new Error('Select a facility before starting an assessment.')
    }

    if (!assessmentDate.trim()) {
      throw new Error('An assessment date is required.')
    }

    const now = new Date().toISOString()

    const assessment: Assessment = {
      id: crypto.randomUUID(),
      facilityId,
      mentorId: null,
      templateId: template.id,
      templateVersion: template.version,
      assessmentDate,
      status: 'draft',
      sections: createInitialSections(template),
      analysis: createInitialAnalysis(),
      findings: [],
      scoreSummary: createInitialScoreSummary(template),
      overallSummary: null,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    }

    return assessmentApi.create<Assessment>(
      ASSESSMENTS_COLLECTION,
      assessment,
    )
  },

  async updateDraft(
    id: string,
    changes: Partial<
      Pick<
        Assessment,
        'assessmentDate' | 'sections' | 'analysis' | 'findings'
      >
    >,
  ): Promise<Assessment> {
    const current = await this.getById(id)
    assertDraft(current)

    return assessmentApi.update<Assessment>(
      ASSESSMENTS_COLLECTION,
      id,
      {
        ...changes,
        updatedAt: new Date().toISOString(),
      },
    )
  },

  async completeDraft(id: string): Promise<Assessment> {
    const current = await this.getById(id)
    assertDraft(current)

    const now = new Date().toISOString()

    return assessmentApi.update<Assessment>(
      ASSESSMENTS_COLLECTION,
      id,
      {
        status: 'completed',
        completedAt: now,
        updatedAt: now,
      },
    )
  },

  async updateFinding(
    assessmentId: string,
    findings: AssessmentFinding[],
  ): Promise<Assessment> {
    return this.updateDraft(assessmentId, { findings })
  },
}
