
import type {
  TrainingModule,
  TrainingSection,
  LearningMaterial,
} from '../models'

import { emoncApi } from '../api/emonc-api.client'

const COLLECTIONS = {
  modules: 'emoncTrainingModules',
  sections: 'emoncTrainingSections',
  materials: 'emoncLearningMaterials',
} as const

export interface CurriculumData {
  modules: TrainingModule[]
  sections: TrainingSection[]
  materials: LearningMaterial[]
}

let initializationPromise: Promise<CurriculumData> | null = null

const sortModulesBySequence = (
  modules: TrainingModule[],
): TrainingModule[] => {
  return [...modules].sort((a, b) => {
    if (a.sequence === undefined && b.sequence === undefined) {
      return 0
    }

    if (a.sequence === undefined) {
      return 1
    }

    if (b.sequence === undefined) {
      return -1
    }

    return a.sequence - b.sequence
  })
}

export const curriculumService = {
  initialize(): Promise<CurriculumData> {
    if (!initializationPromise) {
      initializationPromise = this.initializeData().catch(
        (error: unknown) => {
          initializationPromise = null
          throw error
        },
      )
    }

    return initializationPromise
  },

  async initializeData(): Promise<CurriculumData> {
    return this.getAll()
  },

  async getAll(): Promise<CurriculumData> {
    const [modules, sections, materials] = await Promise.all([
      emoncApi.get<TrainingModule>(COLLECTIONS.modules),
      emoncApi.get<TrainingSection>(COLLECTIONS.sections),
      emoncApi.get<LearningMaterial>(COLLECTIONS.materials),
    ])

    return {
      modules: sortModulesBySequence(modules),
      sections,
      materials,
    }
  },

  createModule(record: TrainingModule): Promise<TrainingModule> {
    return emoncApi.create(COLLECTIONS.modules, record)
  },

  updateModule(
    id: string,
    changes: Partial<TrainingModule>,
  ): Promise<TrainingModule> {
    return emoncApi.update(COLLECTIONS.modules, id, changes)
  },

  deleteModule(id: string): Promise<void> {
    return emoncApi.delete(COLLECTIONS.modules, id)
  },

  createSection(record: TrainingSection): Promise<TrainingSection> {
    return emoncApi.create(COLLECTIONS.sections, record)
  },

  updateSection(
    id: string,
    changes: Partial<TrainingSection>,
  ): Promise<TrainingSection> {
    return emoncApi.update(COLLECTIONS.sections, id, changes)
  },

  deleteSection(id: string): Promise<void> {
    return emoncApi.delete(COLLECTIONS.sections, id)
  },

  createMaterial(record: LearningMaterial): Promise<LearningMaterial> {
    return emoncApi.create(COLLECTIONS.materials, record)
  },

  updateMaterial(
    id: string,
    changes: Partial<LearningMaterial>,
  ): Promise<LearningMaterial> {
    return emoncApi.update(COLLECTIONS.materials, id, changes)
  },

  deleteMaterial(id: string): Promise<void> {
    return emoncApi.delete(COLLECTIONS.materials, id)
  },
}
