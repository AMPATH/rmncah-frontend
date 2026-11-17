export type LearningResourceType =
  | 'E-book'
  | 'Slides'
  | 'Video'

/**
 * Programme-level resource presentation model.
 *
 * This represents published learning resources as consumed
 * by Mentor and Mentee workspaces. It is separate from the
 * normalized LearningMaterial repository model.
 */
export interface LearningResource {
  id: string
  title: string
  description: string
  type: LearningResourceType
  moduleTitle: string
  sectionTitle: string
  fileName: string
  fileUrl: string
  publishedDate: string
  fileSize: string
  duration?: string
}
