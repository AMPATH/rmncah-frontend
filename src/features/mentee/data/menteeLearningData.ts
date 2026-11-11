
import { menteeOverviewData } from './menteeOverviewData'

export interface MenteeLearningSection {
  id: string
  label: string
  completed: boolean
}

export const menteeLearningData = {
  mentee: menteeOverviewData.mentee,

  planTitle: menteeOverviewData.learning.planTitle,

  totalModules: menteeOverviewData.learning.totalModules,

  completedModules: menteeOverviewData.learning.completedModules,

  totalSections: menteeOverviewData.learning.totalSections,

  completedSections: menteeOverviewData.learning.completedSections,

  remainingSections:
    menteeOverviewData.learning.totalSections -
    menteeOverviewData.learning.completedSections,

  modules: menteeOverviewData.learning.modules.map((module) => ({
    ...module,

    sections: Array.from(
      { length: module.sectionsCount },
      (_, index): MenteeLearningSection => ({
        id: `${module.id}-section-${index + 1}`,
        label: `Section ${index + 1}`,
        completed: index < module.completedSections,
      }),
    ),
  })),
}
