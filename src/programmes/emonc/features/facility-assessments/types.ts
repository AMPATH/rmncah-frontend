export type QuestionType =
  | 'yesno'
  | 'yesno-pair'
  | 'number'
  | 'number-group'
  | 'text'
  | 'date'
  | 'time'
  | 'select'
  | 'multi-select'
  | 'reason-select'
  | 'unresolved'

export type YesNoAnswer = 'yes' | 'no'

export interface YesNoPairAnswer {
  available: YesNoAnswer | null
  enoughForMonth: YesNoAnswer | null
}

export type AssessmentAnswer =
  | string
  | string[]
  | number
  | boolean
  | YesNoPairAnswer
  | Record<string, string | number | string[] | null>
  | null

export interface AssessmentQuestion {
  id: string
  number?: string
  label: string
  type: QuestionType
  points?: Record<string, number>
  linksTo?: number[]
  scoringNote?: string
  options?: string[]
  answerFields?: {
    id: string
    label: string
  }[]
  helperText?: string
  prefillFrom?: string
}

export interface AssessmentSection {
  id: string
  title: string
  questions: AssessmentQuestion[]
}

export type AssessmentStatus = 'draft' | 'completed'

export interface SectionScore {
  pointsObtained: number
  maximumPoints: number
  percentage: number | null
  answered: number
  unanswered: number
}

/**
 * Original source content stored with the official assessment template.
 * Paragraph strings must be rendered without rewriting their wording.
 */
export interface AssessmentSourceCell {
  paragraphs: string[]
}

export interface AssessmentSourceRow {
  cells: AssessmentSourceCell[]
}

export interface AssessmentSourceBlock {
  type: string
  rows?: AssessmentSourceRow[]
  text?: string[]
  [key: string]: unknown
}

export interface AssessmentQuestionSource {
  block: number
  row?: number
  rows?: number[]
}

export interface AssessmentResponseField {
  id: string
  label: string
  type?: 'yesno' | 'reason-select'
}

export interface YesNoResponseDefinition {
  type: 'yesno'
  options: string[]
}

export interface YesNoPairResponseDefinition {
  type: 'yesno-pair'
  fields: AssessmentResponseField[]
}

export interface SignalFunctionResponseDefinition {
  type: 'signal-function'
  fields: AssessmentResponseField[]
}

export interface ConditionalSelectResponseDefinition {
  type: 'yesno-and-conditional-select'
}

export interface SimpleResponseDefinition {
  type:
    | 'profile-fields'
    | 'number'
    | 'document-checklist'
    | 'number-group'
    | 'unresolved'
}

export type AssessmentResponseDefinition =
  | YesNoResponseDefinition
  | YesNoPairResponseDefinition
  | SignalFunctionResponseDefinition
  | ConditionalSelectResponseDefinition
  | SimpleResponseDefinition

export interface AssessmentTemplateQuestion {
  id: string
  source: AssessmentQuestionSource
  response: AssessmentResponseDefinition
}

export interface AssessmentTemplateSection {
  id: string
  title: string
  sourceBlocks: number[]
  items: AssessmentTemplateQuestion[]
}

export interface AssessmentQuestionnaire {
  schemaVersion: string
  layout: string
  sourceOfTruth: string
  sections: AssessmentTemplateSection[]
}

export interface AssessmentTemplate {
  id: string
  title: string
  version: string
  status: string
  sourceFileName: string
  sourceFormat: string
  contentFormat: string
  sourceStructure: Record<string, unknown>
  blocks: AssessmentSourceBlock[]
  questionnaire: AssessmentQuestionnaire
}

export interface AssessmentTemplateSectionRecord {
  sectionId: string
  answers: Record<string, AssessmentAnswer>
  notes: string
}

export interface AssessmentFinding {
  id: string
  title: string
  description: string
  sourceQuestionId: string | null
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in-progress' | 'resolved' | 'deferred'
  assignedTo: string
  dueDate: string | null
  resolutionNotes: string
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
}

export interface AssessmentAnalysis {
  strengths: string
  gaps: string
  recommendations: string
  overallNotes: string
}

export interface Assessment {
  id: string
  facilityId: string
  mentorId: string | null
  templateId: string
  templateVersion: string
  assessmentDate: string
  status: AssessmentStatus
  sections: AssessmentTemplateSectionRecord[]
  analysis: AssessmentAnalysis
  findings: AssessmentFinding[]
  scoreSummary: Record<string, SectionScore>
  overallSummary: SectionScore | null
  createdAt: string
  updatedAt: string
  completedAt: string | null
}
