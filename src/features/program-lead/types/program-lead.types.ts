export type ProgramModuleStatus =
  | 'Draft'
  | 'Published'
  | 'Incomplete content'

export interface ProgramDashboardStatistics {
  totalModules: number
  publishedModules: number
  draftModules: number
  incompleteModules: number
  totalSections: number
  totalMaterials: number
}

export interface ProgramModule {
  id: string
  title: string
  category: string
  sectionsCount: number
  materialsCount: number
  status: ProgramModuleStatus
  updatedAt: string
}

export interface ProgramActivity {
  id: string
  action: string
  description: string
  actor: string
  date: string
}

export interface ContentAttentionItem {
  id: string
  title: string
  description: string
  count: number
  actionLabel: string
  path: string
}

export interface ProgramModuleSection {
  id: string
  moduleId: string
  title: string
  description: string
  sequence: number
  updatedAt: string
}


export type LearningMaterialType = 'E-book' | 'Slides' | 'Video'

export interface ProgramLearningMaterial {
  id: string
  moduleId: string
  sectionId: string
  title: string
  description: string
  type: LearningMaterialType
  fileName: string
  fileSize: string
  resourceUrl: string
  updatedAt: string
}