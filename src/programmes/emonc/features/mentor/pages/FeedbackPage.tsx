
import { useMemo, useState } from 'react'

import FeedbackSummary from '../components/feedback/FeedbackSummary'
import FeedbackFilters from '../components/feedback/FeedbackFilters'
import FeedbackList from '../components/feedback/FeedbackList'
import FeedbackDetails from '../components/feedback/FeedbackDetails'

import {
  mentorFeedbackData,
} from '../data/mentorFeedbackData'

import type {
  MentorFeedback,
  FeedbackCategory,
  FeedbackDirection,
  FeedbackStatus,
} from '../data/mentorFeedbackData'

import '../styles/mentor-feedback.scss'

interface FeedbackPageProps {
  title: string
}

function FeedbackPage({ title }: FeedbackPageProps) {
  const [feedback, setFeedback] = useState<MentorFeedback[]>(
    mentorFeedbackData,
  )

  const [searchTerm, setSearchTerm] = useState('')

  const [selectedDirection, setSelectedDirection] = useState<
    'All' | FeedbackDirection
  >('All')

  const [selectedStatus, setSelectedStatus] = useState<
    'All' | FeedbackStatus
  >('All')

  const [selectedCategory, setSelectedCategory] = useState<
    'All' | FeedbackCategory
  >('All')

  const [selectedFeedbackId, setSelectedFeedbackId] = useState<
    string | null
  >(null)

  const filteredFeedback = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return feedback.filter((item) => {
      const matchesSearch =
        item.subject.toLowerCase().includes(normalizedSearch) ||
        item.message.toLowerCase().includes(normalizedSearch) ||
        item.sender.toLowerCase().includes(normalizedSearch) ||
        item.cohortName.toLowerCase().includes(normalizedSearch)

      const matchesDirection =
        selectedDirection === 'All' ||
        item.direction === selectedDirection

      const matchesStatus =
        selectedStatus === 'All' ||
        item.status === selectedStatus

      const matchesCategory =
        selectedCategory === 'All' ||
        item.category === selectedCategory

      return (
        matchesSearch &&
        matchesDirection &&
        matchesStatus &&
        matchesCategory
      )
    })
  }, [
    feedback,
    searchTerm,
    selectedDirection,
    selectedStatus,
    selectedCategory,
  ])

  const selectedFeedback = feedback.find(
    (item) => item.id === selectedFeedbackId,
  )

  function handleRespond(id: string, response: string) {
    setFeedback((currentFeedback) =>
      currentFeedback.map((item) =>
        item.id === id
          ? {
              ...item,
              response,
              status: 'In Progress',
            }
          : item,
      ),
    )
  }

  function handleBack() {
    setSelectedFeedbackId(null)
  }

  return (
    <div className="mentor-feedback-page">
      <div className="mentor-feedback-page__header">
        <div>
          <p className="mentor-feedback-eyebrow">
            MENTOR WORKSPACE
          </p>

          <h1>{title}</h1>

          <p>
            Review feedback, respond to recommendations and track
            follow-up actions related to your mentorship activities.
          </p>
        </div>
      </div>

      {selectedFeedback ? (
        <FeedbackDetails
          key={selectedFeedback.id}
          feedback={selectedFeedback}
          onBack={handleBack}
          onRespond={handleRespond}
        />
      ) : (
        <>
          <FeedbackSummary feedback={feedback} />

          <section className="mentor-feedback-workspace">
            <div className="mentor-feedback-workspace__header">
              <div>
                <h2>Feedback and communication</h2>
                <p>
                  View feedback received and submissions made by you.
                </p>
              </div>

              <span className="feedback-record-count">
                {filteredFeedback.length} records
              </span>
            </div>

            <FeedbackFilters
              searchTerm={searchTerm}
              selectedDirection={selectedDirection}
              selectedStatus={selectedStatus}
              selectedCategory={selectedCategory}
              onSearchChange={setSearchTerm}
              onDirectionChange={setSelectedDirection}
              onStatusChange={setSelectedStatus}
              onCategoryChange={setSelectedCategory}
            />

            <FeedbackList
              feedback={filteredFeedback}
              onView={(item) => setSelectedFeedbackId(item.id)}
            />
          </section>
        </>
      )}

      <p className="mentor-feedback-demo-notice">
        Demonstration data: responses are held in local page state and
        are not saved to the backend.
      </p>
    </div>
  )
}

export default FeedbackPage
