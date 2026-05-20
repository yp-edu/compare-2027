import { getPayload } from 'payload'

import { requireChatSession } from '@/features/ai/server'
import config from '@/payload.config'

const maxTitleLength = 180
const maxPublisherLength = 120

const sourceTypes = [
  'official_program',
  'speech',
  'interview',
  'press_release',
  'candidacy_declaration',
  'social_post',
  'vote',
  'article',
  'report',
  'other',
] as const
const sourcePlatforms = [
  'party_site',
  'x',
  'assemblee',
  'datan',
  'press',
  'institution',
  'other',
] as const
type SourceType = (typeof sourceTypes)[number]
type SourcePlatform = (typeof sourcePlatforms)[number]
const sourceTypeSet = new Set<string>(sourceTypes)
const sourcePlatformSet = new Set<string>(sourcePlatforms)

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

function getUrl(value: unknown) {
  const text = getString(value, 2048)

  if (!text) {
    return null
  }

  try {
    const url = new URL(text)

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null
    }

    return url.toString()
  } catch {
    return null
  }
}

function getCandidateId(value: unknown) {
  const id = Number(value)

  return Number.isInteger(id) && id > 0 ? id : null
}

function getSourceType(value: unknown): SourceType {
  return typeof value === 'string' && sourceTypeSet.has(value) ? (value as SourceType) : 'other'
}

function getSourcePlatform(value: unknown): SourcePlatform {
  return typeof value === 'string' && sourcePlatformSet.has(value)
    ? (value as SourcePlatform)
    : 'other'
}

export async function POST(request: Request) {
  const session = await requireChatSession(request)

  if (!session) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  let body: Record<string, unknown>

  try {
    const value = await request.json()

    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return Response.json({ error: 'Invalid source submission payload' }, { status: 400 })
    }

    body = value as Record<string, unknown>
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json({ error: 'Malformed JSON payload' }, { status: 400 })
    }

    throw error
  }

  const candidateId = getCandidateId(body.candidateId)
  const url = getUrl(body.url)

  if (!candidateId || !url) {
    return Response.json(
      { error: 'A candidate and a valid source URL are required' },
      { status: 400 },
    )
  }

  const payload = await getPayload({ config })
  const candidate = await payload.findByID({
    collection: 'candidates',
    depth: 0,
    disableErrors: true,
    id: candidateId,
  })

  if (!candidate) {
    return Response.json({ error: 'Candidate not found' }, { status: 404 })
  }

  const parsedUrl = new URL(url)
  const userId = Number(session.user.id)
  const source = await payload.create({
    collection: 'sources',
    data: {
      _status: 'draft',
      platform: getSourcePlatform(body.platform),
      processingStatus: 'queued',
      publisher: getOptionalString(body.publisher, maxPublisherLength),
      relatedCandidates: [candidateId],
      submissionStatus: 'submitted',
      submittedBy: userId,
      title:
        getOptionalString(body.title, maxTitleLength) || `Source proposée: ${parsedUrl.hostname}`,
      type: getSourceType(body.type),
      url,
      verificationStatus: 'pending',
    },
    draft: true,
  })

  return Response.json({ id: source.id, ok: true })
}
