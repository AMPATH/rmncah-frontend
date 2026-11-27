/**
 * Official EmONC curriculum definition.
 *
 * This file defines the approved programme structure.
 * It is separate from editable TrainingModule records,
 * API records and demonstration data.
 *
 * Module titles and ordering follow the MNCH Mentorship Guide.
 */

export interface EmONCCurriculumModule {
  id: string
  order: number
  title: string
  category: 'EmONC'
  subTrackCount?: number
}

export const EMONC_CURRICULUM_MODULES: readonly EmONCCurriculumModule[] = [
  {
    id: 'EMONC-M01',
    order: 1,
    title: 'Infection Prevention & Control',
    category: 'EmONC',
  },
  {
    id: 'EMONC-M02',
    order: 2,
    title: 'Focused Antenatal Care',
    category: 'EmONC',
  },
  {
    id: 'EMONC-M03',
    order: 3,
    title: 'Labour & Delivery (Normal)',
    category: 'EmONC',
  },
  {
    id: 'EMONC-M04',
    order: 4,
    title: 'Partograph Use',
    category: 'EmONC',
  },
  {
    id: 'EMONC-M05',
    order: 5,
    title: 'Postpartum Haemorrhage (PPH)',
    category: 'EmONC',
    subTrackCount: 10,
  },
  {
    id: 'EMONC-M06',
    order: 6,
    title: 'Pre-eclampsia & Eclampsia',
    category: 'EmONC',
  },
  {
    id: 'EMONC-M07',
    order: 7,
    title: 'Obstructed Labour & Shoulder Dystocia',
    category: 'EmONC',
  },
  {
    id: 'EMONC-M08',
    order: 8,
    title: 'Sepsis & Puerperal Infection',
    category: 'EmONC',
  },
  {
    id: 'EMONC-M09',
    order: 9,
    title: 'Newborn Resuscitation',
    category: 'EmONC',
  },
  {
    id: 'EMONC-M10',
    order: 10,
    title: 'Preterm & Low Birth Weight',
    category: 'EmONC',
  },
  {
    id: 'EMONC-M11',
    order: 11,
    title: 'HIV in Pregnancy',
    category: 'EmONC',
  },
  {
    id: 'EMONC-M12',
    order: 12,
    title: 'Nutrition in Pregnancy',
    category: 'EmONC',
  },
  {
    id: 'EMONC-M13',
    order: 13,
    title: 'Family Planning Post-Partum',
    category: 'EmONC',
  },
]

export const EMONC_CURRICULUM_MODULE_COUNT =
  EMONC_CURRICULUM_MODULES.length
