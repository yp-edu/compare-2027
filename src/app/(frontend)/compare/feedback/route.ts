import { getPayload } from 'payload'

import { requireChatSession } from '@/features/ai/server'
import { compareResponseFeedback } from '@/flags'
import config from '@/payload.config'

const maxQuestionLength = 2000
const maxAnswerLength = 12000
const maxCommentLength = 1000

type FeedbackRating = 'helpful' | 'not_helpful'

function isFeedbackRating(value: unknown): value is FeedbackRating {
  return value === 'helpful' || value === 'not_helpful'
}

function getString(value: unknown, maxLength: number) {
  if (typeof value !== 'string') {
    return null
  }

  const text = value.trim()

  if (!text || text.length > maxLength) {
    return null
  }

  return text
}

function getOptionalString(value: unknown, maxLength: number) {
  if (value === undefined || value === null) {
    return undefined
  }

  return getString(value, maxLength) ?? undefined
}

export async function POST(request: Request) {
  const feedbackEnabled = await compareResponseFeedback()

  if (!feedbackEnabled) {
    return Response.json({ error: 'Feedback is not enabled' }, { status: 404 })
  }

  const session = await requireChatSession(request)

  if (!session) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  let body: Record<string, unknown>

  try {
    const value = await request.json()

    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return Response.json({ error: 'Invalid feedback payload' }, { status: 400 })
    }

    body = value as Record<string, unknown>
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json({ error: 'Malformed JSON payload' }, { status: 400 })
    }

    throw error
  }

  const rating = body.rating
  const question = getString(body.question, maxQuestionLength)
  const answer = getString(body.answer, maxAnswerLength)
  const messageId = getOptionalString(body.messageId, 200)
  const comment = getOptionalString(body.comment, maxCommentLength)

  if (!isFeedbackRating(rating) || !question || !answer) {
    return Response.json({ error: 'Invalid feedback payload' }, { status: 400 })
  }

  const userId = Number(session.user.id)

  if (!Number.isInteger(userId)) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  const payload = await getPayload({ config })

  await payload.create({
    collection: 'response-feedback',
    data: {
      answer,
      comment,
      messageId,
      question,
      rating,
      user: userId,
    },
  })

  return Response.json({ ok: true })
}
