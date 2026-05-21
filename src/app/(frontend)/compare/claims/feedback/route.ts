import { randomUUID } from 'node:crypto'

import { getPayload } from 'payload'

import { requireChatSession } from '@/features/ai/server'
import { inferSourcePlatformFromUrl } from '@/features/sources/platform'
import { getSafeSourceUrl } from '@/features/sources/server/source-url'
import config from '@/payload.config'

const maxQuestionLength = 2000
const maxAnswerLength = 12000
const maxCommentLength = 1000

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
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  return getString(value, maxLength) ?? undefined
}

function getClaimId(value: unknown) {
  const id = Number(value)

  return Number.isInteger(id) && id > 0 ? id : null
}

function getUserId(value: unknown) {
  const id = Number(value)

  return Number.isInteger(id) && id > 0 ? id : null
}

function getCandidateActorId(actor: unknown) {
  if (!actor || typeof actor !== 'object') {
    return null
  }

  const relation = actor as { relationTo?: unknown; value?: unknown }

  if (relation.relationTo !== 'candidates') {
    return null
  }

  if (typeof relation.value === 'string' || typeof relation.value === 'number') {
    const id = Number(relation.value)

    return Number.isInteger(id) && id > 0 ? id : null
  }

  if (relation.value && typeof relation.value === 'object' && 'id' in relation.value) {
    const id = (relation.value as { id?: unknown }).id

    const numericId = Number(id)

    return Number.isInteger(numericId) && numericId > 0 ? numericId : null
  }

  return null
}

export async function POST(request: Request) {
  const session = await requireChatSession(request)

  if (!session) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  const userId = getUserId(session.user.id)

  if (!userId) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  let body: Record<string, unknown>

  try {
    const value = await request.json()

    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return Response.json({ error: 'Invalid claim feedback payload' }, { status: 400 })
    }

    body = value as Record<string, unknown>
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json({ error: 'Malformed JSON payload' }, { status: 400 })
    }

    throw error
  }

  const claimId = getClaimId(body.claimId)
  const invalidatingSourceUrl = await getSafeSourceUrl(body.sourceUrl)

  if (!claimId || !invalidatingSourceUrl) {
    return Response.json(
      { error: 'A claim and a valid invalidating source URL are required' },
      { status: 400 },
    )
  }

  const payload = await getPayload({ config })
  const claim = await payload.findByID({
    collection: 'claims',
    depth: 0,
    disableErrors: true,
    id: claimId,
  })

  if (!claim) {
    return Response.json({ error: 'Claim not found' }, { status: 404 })
  }

  const actorCandidateId = getCandidateActorId(claim.actor)
  const source = await payload.create({
    collection: 'sources',
    data: {
      _status: 'draft',
      platform: inferSourcePlatformFromUrl(invalidatingSourceUrl),
      processingStatus: 'queued',
      references: [
        {
          isPrimary: true,
          kind: 'url',
          label: 'Source de mise à jour proposée',
          url: invalidatingSourceUrl,
        },
      ],
      relatedCandidates: actorCandidateId ? [actorCandidateId] : undefined,
      slug: `submitted-claim-feedback-source-${randomUUID()}`,
      sourceRole: 'other',
      submissionStatus: 'submitted',
      submittedBy: userId,
      title: `Source de mise à jour proposée pour claim ${claim.id}`,
      type: 'other',
      verificationStatus: 'pending',
    },
    draft: true,
  })

  await payload.create({
    collection: 'claim-feedback',
    data: {
      answer: getOptionalString(body.answer, maxAnswerLength),
      claim: claim.id,
      comment: getOptionalString(body.comment, maxCommentLength),
      invalidatingSource: source.id,
      invalidatingSourceUrl,
      messageId: getOptionalString(body.messageId, 200),
      question: getOptionalString(body.question, maxQuestionLength),
      status: 'pending',
      submittedBy: userId,
    },
  })

  return Response.json({ ok: true, sourceId: source.id })
}
