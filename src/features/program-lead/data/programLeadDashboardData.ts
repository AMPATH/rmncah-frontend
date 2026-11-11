import type {
  ProgramDashboardStatistics,
  ProgramModule,
  ProgramActivity,
  ContentAttentionItem,
} from '../types/program-lead.types'

/**
 * Dashboard statistics
 *
 * Demo data for the Program Lead dashboard.
 * These values will eventually come from the backend API.
 */
export const programDashboardStatistics: ProgramDashboardStatistics = {
  totalModules: 12,
  publishedModules: 8,
  draftModules: 3,
  incompleteModules: 1,
  totalSections: 42,
  totalMaterials: 86,
}

/**
 * Recently updated training modules
 */
export const programModules: ProgramModule[] = [
  {
    id: 'MOD-001',
    title: 'Emergency Obstetric Care',
    category: 'EmONC',
    sectionsCount: 8,
    materialsCount: 18,
    status: 'Published',
    updatedAt: '08 Nov 2026',
  },
  {
    id: 'MOD-002',
    title: 'Basic Newborn Care',
    category: 'Newborn Health',
    sectionsCount: 6,
    materialsCount: 14,
    status: 'Published',
    updatedAt: '07 Nov 2026',
  },
  {
    id: 'MOD-003',
    title: 'Maternal and Perinatal Death Surveillance',
    category: 'MPDSR',
    sectionsCount: 5,
    materialsCount: 0,
    status: 'Incomplete content',
    updatedAt: '06 Nov 2026',
  },
  {
    id: 'MOD-004',
    title: 'Essential Newborn Resuscitation',
    category: 'Newborn Health',
    sectionsCount: 4,
    materialsCount: 9,
    status: 'Draft',
    updatedAt: '05 Nov 2026',
  },
  {
    id: 'MOD-005',
    title: 'Management of Obstetric Emergencies',
    category: 'EmONC',
    sectionsCount: 7,
    materialsCount: 16,
    status: 'Published',
    updatedAt: '03 Nov 2026',
  },
]

/**
 * Content requiring attention
 */
export const contentAttentionItems: ContentAttentionItem[] = [
  {
    id: 'ATT-001',
    title: 'Modules missing sections',
    description:
      'Some training modules need their sections created before they can be completed.',
    count: 2,
    actionLabel: 'Manage sections',
    path: '/program-lead/module-sections',
  },
  {
    id: 'ATT-002',
    title: 'Modules missing learning materials',
    description:
      'Add e-books, presentations or videos to make training modules ready for learning.',
    count: 3,
    actionLabel: 'Manage materials',
    path: '/program-lead/learning-materials',
  },
  {
    id: 'ATT-003',
    title: 'Modules ready for publication',
    description:
      'Review completed training content and publish it to the Module Library.',
    count: 2,
    actionLabel: 'Open module library',
    path: '/program-lead/module-library',
  },
]

/**
 * Recent Program Lead activity
 */
export const programActivities: ProgramActivity[] = [
  {
    id: 'ACT-001',
    action: 'Module published',
    description:
      'Emergency Obstetric Care was published to the Module Library.',
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
