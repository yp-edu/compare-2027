import { createHash } from 'crypto'

import { createAzure } from '@ai-sdk/azure'
import { generateText } from 'ai'
import type { CollectionAfterChangeHook, PayloadRequest } from 'payload'

type PayloadId = number

type RelationValue =
  | PayloadId
  | {
      id?: PayloadId | string | null
      value?: PayloadId | string | { id?: PayloadId | string | null } | null
    }

type SourceForProcessing = {
  id: PayloadId
  title?: string | null
  type?: string | null
  platform?: string | null
  url?: string | null
  canonicalUrl?: string | null
  publishedAt?: string | null
  processingStatus?: string | null
  rawMetadata?: unknown
  relatedCandidates?: RelationValue[] | null
}

type CandidateContext = {
  id: PayloadId
  displayName: string
}

type TopicContext = {
  id: PayloadId
  title: string
  lookup: string
}

type ExtractedClaim = {
  candidateId?: PayloadId | null
  title?: string | null
  claimText?: string | null
  claimType?: string | null
  stance?: string | null
  topicTitles?: string[] | null
  quote?: string | null
  confidence?: number | null
  positionDate?: string | null
}

type SourceExtraction = {
  summary?: string | null
  claims?: ExtractedClaim[] | null
}

const maxContentLength = 120_000
const maxPromptContentLength = 30_000
const maxChunkLength = 4_000
const maxChunks = 20
const claimTypes = new Set([
  'program',
  'public_position',
  'vote',
  'promise',
  'factual_record',
  'biography',
  'criticism',
  'other',
])
const stances = new Set([
  'proposes',
  'supports',
  'opposes',
  'mixed',
  'vote_for',
  'vote_against',
  'abstention',
  'unclear',
  'not_applicable',
])
type ClaimType =
  | 'program'
  | 'public_position'
  | 'vote'
  | 'promise'
  | 'factual_record'
  | 'biography'
  | 'criticism'
  | 'other'
type Stance =
  | 'proposes'
  | 'supports'
  | 'opposes'
  | 'mixed'
  | 'vote_for'
  | 'vote_against'
  | 'abstention'
  | 'unclear'
  | 'not_applicable'

function getNumericId(value: unknown): PayloadId | null {
  const id = Number(value)

  return Number.isInteger(id) && id > 0 ? id : null
}

function getRelationId(value: RelationValue | null | undefined): PayloadId | null {
  if (typeof value === 'string' || typeof value === 'number') {
    return getNumericId(value)
  }

  if (!value || typeof value !== 'object') {
    return null
  }

  if (typeof value.id === 'string' || typeof value.id === 'number') {
    return getNumericId(value.id)
  }

  const nestedValue = value.value

  if (typeof nestedValue === 'string' || typeof nestedValue === 'number') {
    return getNumericId(nestedValue)
  }

  if (nestedValue && typeof nestedValue === 'object') {
    return typeof nestedValue.id === 'string' || typeof nestedValue.id === 'number'
      ? getNumericId(nestedValue.id)
      : null
  }

  return null
}

function getRelationIds(values: RelationValue[] | null | undefined) {
  return Array.from(new Set((values || []).map(getRelationId).filter(Boolean))) as PayloadId[]
}

function cleanFetchedText(content: string) {
  return content
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxContentLength)
}

function getContentHash(content: string) {
  return createHash('sha256').update(content).digest('hex')
}

function getLookup(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function parseExtraction(text: string): SourceExtraction {
  const json = text.match(/\{[\s\S]*\}/)?.[0]

  if (!json) {
    throw new Error('The LLM did not return JSON.')
  }

  const value = JSON.parse(json) as SourceExtraction

  if (!value || typeof value !== 'object') {
    throw new Error('The LLM returned an invalid extraction payload.')
  }

  return value
}

function getAzureOpenAIModel() {
  const apiKey = process.env.AZURE_OPENAI_API_KEY
  const resourceName = process.env.AZURE_OPENAI_RESOURCE_NAME
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT

  if (!apiKey || !resourceName || !deployment) {
    throw new Error('Azure OpenAI provider is not configured.')
  }

  const azure = createAzure({ apiKey, resourceName })

  return {
    model: azure(deployment),
    modelName: deployment,
  }
}

function getParser(source: SourceForProcessing, contentType: string | null) {
  if (source.type === 'social_post' || source.platform === 'x') {
    return 'social_post'
  }

  if (source.type === 'vote' || source.platform === 'datan') {
    return 'vote_import'
  }

  if (contentType?.includes('pdf')) {
    return 'pdf'
  }

  if (contentType?.includes('html')) {
    return 'html'
  }

  return 'other'
}

function getRawMetadata(rawMetadata: unknown) {
  return rawMetadata && typeof rawMetadata === 'object' && !Array.isArray(rawMetadata)
    ? rawMetadata
    : {}
}

function getValidDate(value: string | null | undefined) {
  if (!value) {
    return undefined
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

function getConfidence(value: number | null | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return undefined
  }

  return Math.max(0, Math.min(1, value))
}

function getClaimType(value: string | null | undefined) {
  return claimTypes.has(value || '') ? (value as ClaimType) : 'other'
}

function getStance(value: string | null | undefined) {
  return stances.has(value || '') ? (value as Stance) : 'unclear'
}

async function getCandidates(req: PayloadRequest, ids: PayloadId[]) {
  const candidates = await Promise.all(
    ids.map(async (id) => {
      const candidate = await req.payload.findByID({
        collection: 'candidates',
        depth: 0,
        disableErrors: true,
        id,
        req,
      })

      if (!candidate) {
        return null
      }

      return {
        displayName: candidate.displayName,
        id: candidate.id,
      }
    }),
  )

  return candidates.filter(Boolean) as CandidateContext[]
}

async function getTopics(req: PayloadRequest) {
  const topics = await req.payload.find({
    collection: 'topics',
    depth: 0,
    limit: 100,
    req,
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  return topics.docs.map((topic) => ({
    id: topic.id,
    lookup: getLookup(topic.title),
    title: topic.title,
  }))
}

async function extractClaimsWithLLM(args: {
  candidates: CandidateContext[]
  content: string
  source: SourceForProcessing
  topics: TopicContext[]
}) {
  const { candidates, content, source, topics } = args
  const { model, modelName } = getAzureOpenAIModel()

  const candidateLines = candidates.map(
    (candidate) => `- ${candidate.id}: ${candidate.displayName}`,
  )
  const topicLines = topics.map((topic) => `- ${topic.title}`)
  const result = await generateText({
    maxOutputTokens: 1800,
    model,
    prompt: `Source: ${source.title || source.url}
URL: ${source.url}
Type: ${source.type || 'other'}
Platform: ${source.platform || 'other'}

Candidates autorisés:
${candidateLines.join('\n') || '- Aucun candidat lié'}

Thèmes autorisés:
${topicLines.join('\n') || '- Aucun thème disponible'}

Texte source:
${content.slice(0, maxPromptContentLength)}`,
    system: `Tu extrais des affirmations politiques vérifiables depuis une source française.
Retourne uniquement du JSON valide au format:
{
  "summary": "résumé factuel court",
  "claims": [
    {
      "candidateId": "id d'un candidat autorisé",
      "title": "titre court",
      "claimText": "affirmation complète",
      "claimType": "program|public_position|vote|promise|factual_record|biography|criticism|other",
      "stance": "proposes|supports|opposes|mixed|vote_for|vote_against|abstention|unclear|not_applicable",
      "topicTitles": ["titres exacts des thèmes autorisés"],
      "quote": "citation source courte qui justifie l'affirmation",
      "confidence": 0.0,
      "positionDate": "date ISO si disponible"
    }
  ]
}
N'invente rien. Si la source ne contient pas d'affirmation rattachable à un candidat et à un thème autorisés, retourne claims: [].`,
    temperature: 0.1,
  })

  return {
    extraction: parseExtraction(result.text),
    modelName,
  }
}

async function createChunks(args: {
  content: string
  documentId: PayloadId
  req: PayloadRequest
  snapshotId: PayloadId
  source: SourceForProcessing
}) {
  const { content, documentId, req, snapshotId, source } = args
  const chunks = []

  for (
    let index = 0;
    index < content.length && chunks.length < maxChunks;
    index += maxChunkLength
  ) {
    chunks.push({
      charEnd: Math.min(index + maxChunkLength, content.length),
      charStart: index,
      text: content.slice(index, index + maxChunkLength),
    })
  }

  await Promise.all(
    chunks.map((chunk, index) =>
      req.payload.create({
        collection: 'document-chunks',
        context: { skipSourceProcessing: true },
        data: {
          ...chunk,
          _status: 'draft',
          chunkIndex: index,
          document: documentId,
          embeddingStatus: 'pending',
          source: source.id,
          snapshot: snapshotId,
          title: `${source.title || 'Source'} - chunk ${index + 1}`,
        },
        draft: true,
        req,
      }),
    ),
  )
}

async function createClaims(args: {
  documentId: PayloadId
  extraction: SourceExtraction
  candidates: CandidateContext[]
  req: PayloadRequest
  snapshotId: PayloadId
  source: SourceForProcessing
  topics: TopicContext[]
}) {
  const { candidates, documentId, extraction, req, snapshotId, source, topics } = args
  const allowedCandidateIds = new Set(candidates.map((candidate) => String(candidate.id)))
  const topicsByLookup = new Map(topics.map((topic) => [topic.lookup, topic]))
  let createdClaimsCount = 0

  for (const claim of extraction.claims || []) {
    const candidateId = claim.candidateId || (candidates.length === 1 ? candidates[0]?.id : null)

    if (!candidateId || !allowedCandidateIds.has(String(candidateId))) {
      continue
    }

    const matchedTopics = (claim.topicTitles || [])
      .map((title) => topicsByLookup.get(getLookup(title)))
      .filter(Boolean) as TopicContext[]

    if (!claim.claimText || matchedTopics.length === 0) {
      continue
    }

    const title = claim.title || claim.claimText.slice(0, 90)
    const quote = claim.quote || claim.claimText
    const createdClaim = await req.payload.create({
      collection: 'claims',
      context: { skipSourceProcessing: true },
      data: {
        _status: 'draft',
        actor: {
          relationTo: 'candidates',
          value: candidateId,
        },
        claimText: claim.claimText,
        claimType: getClaimType(claim.claimType),
        confidence: getConfidence(claim.confidence),
        evidenceQuote: quote,
        extractionMethod: 'llm',
        positionDate: getValidDate(claim.positionDate) || source.publishedAt || undefined,
        primarySource: source.id,
        rawExtraction: claim,
        reviewStatus: 'pending',
        sourceDocument: documentId,
        sourceSnapshot: snapshotId,
        stance: getStance(claim.stance),
        title,
        topics: matchedTopics.map((topic) => topic.id),
      },
      draft: true,
      req,
    })

    await req.payload.create({
      collection: 'claim-evidence',
      context: { skipSourceProcessing: true },
      data: {
        _status: 'draft',
        claim: createdClaim.id,
        confidence: getConfidence(claim.confidence),
        document: documentId,
        quote,
        reviewStatus: 'pending',
        source: source.id,
        sourceUrl: source.url || undefined,
        snapshot: snapshotId,
        title: `${title} - evidence`,
      },
      draft: true,
      req,
    })

    createdClaimsCount += 1
  }

  return createdClaimsCount
}

async function processUrlSource(source: SourceForProcessing, req: PayloadRequest) {
  if (!source.url) {
    throw new Error('Only URL-based source processing is supported right now.')
  }

  const response = await fetch(source.url, {
    headers: {
      'User-Agent': 'Compare2027Bot/0.1 (+https://compare2027.fr)',
    },
  })
  const rawContent = await response.text()
  const contentType = response.headers.get('content-type')
  const content = cleanFetchedText(rawContent)
  const contentHash = getContentHash(content || rawContent)
  const fetchedAt = new Date().toISOString()

  const snapshot = await req.payload.create({
    collection: 'source-snapshots',
    context: { skipSourceProcessing: true },
    data: {
      canonicalUrl: response.url,
      contentHash,
      contentType,
      fetchedAt,
      fetchStatus: response.ok ? 'fetched' : 'failed',
      httpStatus: response.status,
      metadata: {
        sourceProcessing: true,
      },
      rawContent: rawContent.slice(0, maxContentLength),
      source: source.id,
      title: `${source.title || source.url} - snapshot`,
      url: source.url,
    },
    req,
  })

  if (!response.ok) {
    throw new Error(`Source fetch failed with HTTP ${response.status}.`)
  }

  if (!content) {
    throw new Error('Source fetch returned no extractable text.')
  }

  const document = await req.payload.create({
    collection: 'source-documents',
    context: { skipSourceProcessing: true },
    data: {
      _status: 'draft',
      content,
      language: 'fr',
      metadata: {
        contentHash,
        sourceProcessing: true,
      },
      parsedAt: fetchedAt,
      parser: getParser(source, contentType),
      snapshot: snapshot.id,
      source: source.id,
      title: `${source.title || source.url} - parsed document`,
      wordCount: content.split(/\s+/).filter(Boolean).length,
    },
    draft: true,
    req,
  })

  await createChunks({ content, documentId: document.id, req, snapshotId: snapshot.id, source })

  const candidateIds = getRelationIds(source.relatedCandidates)
  const candidates = await getCandidates(req, candidateIds)
  const topics = await getTopics(req)
  const { extraction, modelName } = await extractClaimsWithLLM({
    candidates,
    content,
    source,
    topics,
  })
  const createdClaimsCount = await createClaims({
    candidates,
    documentId: document.id,
    extraction,
    req,
    snapshotId: snapshot.id,
    source,
    topics,
  })

  await req.payload.update({
    collection: 'source-documents',
    context: { skipSourceProcessing: true },
    data: {
      metadata: {
        contentHash,
        createdClaimsCount,
        extraction,
        llmModel: modelName,
        sourceProcessing: true,
      },
      summary: extraction.summary || undefined,
    },
    id: document.id,
    req,
  })

  return {
    canonicalUrl: response.url,
    contentHash,
    createdClaimsCount,
    extraction,
    fetchedAt,
    modelName,
  }
}

export const processSourceAfterChange: CollectionAfterChangeHook = async ({
  context,
  doc,
  req,
}) => {
  const source = doc as SourceForProcessing
  const shouldSkip = Boolean((context as Record<string, unknown> | undefined)?.skipSourceProcessing)

  if (shouldSkip || source.processingStatus !== 'queued') {
    return doc
  }

  await req.payload.update({
    collection: 'sources',
    context: { skipSourceProcessing: true },
    data: {
      processingError: null,
      processingStatus: 'processing',
    },
    id: source.id,
    req,
  })

  try {
    const result = await processUrlSource(source, req)

    await req.payload.update({
      collection: 'sources',
      context: { skipSourceProcessing: true },
      data: {
        canonicalUrl: result.canonicalUrl,
        contentHash: result.contentHash,
        fetchStatus: 'fetched',
        lastFetchedAt: result.fetchedAt,
        llmModel: result.modelName,
        processedAt: new Date().toISOString(),
        processingError: null,
        processingStatus: 'completed',
        rawMetadata: {
          ...getRawMetadata(source.rawMetadata),
          sourceProcessing: {
            createdClaimsCount: result.createdClaimsCount,
            extraction: result.extraction,
            processedAt: new Date().toISOString(),
          },
        },
        retrievedAt: result.fetchedAt,
      },
      id: source.id,
      req,
    })
  } catch (error) {
    await req.payload.update({
      collection: 'sources',
      context: { skipSourceProcessing: true },
      data: {
        processedAt: new Date().toISOString(),
        processingError:
          error instanceof Error ? error.message : 'Unknown source processing error.',
        processingStatus: 'failed',
      },
      id: source.id,
      req,
    })
  }

  return doc
}
