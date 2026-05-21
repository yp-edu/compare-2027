import { createHash } from 'crypto'

import { createAzure } from '@ai-sdk/azure'
import { generateText } from 'ai'
import type { CollectionAfterChangeHook, PayloadRequest } from 'payload'

import { fetchSourceUrl } from './source-url'

export { validateOutboundFetchUrl } from './source-url'

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
  slug?: string | null
  type?: string | null
  platform?: string | null
  publisher?: string | null
  publishedAt?: string | null
  processingStatus?: string | null
  rawMetadata?: unknown
  references?: SourceReference[] | null
  relatedCandidates?: RelationValue[] | null
}

type SourceReference = {
  id?: string | null
  canonicalUrl?: string | null
  externalId?: string | null
  isPrimary?: boolean | null
  kind?: string | null
  label?: string | null
  url?: string | null
}

type UrlReference = SourceReference & {
  url: string
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
  charEnd?: number | null
  charStart?: number | null
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

type CreatedChunk = {
  charEnd: number
  charStart: number
  id: PayloadId
  text: string
}

type SourceProcessingResult = {
  contentHash: string
  createdClaimsCount: number
  discoveredSourceIds: PayloadId[]
  fetchedAt: string
  modelName?: string
  results: Array<{
    canonicalUrl: string
    contentHash: string
    createdClaimsCount: number
    discoveredUrls: string[]
    extraction: SourceExtraction
    fetchedAt: string
    modelName?: string
    referenceUrl: string
  }>
}

const maxContentLength = 120_000
const maxResponseSizeBytes = 1_000_000
const maxPromptContentLength = 30_000
const maxChunkLength = 4_000
const maxChunks = 20
const maxDiscoveredLinks = 50
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
const sourceTypes = new Set([
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
])
const sourcePlatforms = new Set([
  'party_site',
  'x',
  'assemblee',
  'datan',
  'press',
  'institution',
  'other',
])
const inputReferenceKinds = new Set(['url', 'file', 'archive', 'institution_id', 'manual', 'other'])
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

function getNonNegativeInteger(value: unknown) {
  const number = Number(value)

  return Number.isInteger(number) && number >= 0 ? number : null
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

function getExtractableRawContent(rawContent: string) {
  const main = rawContent.match(/<main\b[\s\S]*?<\/main>/i)?.[0]

  return main || rawContent
}

function getContentHash(content: string) {
  return createHash('sha256').update(content).digest('hex')
}

async function readResponseTextWithLimit(response: Response) {
  const contentLength = response.headers.get('content-length')
  const contentLengthBytes = contentLength ? Number(contentLength) : null

  if (
    contentLengthBytes !== null &&
    Number.isFinite(contentLengthBytes) &&
    contentLengthBytes > maxResponseSizeBytes
  ) {
    await response.body?.cancel()
    throw new Error(`Source fetch response exceeds ${maxResponseSizeBytes} bytes.`)
  }

  if (!response.body) {
    return ''
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  const chunks: string[] = []
  let receivedBytes = 0

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        break
      }

      if (!value) {
        continue
      }

      receivedBytes += value.byteLength

      if (receivedBytes > maxResponseSizeBytes) {
        await reader.cancel()
        throw new Error(`Source fetch response exceeds ${maxResponseSizeBytes} bytes.`)
      }

      chunks.push(decoder.decode(value, { stream: true }))
    }

    chunks.push(decoder.decode())

    return chunks.join('')
  } finally {
    reader.releaseLock()
  }
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
    ? (rawMetadata as Record<string, unknown>)
    : {}
}

function getCrawlConfig(rawMetadata: unknown) {
  const metadata = getRawMetadata(rawMetadata)
  const crawl = getRawMetadata(metadata.crawl)
  const allowedPathPrefixes = Array.isArray(crawl.allowedPathPrefixes)
    ? crawl.allowedPathPrefixes.filter(
        (value: unknown): value is string => typeof value === 'string',
      )
    : []
  const depth = typeof crawl.depth === 'number' && crawl.depth >= 0 ? crawl.depth : 0
  const maxDepth = typeof crawl.maxDepth === 'number' && crawl.maxDepth >= 0 ? crawl.maxDepth : 0

  return {
    allowedPathPrefixes,
    depth,
    enabled: crawl.enabled === true,
    maxDepth,
  }
}

function getSourceTypeForCreate(value: string | null | undefined) {
  return sourceTypes.has(value || '')
    ? (value as
        | 'official_program'
        | 'speech'
        | 'interview'
        | 'press_release'
        | 'candidacy_declaration'
        | 'social_post'
        | 'vote'
        | 'article'
        | 'report'
        | 'other')
    : 'other'
}

function getSourcePlatformForCreate(value: string | null | undefined) {
  return sourcePlatforms.has(value || '')
    ? (value as 'party_site' | 'x' | 'assemblee' | 'datan' | 'press' | 'institution' | 'other')
    : 'other'
}

function getInputReferenceKind(value: string | null | undefined) {
  return inputReferenceKinds.has(value || '')
    ? (value as 'url' | 'file' | 'archive' | 'institution_id' | 'manual' | 'other')
    : 'url'
}

function getSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}

function getSlugFromUrl(url: string) {
  const parsedUrl = new URL(url)

  return getSlug(parsedUrl.pathname || parsedUrl.hostname) || getSlug(parsedUrl.hostname)
}

function discoverCrawlUrls(args: { baseUrl: string; rawContent: string; rawMetadata: unknown }) {
  const { baseUrl, rawContent, rawMetadata } = args
  const config = getCrawlConfig(rawMetadata)

  if (!config.enabled || config.depth >= config.maxDepth) {
    return []
  }

  const base = new URL(baseUrl)
  const urls = new Set<string>()
  const hrefPattern = /href=["']([^"'#]+)(?:#[^"']*)?["']/gi
  let match: RegExpExecArray | null

  while ((match = hrefPattern.exec(rawContent)) && urls.size < maxDiscoveredLinks) {
    try {
      const url = new URL(match[1], base)

      if (url.origin !== base.origin) {
        continue
      }

      const allowed =
        config.allowedPathPrefixes.length === 0 ||
        config.allowedPathPrefixes.some((prefix) => url.pathname.startsWith(prefix))

      if (!allowed) {
        continue
      }

      url.hash = ''
      urls.add(url.toString())
    } catch {
      // Ignore malformed links from source pages.
    }
  }

  urls.delete(base.toString())

  return Array.from(urls)
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
  referenceUrl: string
  source: SourceForProcessing
  topics: TopicContext[]
}) {
  const { candidates, content, referenceUrl, source, topics } = args
  const { model, modelName } = getAzureOpenAIModel()

  const candidateLines = candidates.map(
    (candidate) => `- ${candidate.id}: ${candidate.displayName}`,
  )
  const topicLines = topics.map((topic) => `- ${topic.title}`)
  const result = await generateText({
    maxOutputTokens: 1800,
    model,
    prompt: `Source: ${source.title || referenceUrl}
URL: ${referenceUrl}
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
       "charStart": 0,
       "charEnd": 120,
       "confidence": 0.0,
       "positionDate": "date ISO si disponible"
     }
  ]
}
charStart et charEnd sont les positions approximatives dans le texte source fourni. N'invente rien. Si la source ne contient pas d'affirmation rattachable à un candidat et à un thème autorisés, retourne claims: [].`,
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

  return Promise.all(
    chunks.map(async (chunk, index): Promise<CreatedChunk> => {
      const createdChunk = await req.payload.create({
        collection: 'document-chunks',
        context: { skipSourceProcessing: true },
        data: {
          ...chunk,
          _status: 'published',
          chunkIndex: index,
          document: documentId,
          embeddingStatus: 'pending',
          source: source.id,
          snapshot: snapshotId,
          title: `${source.title || 'Source'} - chunk ${index + 1}`,
        },
        req,
      })

      return {
        ...chunk,
        id: createdChunk.id,
      }
    }),
  )
}

async function createClaims(args: {
  chunk?: CreatedChunk
  documentId: PayloadId
  extraction: SourceExtraction
  candidates: CandidateContext[]
  referenceUrl: string
  req: PayloadRequest
  snapshotId: PayloadId
  source: SourceForProcessing
  topics: TopicContext[]
}) {
  const {
    candidates,
    chunk,
    documentId,
    extraction,
    referenceUrl,
    req,
    snapshotId,
    source,
    topics,
  } = args
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
    const relativeCharStart = getNonNegativeInteger(claim.charStart) ?? undefined
    const relativeCharEnd = getNonNegativeInteger(claim.charEnd) ?? undefined
    const charStart =
      typeof relativeCharStart === 'number' && chunk
        ? chunk.charStart + relativeCharStart
        : undefined
    const charEnd =
      typeof relativeCharEnd === 'number' && chunk ? chunk.charStart + relativeCharEnd : undefined
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
        charEnd,
        charStart,
        chunk: chunk?.id,
        confidence: getConfidence(claim.confidence),
        document: documentId,
        quote,
        reviewStatus: 'pending',
        source: source.id,
        sourceUrl: referenceUrl,
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

async function createDiscoveredSources(args: {
  discoveredUrls: string[]
  req: PayloadRequest
  source: SourceForProcessing
}) {
  const { discoveredUrls, req, source } = args
  const crawlConfig = getCrawlConfig(source.rawMetadata)
  const createdSourceIds = []

  for (const url of discoveredUrls) {
    const slug = `${source.slug || `source-${source.id}`}-${getSlugFromUrl(url)}`
    const existingSource = await req.payload.find({
      collection: 'sources',
      depth: 0,
      limit: 1,
      req,
      where: {
        slug: {
          equals: slug,
        },
      },
    })

    if (existingSource.docs[0]) {
      continue
    }

    const createdSource = await req.payload.create({
      collection: 'sources',
      data: {
        _status: 'draft',
        fetchStatus: 'not_fetched',
        language: 'fr',
        parentSource: source.id,
        platform: getSourcePlatformForCreate(source.platform),
        processingStatus: 'queued',
        publisher: source.publisher || undefined,
        rawMetadata: {
          crawl: {
            ...crawlConfig,
            depth: crawlConfig.depth + 1,
            enabled: crawlConfig.depth + 1 < crawlConfig.maxDepth,
          },
          discoveredFrom: source.id,
        },
        references: [
          {
            isPrimary: true,
            kind: 'url',
            url,
          },
        ],
        relatedCandidates: getRelationIds(source.relatedCandidates),
        slug,
        sourceRole: 'program_section',
        submissionStatus: 'internal',
        title: `${source.title || 'Source'} - ${new URL(url).pathname}`,
        type: getSourceTypeForCreate(source.type),
        verificationStatus: 'pending',
      },
      draft: true,
      req,
    })

    createdSourceIds.push(createdSource.id)
  }

  return createdSourceIds
}

function getUrlReferences(source: SourceForProcessing) {
  const references = (source.references || [])
    .filter((reference): reference is UrlReference =>
      Boolean(reference && reference.kind === 'url' && reference.url),
    )
    .sort((a, b) => Number(Boolean(b.isPrimary)) - Number(Boolean(a.isPrimary)))

  return references
}

async function processUrlReference(args: {
  reference: UrlReference
  req: PayloadRequest
  source: SourceForProcessing
}) {
  const { reference, req, source } = args
  const { response, url: fetchedUrl } = await fetchSourceUrl(reference.url)
  const rawContent = await readResponseTextWithLimit(response)
  const contentType = response.headers.get('content-type')
  const extractableRawContent = getExtractableRawContent(rawContent)
  const content = cleanFetchedText(extractableRawContent)
  const contentHash = getContentHash(content || rawContent)
  const fetchedAt = new Date().toISOString()
  const discoveredUrls = discoverCrawlUrls({
    baseUrl: fetchedUrl,
    rawContent: extractableRawContent,
    rawMetadata: source.rawMetadata,
  })

  const snapshot = await req.payload.create({
    collection: 'source-snapshots',
    context: { skipSourceProcessing: true },
    data: {
      canonicalUrl: fetchedUrl,
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
      title: `${source.title || reference.url} - snapshot`,
      url: reference.url,
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
      _status: 'published',
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
      title: `${source.title || reference.url} - parsed document`,
      wordCount: content.split(/\s+/).filter(Boolean).length,
    },
    req,
  })

  const chunks = await createChunks({
    content,
    documentId: document.id,
    req,
    snapshotId: snapshot.id,
    source,
  })
  const candidateIds = getRelationIds(source.relatedCandidates)
  const candidates = await getCandidates(req, candidateIds)
  const topics = await getTopics(req)
  let createdClaimsCount = 0
  let modelName: string | undefined
  const chunkExtractions: Array<SourceExtraction & { chunkId: PayloadId; chunkIndex: number }> = []

  if (candidates.length > 0 && topics.length > 0) {
    for (const [chunkIndex, chunk] of chunks.entries()) {
      const result = await extractClaimsWithLLM({
        candidates,
        content: chunk.text,
        referenceUrl: fetchedUrl,
        source,
        topics,
      })

      modelName = result.modelName
      chunkExtractions.push({
        ...result.extraction,
        chunkId: chunk.id,
        chunkIndex,
      })
      createdClaimsCount += await createClaims({
        candidates,
        chunk,
        documentId: document.id,
        extraction: result.extraction,
        referenceUrl: fetchedUrl,
        req,
        snapshotId: snapshot.id,
        source,
        topics,
      })
    }
  }

  const extraction: SourceExtraction = {
    claims: chunkExtractions.flatMap((chunkExtraction) => chunkExtraction.claims || []),
    summary: chunkExtractions
      .map((chunkExtraction) => chunkExtraction.summary)
      .filter(Boolean)
      .join('\n')
      .slice(0, 4000),
  }

  await req.payload.update({
    collection: 'source-documents',
    context: { skipSourceProcessing: true },
    data: {
      metadata: {
        contentHash,
        createdClaimsCount,
        extraction,
        chunkExtractions,
        llmModel: modelName,
        sourceProcessing: true,
      },
      summary: extraction.summary || undefined,
    },
    id: document.id,
    req,
  })

  return {
    canonicalUrl: fetchedUrl,
    contentHash,
    createdClaimsCount,
    extraction,
    fetchedAt,
    modelName,
    referenceUrl: reference.url,
    discoveredUrls,
  }
}

async function processSourceReferences(
  source: SourceForProcessing,
  req: PayloadRequest,
): Promise<SourceProcessingResult> {
  const references = getUrlReferences(source)

  if (references.length === 0) {
    throw new Error('This source has no URL reference to process.')
  }

  const results = []

  for (const reference of references) {
    results.push(await processUrlReference({ reference, req, source }))
  }

  const discoveredSourceIds = []

  for (const result of results) {
    if (result.discoveredUrls.length > 0) {
      discoveredSourceIds.push(
        ...(await createDiscoveredSources({
          discoveredUrls: result.discoveredUrls,
          req,
          source,
        })),
      )
    }
  }

  const contentHash = getContentHash(results.map((result) => result.contentHash).join('\n'))
  const lastResult = results[results.length - 1]

  return {
    contentHash,
    createdClaimsCount: results.reduce((sum, result) => sum + result.createdClaimsCount, 0),
    discoveredSourceIds,
    fetchedAt: lastResult?.fetchedAt || new Date().toISOString(),
    modelName: lastResult?.modelName,
    results,
  }
}

export async function startSourceIngestion(args: {
  reason?: string | null
  req: PayloadRequest
  sourceID: PayloadId
}) {
  const { reason, req, sourceID } = args
  const source = (await req.payload.findByID({
    collection: 'sources',
    depth: 0,
    id: sourceID,
    req,
  })) as SourceForProcessing

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

  const ingestionJob = await req.payload.create({
    collection: 'ingestion-jobs',
    data: {
      attempts: 1,
      inputReferences: (source.references || []).map((reference) => ({
        externalId: reference.externalId || undefined,
        kind: getInputReferenceKind(reference.kind),
        url: reference.url || reference.canonicalUrl || undefined,
      })),
      jobType: 'url',
      lastRunAt: new Date().toISOString(),
      metadata: {
        reason: reason || 'sourceCreated',
      },
      priority: 0,
      source: source.id,
      status: 'running',
      title: `Ingest ${source.title || `source ${source.id}`}`,
    },
    req,
  })

  return {
    ingestionJobID: ingestionJob.id,
    sourceID: source.id,
  }
}

export async function runSourceIngestion(args: { req: PayloadRequest; sourceID: PayloadId }) {
  const { req, sourceID } = args
  const source = (await req.payload.findByID({
    collection: 'sources',
    depth: 0,
    id: sourceID,
    req,
  })) as SourceForProcessing

  return processSourceReferences(source, req)
}

export async function completeSourceIngestion(args: {
  ingestionJobID?: PayloadId | null
  req: PayloadRequest
  result: SourceProcessingResult
  sourceID: PayloadId
}) {
  const { ingestionJobID, req, result, sourceID } = args
  const source = (await req.payload.findByID({
    collection: 'sources',
    depth: 0,
    id: sourceID,
    req,
  })) as SourceForProcessing
  const processedAt = new Date().toISOString()

  await req.payload.update({
    collection: 'sources',
    context: { skipSourceProcessing: true },
    data: {
      contentHash: result.contentHash,
      fetchStatus: 'fetched',
      lastFetchedAt: result.fetchedAt,
      llmModel: result.modelName,
      processedAt,
      processingError: null,
      processingStatus: 'completed',
      rawMetadata: {
        ...getRawMetadata(source.rawMetadata),
        sourceProcessing: {
          createdClaimsCount: result.createdClaimsCount,
          discoveredSourceIds: result.discoveredSourceIds,
          references: result.results,
          processedAt,
        },
      },
      retrievedAt: result.fetchedAt,
    },
    id: source.id,
    req,
  })

  if (ingestionJobID) {
    await req.payload.update({
      collection: 'ingestion-jobs',
      data: {
        completedAt: processedAt,
        errorMessage: null,
        metadata: {
          contentHash: result.contentHash,
          createdClaimsCount: result.createdClaimsCount,
          discoveredSourceIds: result.discoveredSourceIds,
          llmModel: result.modelName,
          references: result.results,
        },
        status: 'completed',
      },
      id: ingestionJobID,
      req,
    })
  }
}

export async function failSourceIngestion(args: {
  error: unknown
  ingestionJobID?: PayloadId | null
  req: PayloadRequest
  sourceID?: PayloadId | null
}) {
  const { error, ingestionJobID, req, sourceID } = args
  const errorMessage = error instanceof Error ? error.message : 'Unknown source processing error.'
  const processedAt = new Date().toISOString()

  if (sourceID) {
    await req.payload.update({
      collection: 'sources',
      context: { skipSourceProcessing: true },
      data: {
        processedAt,
        processingError: errorMessage,
        processingStatus: 'failed',
      },
      id: sourceID,
      req,
    })
  }

  if (ingestionJobID) {
    await req.payload.update({
      collection: 'ingestion-jobs',
      data: {
        completedAt: processedAt,
        errorMessage,
        status: 'failed',
      },
      id: ingestionJobID,
      req,
    })
  }
}

export const queueSourceIngestionAfterChange: CollectionAfterChangeHook = async ({
  context,
  doc,
  operation,
  previousDoc,
  req,
}) => {
  const source = doc as SourceForProcessing
  const previousSource = previousDoc as SourceForProcessing | undefined
  const shouldSkip = Boolean((context as Record<string, unknown> | undefined)?.skipSourceProcessing)

  if (
    shouldSkip ||
    source.processingStatus !== 'queued' ||
    (operation === 'update' && previousSource?.processingStatus === 'queued')
  ) {
    return doc
  }

  await req.payload.jobs.queue({
    input: {
      reason: operation === 'create' ? 'sourceCreated' : 'sourceQueued',
      sourceID: source.id,
    } as never,
    queue: 'ingestion',
    req,
    workflow: 'ingestSource' as never,
  })

  return doc
}
