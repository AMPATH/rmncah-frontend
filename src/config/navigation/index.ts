import type { UserRole } from '../roles'
import type { RoleNavigation } from './navigation.types'

import { programLeadNavigation } from './programLead'
import { countyMentorNavigation } from './countyMentor'
import { mentorNavigation } from './mentor'
import { menteeNavigation } from './mentee'
import { developerNavigation } from './developer'

export const navigationByRole: Record<UserRole, RoleNavigation> = {
  'program-lead': programLeadNavigation,
  'county-mentor': countyMentorNavigation,
  mentor: mentorNavigation,
  mentee: menteeNavigation,
  developer: developerNavigation,
}