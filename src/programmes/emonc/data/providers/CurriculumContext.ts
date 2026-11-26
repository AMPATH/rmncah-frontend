
import { createContext, useContext } from 'react'

import type {
  TrainingModule,
  TrainingSection,
  LearningMaterial,
} from '../models'

import type {
  CurriculumData,
} from '../services/curriculum.service'

export interface CurriculumContextValue extends CurriculumData {
  loading: boolean
  error: string | null

  refresh: () => Promise<void>

  createModule: (record: TrainingModule) => Promise<void>
  updateModule: (
    id: string,
    changes: Partial<TrainingModule>,
  ) => Promise<void>
  deleteModule: (id: string) => Promise<void>

  createSection: (record: TrainingSection) => Promise<void>
  updateSection: (
    id: string,
    changes: Partial<TrainingSection>,
  ) => Promise<void>
  deleteSection: (id: string) => Promise<void>

  reorderSections: (sections: TrainingSection[]) => Promise<void>

  createMaterial: (record: LearningMaterial) => Promise<void>
  updateMaterial: (
    id: string,
    changes: Partial<LearningMaterial>,
  ) => Promise<void>
  deleteMaterial: (id: string) => Promise<void>
}

export const CurriculumContext = createContext<
  CurriculumContextValue | undefined
>(undefined)

/**
 * Shared hook for accessing curriculum data and operations.
 *
 * Must be used inside a CurriculumProvider.
 */
export function useCurriculum(): CurriculumContextValue {
  const context = useContext(CurriculumContext)

  if (!context) {
    throw new Error(
      'useCurriculum must be used inside a CurriculumProvider.',
    )
  }

  return context
}
