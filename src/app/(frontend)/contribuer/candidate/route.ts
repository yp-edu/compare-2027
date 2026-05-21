import { randomUUID } from 'node:crypto'

import { getPayload } from 'payload'

import { requireChatSession } from '@/features/ai/server'
import config from '@/payload.config'

const maxCandidateNameLength = 160
const maxDetailsLength = 1000

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
  if (value === undefined || value === null || value === '') {
    return null
  }

  const id = Number(value)

  return Number.isInteger(id) && id > 0 ? id : null
}

function inferPlatform(url: string) {
  const hostname = new URL(url).hostname.replace(/^www\./, '')

  if (hostname === 'x.com' || hostname === 'twitter.com') {
    return 'x'
  }

  if (hostname.endsWith('datan.fr')) {
    return 'datan'
  }

  return 'other'
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
      return Response.json({ error: 'Invalid candidate submission payload' }, { status: 400 })
    }

    body = value as Record<string, unknown>
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json({ error: 'Malformed JSON payload' }, { status: 400 })
    }

    throw error
  }

  const candidateName = getString(body.candidateName, maxCandidateNameLength)
  const declarationUrl = getUrl(body.declarationUrl)
  const matchedCandidate = getCandidateId(body.matchedCandidate)

  if (!candidateName || !declarationUrl) {
    return Response.json(
      { error: 'A candidate name and a valid declaration source URL are required' },
      { status: 400 },
    )
  }

  const payload = await getPayload({ config })

  if (matchedCandidate) {
    const candidate = await payload.findByID({
      collection: 'candidates',
      depth: 0,
      disableErrors: true,
      id: matchedCandidate,
    })

    if (!candidate) {
      return Response.json({ error: 'Candidate not found' }, { status: 404 })
    }
  }

  const userId = Number(session.user.id)
  const source = await payload.create({
    collection: 'sources',
    data: {
      _status: 'draft',
      platform: inferPlatform(declarationUrl),
      processingStatus: 'queued',
      references: [
        {
          isPrimary: true,
          kind: 'url',
          label: 'Déclaration proposée',
          url: declarationUrl,
        },
      ],
      relatedCandidates: matchedCandidate ? [matchedCandidate] : undefined,
      slug: `submitted-candidate-declaration-${randomUUID()}`,
      sourceRole: 'candidacy_declaration',
      submissionStatus: 'submitted',
      submittedBy: userId,
      title: `Déclaration de candidature proposée: ${candidateName}`,
      type: 'candidacy_declaration',
      verificationStatus: 'pending',
    },
    draft: true,
  })

  const submission = await payload.create({
    collection: 'candidate-submissions',
    data: {
      candidateDetails: getOptionalString(body.candidateDetails, maxDetailsLength),
      candidateName,
      declarationSource: source.id,
      matchedCandidate: matchedCandidate || undefined,
      status: 'pending',
      submittedBy: userId,
    },
  })

  return Response.json({ id: submission.id, ok: true, sourceId: source.id })
}
