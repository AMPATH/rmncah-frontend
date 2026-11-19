
import type {
  ProgramDashboardStatistics,
  ProgramModule,
  ProgramActivity,
  ContentAttentionItem,
} from '../types/program-lead.types'

/**
 * Currently available demonstration training module records.
 *
 * The official EmONC curriculum contains 13 modules.
 * The remaining official module records will be added when
 * the approved module titles and content are provided.
 */
export const programModules: ProgramModule[] = [
  {
    id: 'MOD-001',
    title: 'Emergency Obstetric Care',
    category: 'EmONC',
    sectionsCount: 4,
    materialsCount: 4,
    status: 'Completed',
    updatedAt: '08 Nov 2026',
  },
  {
    id: 'MOD-002',
    title: 'Basic Newborn Care',
    category: 'Newborn Health',
    sectionsCount: 3,
    materialsCount: 3,
    status: 'Completed',
    updatedAt: '07 Nov 2026',
  },
  {
    id: 'MOD-003',
    title: 'Maternal and Perinatal Death Surveillance',
    category: 'MPDSR',
    sectionsCount: 2,
    materialsCount: 0,
    status: 'Incomplete content',
    updatedAt: '06 Nov 2026',
  },
  {
    id: 'MOD-004',
    title: 'Essential Newborn Resuscitation',
    category: 'Newborn Health',
    sectionsCount: 2,
    materialsCount: 2,
    status: 'Completed',
    updatedAt: '05 Nov 2026',
  },
  {
    id: 'MOD-005',
    title: 'Management of Obstetric Emergencies',
    category: 'EmONC',
    sectionsCount: 2,
    materialsCount: 1,
    status: 'Completed',
    updatedAt: '03 Nov 2026',
  },
]

/**
 * Program Lead dashboard statistics.
 *
 * totalModules represents the expected official curriculum count.
 * Other statistics are calculated from currently available records.
 */
export const programDashboardStatistics: ProgramDashboardStatistics = {
  totalModules: 13,

  completeModules: programModules.filter(
    (module) =>
      module.sectionsCount > 0 && module.materialsCount > 0,
  ).length,

  draftModules: programModules.filter(
    (module) => module.status === 'Draft',
  ).length,

  incompleteModules: programModules.filter(
    (module) => module.status === 'Incomplete content',
  ).length,

  totalSections: programModules.reduce(
    (total, module) => total + module.sectionsCount,
    0,
  ),

  totalMaterials: programModules.reduce(
    (total, module) => total + module.materialsCount,
    0,
  ),
}

/**
 * Content requiring attention.
 */
export const contentAttentionItems: ContentAttentionItem[] = [
  {
    id: 'ATT-001',
    title: 'Modules missing sections',
    description:
      'Some training modules need sections created before their content can be completed.',
    count: programModules.filter(
      (module) => module.sectionsCount === 0,
    ).length,
    actionLabel: 'Manage sections',
    path: '/program-lead/module-sections',
  },
  {
    id: 'ATT-002',
    title: 'Modules missing learning materials',
    description:
      'Add e-books, presentations or videos to support the training modules.',
    count: programModules.filter(
      (module) => module.materialsCount === 0,
    ).length,
    actionLabel: 'Manage materials',
    path: '/program-lead/learning-materials',
  },
]

/**
 * Recent Program Lead activity.
 */
export const programActivities: ProgramActivity[] = [
  {
    id: 'ACT-001',
    action: 'Training module completed',
    description:
      'Emergency Obstetric Care has its sections and learning materials in place.',
    actor: 'Program Lead',
    date: '08 Nov 2026',
  },
  {
    id: 'ACT-002',
    action: 'Learning materials added',
    description:
      'Four learning resources were added to Basic Newborn Care.',
    actor: 'Program Lead',
    date: '07 Nov 2026',
  },
  {
    id: 'ACT-003',
    action: 'Module section created',
    description:
      'A new section was added to Essential Newborn Resuscitation.',
    actor: 'Program Lead',
    date: '06 Nov 2026',
  },
  {
    id: 'ACT-004',
    action: 'Training module updated',
    description:
      'Management of Obstetric Emergencies was updated.',
    actor: 'Program Lead',
    date: '05 Nov 2026',
  },
]
