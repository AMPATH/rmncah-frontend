
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
  available: YesNoAnswer
  enoughForMonth: YesNoAnswer
}

export type AssessmentAnswer =
  | string
  | string[]
  | number
  | boolean
  | YesNoPairAnswer
  | Record<string, number | null>
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

export interface Assessment {
  id: string
  facilityId: string
  assessorId: string
  assessmentDate: string
  status: AssessmentStatus
  templateVersion: string
  answers: Record<string, AssessmentAnswer>
  scoreSummary?: Record<string, SectionScore>
}
