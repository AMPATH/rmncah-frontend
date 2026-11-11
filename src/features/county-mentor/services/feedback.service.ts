import {
  feedbackRepository,
  feedbackResponseRepository,
} from '../../../core/data/repositories'

import type {
  Feedback,
  FeedbackResponse,
} from '../../../core/data/models'

import type {
  FeedbackFormData,
  FeedbackRecord,
  FeedbackResponseFormData,
  FeedbackSummary,
} from '../types/feedback.types'

const createId = (): string => {
  return `FB-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const getTimestamp = (): string => new Date().toISOString()

class FeedbackService {
  getAll(): FeedbackRecord[] {
    const responses = feedbackResponseRepository.getAll()

    return feedbackRepository
      .getAll()
      .map((feedback) => {
        const feedbackResponses = responses
          .filter((response) => response.feedbackId === feedback.id)
          .sort(
            (first, second) =>
              new Date(first.createdAt).getTime() -
              new Date(second.createdAt).getTime(),
          )

        return {
          ...feedback,
          responses: feedbackResponses,
          responseCount: feedbackResponses.length,
        }
      })
      .sort(
        (first, second) =>
          new Date(second.createdAt).getTime() -
          new Date(first.createdAt).getTime(),
      )
  }

  getById(id: string): FeedbackRecord | null {
    return this.getAll().find((feedback) => feedback.id === id) ?? null
  }

  getSummary(): FeedbackSummary {
    const feedbackRecords = feedbackRepository.getAll()

    return {
      totalFeedback: feedbackRecords.length,

      totalChallenges: feedbackRecords.filter(
        (feedback) => feedback.recordType === 'Challenge',
      ).length,

      pending: feedbackRecords.filter(
        (feedback) => feedback.status === 'Pending',
      ).length,

      inProgress: feedbackRecords.filter(
        (feedback) => feedback.status === 'In Progress',
      ).length,

      resolved: feedbackRecords.filter(
        (feedback) => feedback.status === 'Resolved',
      ).length,

      urgent: feedbackRecords.filter(
        (feedback) => feedback.priority === 'Urgent',
      ).length,
    }
  }

  create(data: FeedbackFormData): Feedback {
    const timestamp = getTimestamp()

    const feedback: Feedback = {
      id: createId(),
      subject: data.subject.trim(),
      message: data.message.trim(),
      recordType: data.recordType,
      category: data.category,
      direction: data.direction,
      status: 'Pending',
      priority: data.priority,
      senderId: data.senderId ?? null,
      senderName: data.senderName.trim(),
      senderRole: data.senderRole,
      recipientId: data.recipientId ?? null,
      recipientName: data.recipientName.trim(),
      recipientRole: data.recipientRole,
      facilityId: data.facilityId || null,
      cohortId: data.cohortId || null,
      assignedToId: data.assignedToId ?? null,
      assignedToName: data.assignedToName?.trim() || null,
      followUp: data.followUp?.trim() || '',
      dueDate: data.dueDate || null,
      resolvedAt: null,
      resolutionNotes: '',
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    return feedbackRepository.create(feedback)
  }

  update(
    id: string,
    changes: Partial<FeedbackFormData>,
  ): Feedback | null {
    const updateData: Partial<Omit<Feedback, 'id'>> = {
      ...changes,
      updatedAt: getTimestamp(),
    }

    if (changes.subject !== undefined) {
      updateData.subject = changes.subject.trim()
    }

    if (changes.message !== undefined) {
      updateData.message = changes.message.trim()
    }

    if (changes.senderName !== undefined) {
      updateData.senderName = changes.senderName.trim()
    }

    if (changes.recipientName !== undefined) {
      updateData.recipientName = changes.recipientName.trim()
    }

    if (changes.followUp !== undefined) {
      updateData.followUp = changes.followUp.trim()
    }

    if (changes.assignedToName !== undefined) {
      updateData.assignedToName = changes.assignedToName?.trim() || null
    }

    if (changes.facilityId !== undefined) {
      updateData.facilityId = changes.facilityId || null
    }

    if (changes.cohortId !== undefined) {
      updateData.cohortId = changes.cohortId || null
    }

    if (changes.dueDate !== undefined) {
      updateData.dueDate = changes.dueDate || null
    }

    return feedbackRepository.update(id, updateData)
  }

  updateStatus(
    id: string,
    status: Feedback['status'],
    resolutionNotes?: string,
  ): Feedback | null {
    const updateData: Partial<Omit<Feedback, 'id'>> = {
      status,
      updatedAt: getTimestamp(),
    }

    if (status === 'Resolved') {
      updateData.resolvedAt = getTimestamp()

      if (resolutionNotes !== undefined) {
        updateData.resolutionNotes = resolutionNotes.trim()
      }
    } else {
      updateData.resolvedAt = null
    }

    return feedbackRepository.update(id, updateData)
  }

  getResponses(feedbackId: string): FeedbackResponse[] {
    return feedbackResponseRepository
      .getAll()
      .filter((response) => response.feedbackId === feedbackId)
      .sort(
        (first, second) =>
          new Date(first.createdAt).getTime() -
          new Date(second.createdAt).getTime(),
      )
  }

  addResponse(
    feedbackId: string,
    data: FeedbackResponseFormData,
  ): FeedbackResponse {
    const feedback = feedbackRepository.findById(feedbackId)

    if (!feedback) {
      throw new Error('The selected feedback record could not be found.')
    }

    if (feedback.status === 'Resolved') {
      throw new Error('Resolved feedback cannot receive new responses.')
    }

    const timestamp = getTimestamp()

    const response: FeedbackResponse = {
      id: createId(),
      feedbackId,
      responderId: data.responderId ?? null,
      responderName: data.responderName.trim(),
      responderRole: data.responderRole,
      message: data.message.trim(),
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    const createdResponse = feedbackResponseRepository.create(response)

    if (feedback.status === 'Pending') {
      feedbackRepository.update(feedbackId, {
        status: 'In Progress',
        updatedAt: timestamp,
      })
    }

    return createdResponse
  }

  delete(id: string): boolean {
    const feedback = feedbackRepository.findById(id)

    if (!feedback) {
      return false
    }

    const remainingResponses = feedbackResponseRepository
      .getAll()
      .filter((response) => response.feedbackId !== id)

    feedbackResponseRepository.replaceAll(remainingResponses)

    return feedbackRepository.delete(id)
  }
}

export const feedbackService = new FeedbackService()