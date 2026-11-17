
import { learningResourcesData } from '../../../data/resources/learningResourcesData'
import { menteeOverviewData } from './menteeOverviewData'

// Get the module titles in this mentee's assigned learning plan.
const assignedModuleTitles = new Set(
  menteeOverviewData.learning.modules.map(
    (module) => module.title,
  ),
)

// Only include resources associated with assigned modules.
export const menteeResourcesData = learningResourcesData
  .filter((resource) =>
    assignedModuleTitles.has(resource.moduleTitle),
  )
  .sort((a, b) =>
    b.publishedDate.localeCompare(a.publishedDate),
  )
