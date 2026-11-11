
import {
  cohortRepository,
  facilityRepository,
  menteeRepository,
  mentorRepository,
} from '../../../core/data/repositories'

import type {
  Mentor,
  RecordStatus,
} from '../../../core/data/models'

// ============================================================
// TYPES
// ============================================================

/**
 * Mentor data prepared for the County Mentor directory.
 *
 * Facility name and assignment counts are derived from
 * related records rather than stored on the Mentor entity.
 */
export interface MentorDirectoryRecord extends Mentor {
  facility: string
  cohortsAssigned: number
  menteesAssigned: number
}

/**
 * Fields required when registering a new mentor.
 *
 * The facility must already exist in the facility repository.
 */
export interface CreateMentorInput {
  name: string
  email: string
  phone: string
  facilityId: string
  professionalRole: string
  specialty?: string
}

/**
 * Fields that can be changed on an existing mentor.
 */
export type UpdateMentorInput = Partial<
  Pick<
    Mentor,
    | 'name'
    | 'email'
    | 'phone'
    | 'facilityId'
    | 'professionalRole'
    | 'specialty'
  >
>

// ============================================================
// VALIDATION
// ============================================================

/**
 * Normalize text input before it is stored.
 */
function normalizeText(value: string): string {
  return value.trim()
}

/**
 * Validate required mentor information.
 */
function validateRequiredFields(
  values: Record<string, string>,
): void {
  for (const [field, value] of Object.entries(values)) {
    if (!normalizeText(value)) {
      throw new Error(`${field} is required.`)
    }
  }
}

/**
 * Validate email format.
 */
function validateEmail(email: string): void {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailPattern.test(email)) {
    throw new Error('Please provide a valid email address.')
  }
}

// ============================================================
// SERVICE
// ============================================================

class MentorManagementService {
  /**
   * Retrieve all mentors with their facility names
   * and current assignment counts.
   */
  getAll(): MentorDirectoryRecord[] {
    return mentorRepository
      .getAll()
      .map((mentor) => this.toDirectoryRecord(mentor))
  }

  /**
   * Retrieve one mentor by ID.
   */
  getById(id: string): MentorDirectoryRecord | null {
    const mentor = mentorRepository.findById(id)

    if (!mentor) {
      return null
    }

    return this.toDirectoryRecord(mentor)
  }

  /**
   * Retrieve mentors assigned to a particular facility.
   */
  getByFacility(
    facilityId: string,
  ): MentorDirectoryRecord[] {
    return this.getAll().filter(
      (mentor) => mentor.facilityId === facilityId,
    )
  }

  /**
   * Register a new mentor.
   */
  create(input: CreateMentorInput): MentorDirectoryRecord {
    const normalizedInput = {
      name: normalizeText(input.name),
      email: normalizeText(input.email).toLowerCase(),
      phone: normalizeText(input.phone),
      facilityId: normalizeText(input.facilityId),
      professionalRole: normalizeText(input.professionalRole),
      specialty: normalizeText(input.specialty ?? ''),
    }

    validateRequiredFields({
      Name: normalizedInput.name,
      Email: normalizedInput.email,
      Phone: normalizedInput.phone,
      Facility: normalizedInput.facilityId,
      'Professional role': normalizedInput.professionalRole,
    })

    validateEmail(normalizedInput.email)

    const facility = facilityRepository.findById(
      normalizedInput.facilityId,
    )

    if (!facility) {
      throw new Error('The selected facility could not be found.')
    }

    this.ensureEmailIsAvailable(normalizedInput.email)

    const now = new Date().toISOString()

    const mentor: Mentor = {
      id: `MTR-${crypto.randomUUID()}`,
      name: normalizedInput.name,
      email: normalizedInput.email,
      phone: normalizedInput.phone,
      facilityId: facility.id,
      county: facility.county,
      professionalRole: normalizedInput.professionalRole,
      specialty: normalizedInput.specialty || 'Not specified',
      status: 'Active',
      createdAt: now,
      updatedAt: now,
    }

    const createdMentor = mentorRepository.create(mentor)

    return this.toDirectoryRecord(createdMentor)
  }

  /**
   * Update an existing mentor's information.
   *
   * Returns null when the mentor does not exist.
   */
  update(
    id: string,
    changes: UpdateMentorInput,
  ): MentorDirectoryRecord | null {
    const existingMentor = mentorRepository.findById(id)

    if (!existingMentor) {
      return null
    }

    const normalizedChanges: UpdateMentorInput = {}

    if (changes.name !== undefined) {
      const name = normalizeText(changes.name)

      validateRequiredFields({ Name: name })
      normalizedChanges.name = name
    }

    if (changes.email !== undefined) {
      const email = normalizeText(changes.email).toLowerCase()

      validateRequiredFields({ Email: email })
      validateEmail(email)
      this.ensureEmailIsAvailable(email, id)

      normalizedChanges.email = email
    }

    if (changes.phone !== undefined) {
      const phone = normalizeText(changes.phone)

      validateRequiredFields({ Phone: phone })
      normalizedChanges.phone = phone
    }

    if (changes.professionalRole !== undefined) {
      const professionalRole = normalizeText(
        changes.professionalRole,
      )

      validateRequiredFields({
        'Professional role': professionalRole,
      })

      normalizedChanges.professionalRole = professionalRole
    }

    if (changes.specialty !== undefined) {
      normalizedChanges.specialty = normalizeText(
        changes.specialty,
      )
    }

    if (changes.facilityId !== undefined) {
      const facilityId = normalizeText(changes.facilityId)

      validateRequiredFields({ Facility: facilityId })

      const facility = facilityRepository.findById(facilityId)

      if (!facility) {
        throw new Error(
          'The selected facility could not be found.',
        )
      }

      normalizedChanges.facilityId = facility.id
    }

    const updatedMentor = mentorRepository.update(id, {
      ...normalizedChanges,
      ...(normalizedChanges.facilityId
        ? {
            county: facilityRepository.findById(
              normalizedChanges.facilityId,
            )!.county,
          }
        : {}),
      updatedAt: new Date().toISOString(),
    })

    if (!updatedMentor) {
      return null
    }

    return this.toDirectoryRecord(updatedMentor)
  }

  /**
   * Activate or deactivate a mentor account.
   *
   * Mentor history and related records are preserved.
   */
  updateStatus(
    id: string,
    status: RecordStatus,
  ): MentorDirectoryRecord | null {
    const updatedMentor = mentorRepository.update(id, {
      status,
      updatedAt: new Date().toISOString(),
    })

    if (!updatedMentor) {
      return null
    }

    return this.toDirectoryRecord(updatedMentor)
  }

  // ==========================================================
  // PRIVATE HELPERS
  // ==========================================================

  /**
   * Convert a shared Mentor entity into the directory view.
   */
  private toDirectoryRecord(
    mentor: Mentor,
  ): MentorDirectoryRecord {
    const facility = facilityRepository.findById(
      mentor.facilityId,
    )

    const assignedCohorts = cohortRepository
      .getAll()
      .filter((cohort) => cohort.mentorId === mentor.id)

    const assignedCohortIds = new Set(
      assignedCohorts.map((cohort) => cohort.id),
    )

    const assignedMentees = menteeRepository
      .getAll()
      .filter((mentee) =>
        assignedCohortIds.has(mentee.cohortId),
      )

    return {
      ...mentor,
      facility: facility?.name ?? 'Unknown facility',
      cohortsAssigned: assignedCohorts.length,
      menteesAssigned: assignedMentees.length,
    }
  }

  /**
   * Prevent duplicate mentor email addresses.
   */
  private ensureEmailIsAvailable(
    email: string,
    excludedMentorId?: string,
  ): void {
    const normalizedEmail = email.toLowerCase()

    const duplicate = mentorRepository
      .getAll()
      .some(
        (mentor) =>
          mentor.email?.toLowerCase() === normalizedEmail &&
          mentor.id !== excludedMentorId,
      )

    if (duplicate) {
      throw new Error(
        'A mentor with this email address already exists.',
      )
    }
  }
}

// ============================================================
// EXPORT
// ============================================================

export const mentorManagementService =
  new MentorManagementService()
