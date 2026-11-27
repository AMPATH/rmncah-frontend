import { assessmentApi } from './assessment-api.client'
import type {
  AssessmentTemplate,
  AssessmentTemplateQuestion,
} from '../types'

export const OFFICIAL_ASSESSMENT_TEMPLATE_ID =
  'emonc-mentorship-assessment-tool-v1'

function validateQuestionSource(
  item: AssessmentTemplateQuestion,
  template: AssessmentTemplate,
): void {
  const { block, row, rows } = item.source
  const sourceBlock = template.blocks[block]

  if (!sourceBlock) {
    throw new Error(
      `Assessment template item "${item.id}" references missing source block ${block}.`,
    )
  }

  const rowIndexes = rows ?? (row === undefined ? [] : [row])

  if (rowIndexes.length === 0) {
    throw new Error(
      `Assessment template item "${item.id}" has no source row.`,
    )
  }

  if (
    rowIndexes.some(
      (index) =>
        !Number.isInteger(index) ||
        index < 0 ||
        !sourceBlock.rows ||
        index >= sourceBlock.rows.length,
    )
  ) {
    throw new Error(
      `Assessment template item "${item.id}" references an invalid source row.`,
    )
  }
}

function validateTemplate(
  template: AssessmentTemplate,
): AssessmentTemplate {
  if (
    !template.id ||
    !template.version ||
    !Array.isArray(template.blocks) ||
    !Array.isArray(template.questionnaire?.sections)
  ) {
    throw new Error('The official Facility Assessment template is invalid.')
  }

  for (const section of template.questionnaire.sections) {
    if (!Array.isArray(section.items)) {
      throw new Error(
        `Assessment template section "${section.id}" has invalid items.`,
      )
    }

    for (const item of section.items) {
      validateQuestionSource(item, template)
    }
  }

  return template
}

export async function getOfficialAssessmentTemplate():
Promise<AssessmentTemplate> {
  const templates = await assessmentApi.get<AssessmentTemplate>(
    'assessmentTemplates',
  )

  const template = templates.find(
    (record) => record.id === OFFICIAL_ASSESSMENT_TEMPLATE_ID,
  )

  if (!template) {
    throw new Error('The official Facility Assessment template was not found.')
  }

  return validateTemplate(template)
}
