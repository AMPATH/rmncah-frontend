
import { useMemo, useState } from 'react'

import {
  Button,
  Modal,
  Search,
  Select,
  SelectItem,
  Tag,
  TextInput,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react'

import {
  Add,
  Edit,
  View,
  UserMultiple,
} from '@carbon/icons-react'

import MentorSummary from '../components/mentors/MentorSummary'

import {
  mentorManagementService,
} from '../services/mentor-management.service'

import type {
  MentorDirectoryRecord,
} from '../services/mentor-management.service'

import {
  facilityRepository,
} from '../../../core/data/repositories'

import '../styles/county-mentor-mentors.scss'

interface MentorsPageProps {
  title: string
}

const tableHeaders = [
  'Mentor',
  'Professional role',
  'Facility',
  'Cohorts',
  'Mentees',
  'Account status',
  'Actions',
]

function MentorsPage({ title }: MentorsPageProps) {
  // ==========================================================
  // MENTOR AND FACILITY DATA
  // ==========================================================

  const [mentors, setMentors] = useState<MentorDirectoryRecord[]>(
    () => mentorManagementService.getAll(),
  )

  const facilities = useMemo(
    () =>
      facilityRepository
        .getAll()
        .sort((first, second) =>
          first.name.localeCompare(second.name),
        ),
    [],
  )

  // ==========================================================
  // SEARCH AND FILTER STATE
  // ==========================================================

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [facilityFilter, setFacilityFilter] = useState('all')

  // ==========================================================
  // MODAL AND PROFILE STATE
  // ==========================================================

  const [isModalOpen, setIsModalOpen] = useState(false)

  const [editingMentor, setEditingMentor] =
    useState<MentorDirectoryRecord | null>(null)

  const [selectedMentor, setSelectedMentor] =
    useState<MentorDirectoryRecord | null>(null)

  // ==========================================================
  // MENTOR FORM STATE
  // ==========================================================

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [facilityId, setFacilityId] = useState('')
  const [professionalRole, setProfessionalRole] = useState('')

  const [formError, setFormError] = useState('')

  // ==========================================================
  // REFRESH MENTOR DATA
  // ==========================================================

  const refreshMentors = (selectedMentorId?: string) => {
    const updatedMentors = mentorManagementService.getAll()

    setMentors(updatedMentors)

    if (selectedMentorId) {
      const refreshedMentor = updatedMentors.find(
        (mentor) => mentor.id === selectedMentorId,
      )

      setSelectedMentor(refreshedMentor ?? null)
    }
  }

  // ==========================================================
  // FILTER MENTORS
  // ==========================================================

  const filteredMentors = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return mentors.filter((mentor) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        mentor.name.toLowerCase().includes(normalizedSearch) ||
        (mentor.email ?? '').toLowerCase().includes(normalizedSearch) ||
        mentor.id.toLowerCase().includes(normalizedSearch) ||
        mentor.facility.toLowerCase().includes(normalizedSearch) ||
        mentor.professionalRole.toLowerCase().includes(normalizedSearch)

      const matchesStatus =
        statusFilter === 'all' ||
        mentor.status === statusFilter

      const matchesFacility =
        facilityFilter === 'all' ||
        mentor.facilityId === facilityFilter

      return matchesSearch && matchesStatus && matchesFacility
    })
  }, [mentors, searchTerm, statusFilter, facilityFilter])

  // ==========================================================
  // FORM RESET AND MODAL HANDLERS
  // ==========================================================

  const resetForm = () => {
    setName('')
    setEmail('')
    setPhone('')
    setFacilityId('')
    setProfessionalRole('')
    setFormError('')
  }

  const openCreateModal = () => {
    setEditingMentor(null)
    resetForm()
    setIsModalOpen(true)
  }

  const openEditModal = (mentor: MentorDirectoryRecord) => {
    setEditingMentor(mentor)

    setName(mentor.name)
    setEmail(mentor.email ?? '')
    setPhone(mentor.phone ?? '')
    setFacilityId(mentor.facilityId)
    setProfessionalRole(mentor.professionalRole)

    setFormError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingMentor(null)
    resetForm()
  }

  // ==========================================================
  // CREATE AND UPDATE MENTORS
  // ==========================================================

  const handleSaveMentor = () => {
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    const trimmedPhone = phone.trim()
    const trimmedRole = professionalRole.trim()

    if (
      !trimmedName ||
      !trimmedEmail ||
      !trimmedPhone ||
      !facilityId ||
      !trimmedRole
    ) {
      setFormError('Please complete all required fields.')
      return
    }

    try {
      if (editingMentor) {
        const updatedMentor = mentorManagementService.update(
          editingMentor.id,
          {
            name: trimmedName,
            email: trimmedEmail,
            phone: trimmedPhone,
            facilityId,
            professionalRole: trimmedRole,
          },
        )

        if (!updatedMentor) {
          setFormError('This mentor could not be found.')
          return
        }

        refreshMentors(editingMentor.id)
      } else {
        const createdMentor = mentorManagementService.create({
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
          facilityId,
          professionalRole: trimmedRole,
        })

        refreshMentors(createdMentor.id)
      }

      closeModal()
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while saving the mentor.',
      )
    }
  }

  // ==========================================================
  // ACTIVATE AND DEACTIVATE MENTOR ACCOUNTS
  // ==========================================================

  const handleToggleStatus = (
    mentor: MentorDirectoryRecord,
  ) => {
    const nextStatus =
      mentor.status === 'Active' ? 'Inactive' : 'Active'

    try {
      const updatedMentor =
        mentorManagementService.updateStatus(
          mentor.id,
          nextStatus,
        )

      if (!updatedMentor) {
        return
      }

      refreshMentors(mentor.id)
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Unable to update this mentor account.',
      )
    }
  }

  // ==========================================================
  // DATE FORMATTING
  // ==========================================================

  const formatDate = (date: string) => {
    if (!date) {
      return '—'
    }

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) {
      return '—'
    }

    return parsedDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="county-mentors">

      {/* PAGE HEADER */}

      <header className="county-mentors__header">
        <div>
          <p className="county-mentors__eyebrow">
            COUNTY MENTORSHIP MANAGEMENT
          </p>

          <h1>{title}</h1>

          <p className="county-mentors__description">
            Manage mentor accounts and monitor their facility,
            cohort and mentee assignments across the programme.
          </p>
        </div>

        <Button
          renderIcon={Add}
          onClick={openCreateModal}
        >
          Add mentor
        </Button>
      </header>

      {/* LOCAL STORAGE NOTICE */}

      <div className="county-mentors__demo-note">
        <span>LOCAL DEMO STORAGE</span>
        Mentor records are currently stored in this browser.
        Changes persist locally and can later be connected to the backend.
      </div>

      {/* MENTOR STATISTICS */}

      <MentorSummary mentors={mentors} />

      {/* ====================================================
          MENTOR DIRECTORY
      ===================================================== */}

      <section className="county-mentors__directory">

        <div className="county-mentors__section-header">
          <div>
            <h2>Mentor directory</h2>

            <p>
              View, search and manage registered programme mentors.
            </p>
          </div>

          <span className="county-mentors__result-count">
            {filteredMentors.length} of {mentors.length} mentors
          </span>
        </div>

        {/* SEARCH AND FILTERS */}

        <div className="county-mentors__filters">

          <div className="county-mentors__search">
            <Search
              size="lg"
              labelText="Search mentors"
              placeholder="Search by name, email, facility or ID"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.currentTarget.value)
              }
            />
          </div>

          <div className="county-mentors__filter">
            <Select
              id="mentor-status-filter"
              labelText="Account status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.currentTarget.value)
              }
            >
              <SelectItem value="all" text="All statuses" />
              <SelectItem value="Active" text="Active" />
              <SelectItem value="Inactive" text="Inactive" />
            </Select>
          </div>

          <div className="county-mentors__filter">
            <Select
              id="mentor-facility-filter"
              labelText="Facility"
              value={facilityFilter}
              onChange={(event) =>
                setFacilityFilter(event.currentTarget.value)
              }
            >
              <SelectItem value="all" text="All facilities" />

              {facilities.map((facility) => (
                <SelectItem
                  key={facility.id}
                  value={facility.id}
                  text={facility.name}
                />
              ))}
            </Select>
          </div>

        </div>

        {/* MENTOR TABLE */}

        <div className="county-mentors__table-wrapper">
          <Table>
            <TableHead>
              <TableRow>
                {tableHeaders.map((header) => (
                  <TableHeader key={header}>
                    {header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>

              {filteredMentors.map((mentor) => (
                <TableRow key={mentor.id}>

                  {/* MENTOR IDENTITY */}

                  <TableCell>
                    <div className="county-mentors__identity">

                      <div className="county-mentors__avatar">
                        {mentor.name
                          .split(' ')
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>{mentor.name}</strong>
                        <span>{mentor.id}</span>
                      </div>

                    </div>
                  </TableCell>

                  {/* PROFESSIONAL ROLE */}

                  <TableCell>
                    {mentor.professionalRole}
                  </TableCell>

                  {/* FACILITY */}

                  <TableCell>
                    {mentor.facility}
                  </TableCell>

                  {/* COHORT ASSIGNMENTS */}

                  <TableCell>
                    {mentor.cohortsAssigned}
                  </TableCell>

                  {/* MENTEE ASSIGNMENTS */}

                  <TableCell>
                    {mentor.menteesAssigned}
                  </TableCell>

                  {/* ACCOUNT STATUS */}

                  <TableCell>
                    <Tag
                      type={
                        mentor.status === 'Active'
                          ? 'green'
                          : 'gray'
                      }
                    >
                      {mentor.status}
                    </Tag>
                  </TableCell>

                  {/* ROW ACTIONS */}

                  <TableCell>
                    <div className="county-mentors__row-actions">

                      <Button
                        kind="ghost"
                        size="sm"
                        hasIconOnly
                        renderIcon={View}
                        iconDescription="View mentor"
                        onClick={() =>
                          setSelectedMentor(mentor)
                        }
                      />

                      <Button
                        kind="ghost"
                        size="sm"
                        hasIconOnly
                        renderIcon={Edit}
                        iconDescription="Edit mentor"
                        onClick={() =>
                          openEditModal(mentor)
                        }
                      />

                    </div>
                  </TableCell>

                </TableRow>
              ))}

              {/* EMPTY STATE */}

              {filteredMentors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="county-mentors__empty">
                      <UserMultiple size={28} />

                      <strong>No mentors found</strong>

                      <span>
                        Try changing your search or filters.
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )}

            </TableBody>
          </Table>
        </div>

      </section>

      {/* ====================================================
          SELECTED MENTOR PROFILE
      ===================================================== */}

      {selectedMentor && (
        <section className="county-mentor-details">

          <div className="county-mentor-details__header">
            <div>
              <p>MENTOR PROFILE</p>

              <h2>{selectedMentor.name}</h2>

              <span>{selectedMentor.id}</span>
            </div>

            <div className="county-mentor-details__actions">

              <Tag
                type={
                  selectedMentor.status === 'Active'
                    ? 'green'
                    : 'gray'
                }
              >
                {selectedMentor.status}
              </Tag>

              <Button
                kind="ghost"
                size="sm"
                onClick={() => setSelectedMentor(null)}
              >
                Close details
              </Button>

            </div>
          </div>

          {/* PROFILE INFORMATION */}

          <div className="county-mentor-details__grid">

            <article>
              <span>Email address</span>
              <strong>{selectedMentor.email || '—'}</strong>
            </article>

            <article>
              <span>Phone number</span>
              <strong>{selectedMentor.phone || '—'}</strong>
            </article>

            <article>
              <span>Professional role</span>
              <strong>{selectedMentor.professionalRole}</strong>
            </article>

            <article>
              <span>Specialty</span>
              <strong>{selectedMentor.specialty}</strong>
            </article>

            <article>
              <span>Facility</span>
              <strong>{selectedMentor.facility}</strong>
            </article>

            <article>
              <span>County</span>
              <strong>{selectedMentor.county}</strong>
            </article>

            <article>
              <span>Cohorts assigned</span>
              <strong>{selectedMentor.cohortsAssigned}</strong>
            </article>

            <article>
              <span>Mentees assigned</span>
              <strong>{selectedMentor.menteesAssigned}</strong>
            </article>

            <article>
              <span>Account created</span>
              <strong>
                {formatDate(selectedMentor.createdAt)}
              </strong>
            </article>

          </div>

          {/* ACCOUNT MANAGEMENT */}

          <div className="county-mentor-details__footer">

            <p>
              Account management

              <span>
                Change this mentor's account availability.
              </span>
            </p>

            <Button
              kind={
                selectedMentor.status === 'Active'
                  ? 'danger--tertiary'
                  : 'tertiary'
              }
              onClick={() =>
                handleToggleStatus(selectedMentor)
              }
            >
              {selectedMentor.status === 'Active'
                ? 'Deactivate account'
                : 'Activate account'}
            </Button>

          </div>

        </section>
      )}

      {/* ====================================================
          ADD / EDIT MENTOR MODAL
      ===================================================== */}

      <Modal
        open={isModalOpen}
        modalHeading={
          editingMentor ? 'Edit mentor' : 'Add mentor'
        }
        primaryButtonText={
          editingMentor ? 'Save changes' : 'Add mentor'
        }
        secondaryButtonText="Cancel"
        onRequestClose={closeModal}
        onRequestSubmit={handleSaveMentor}
        primaryButtonDisabled={
          !name.trim() ||
          !email.trim() ||
          !phone.trim() ||
          !facilityId ||
          !professionalRole.trim()
        }
      >

        <div className="county-mentors__form">

          <p>
            Enter the mentor's basic account and facility details.
          </p>

          {/* FORM ERROR */}

          {formError && (
            <div
              className="county-mentors__form-error"
              role="alert"
            >
              {formError}
            </div>
          )}

          {/* FULL NAME */}

          <TextInput
            id="mentor-name"
            labelText="Full name"
            placeholder="Enter full name"
            value={name}
            onChange={(event) =>
              setName(event.currentTarget.value)
            }
          />

          {/* EMAIL */}

          <TextInput
            id="mentor-email"
            labelText="Email address"
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(event) =>
              setEmail(event.currentTarget.value)
            }
          />

          {/* PHONE */}

          <TextInput
            id="mentor-phone"
            labelText="Phone number"
            placeholder="Enter phone number"
            value={phone}
            onChange={(event) =>
              setPhone(event.currentTarget.value)
            }
          />

          {/* FACILITY */}

          <Select
            id="mentor-facility"
            labelText="Assigned facility"
            value={facilityId}
            onChange={(event) =>
              setFacilityId(event.currentTarget.value)
            }
          >
            <SelectItem
              value=""
              text="Select a facility"
            />

            {facilities.map((facility) => (
              <SelectItem
                key={facility.id}
                value={facility.id}
                text={`${facility.name} — ${facility.county}`}
              />
            ))}
          </Select>

          {/* PROFESSIONAL ROLE */}

          <TextInput
            id="mentor-professional-role"
            labelText="Professional role"
            placeholder="e.g. Senior Midwife"
            value={professionalRole}
            onChange={(event) =>
              setProfessionalRole(event.currentTarget.value)
            }
          />

        </div>

      </Modal>

    </div>
  )
}

export default MentorsPage
