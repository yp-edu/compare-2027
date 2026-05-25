'use client'

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { useChat } from '@ai-sdk/react'
import {
  ExternalLink,
  LockKeyhole,
  Maximize2,
  Minimize2,
  RotateCcw,
  Search,
  SendHorizontal,
  Sparkles,
  X,
} from 'lucide-react'
import { marked } from 'marked'
import useSWR from 'swr'
import xss, { getDefaultWhiteList } from 'xss'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { OfflineGuard } from '@/components/pwa/offline-guard'
import { useOnlineStatus } from '@/components/pwa/use-online-status'
import { ClaimFreshnessFeedback } from '@/features/feedback/components/claim-freshness-feedback'
import { CompareResponseFeedback } from '@/features/feedback/components/compare-response-feedback'
import { authClient } from '@/lib/auth-client'
import { isLegalConsentCurrent } from '@/lib/legal'
import { cn } from '@/lib/utils'

type ChatErrorPayload = {
  details?: unknown
  error?: unknown
  requestId?: unknown
  stage?: unknown
}

type CompareMCPAccessStatus = {
  error?: string
  requestId?: string
  status: 'checking' | 'connected' | 'disconnected' | 'unknown'
  toolCount?: number
}

const mcpStatusEventType = 'compare-chat:mcp-status'

function parseChatErrorPayload(value: string): ChatErrorPayload | null {
  try {
    const parsed = JSON.parse(value) as unknown

    return parsed && typeof parsed === 'object' && 'error' in parsed ? parsed : null
  } catch {
    return null
  }
}

function getDebugValue(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function getReadableChatErrorMessage(error: Error) {
  const payload = parseChatErrorPayload(error.message)

  if (!payload) {
    return error.message || 'La réponse n’a pas pu être générée.'
  }

  const message = getDebugValue(payload.error) || 'La réponse n’a pas pu être générée.'
  const stage = getDebugValue(payload.stage)
  const requestId = getDebugValue(payload.requestId)
  const suffix = [stage ? `étape: ${stage}` : null, requestId ? `référence: ${requestId}` : null]
    .filter(Boolean)
    .join(' · ')

  return suffix ? `${message} (${suffix})` : message
}

function hasAdminRole(role: unknown) {
  if (Array.isArray(role)) {
    return role.includes('admin')
  }

  return role === 'admin'
}

function logClientChatError(stage: string, error: unknown, context?: Record<string, unknown>) {
  const message = error instanceof Error ? error.message : String(error)
  const payload = parseChatErrorPayload(message)

  console.error('[compare-chat]', {
    ...context,
    details: payload?.details,
    error: payload?.error || message,
    requestId: payload?.requestId,
    stage: payload?.stage || stage,
  })
}

async function debugChatFetch(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init)
  const chatRequestId = response.headers.get('x-chat-request-id') || undefined
  const mcpError = response.headers.get('x-compare-mcp-error') || undefined
  const mcpStatus = response.headers.get('x-compare-mcp-status')
  const mcpToolCount = Number(response.headers.get('x-compare-mcp-tool-count') || 0)
  let didDispatchMcpStatus = false

  if (
    typeof window !== 'undefined' &&
    (mcpStatus === 'connected' || mcpStatus === 'disconnected')
  ) {
    didDispatchMcpStatus = true
    window.dispatchEvent(
      new CustomEvent<CompareMCPAccessStatus>(mcpStatusEventType, {
        detail: {
          ...(chatRequestId ? { requestId: chatRequestId } : {}),
          ...(mcpError ? { error: mcpError } : {}),
          status: mcpStatus,
          toolCount: Number.isFinite(mcpToolCount) ? mcpToolCount : 0,
        },
      }),
    )
  } else if (typeof window !== 'undefined' && response.ok) {
    didDispatchMcpStatus = true
    window.dispatchEvent(
      new CustomEvent<CompareMCPAccessStatus>(mcpStatusEventType, {
        detail: { status: 'unknown' },
      }),
    )
  }

  if (!response.ok) {
    if (typeof window !== 'undefined' && !didDispatchMcpStatus) {
      window.dispatchEvent(
        new CustomEvent<CompareMCPAccessStatus>(mcpStatusEventType, {
          detail: {
            ...(chatRequestId ? { requestId: chatRequestId } : {}),
            status: 'unknown',
          },
        }),
      )
    }

    const body = await response
      .clone()
      .text()
      .catch(() => '')
    const payload = parseChatErrorPayload(body)

    console.error('[compare-chat]', {
      body: payload ? undefined : body,
      details: payload?.details,
      error: payload?.error || response.statusText,
      requestId: payload?.requestId,
      stage: payload?.stage || 'http-response',
      status: response.status,
      url: input instanceof Request ? input.url : input.toString(),
    })
  }

  return response
}

const chatTransport = new DefaultChatTransport({ api: '/compare/chat', fetch: debugChatFetch })

const suggestedQuestions = [
  'Compare les positions sur le pouvoir d’achat.',
  'Quels candidats proposent une réforme de l’école ?',
  'Où sont les divergences sur la transition écologique ?',
]

const toolDisplayNames: Record<string, string> = {
  findCandidates: 'Candidats',
  findClaimEvidence: 'Éléments de preuve',
  findClaims: 'Affirmations',
  findDocumentChunks: 'Extraits de documents',
  findParties: 'Partis et mouvements',
  findPrograms: 'Programmes',
  findProposals: 'Propositions',
  findPublicPositions: 'Positions publiques',
  findSourceDocuments: 'Documents sources',
  findSources: 'Sources',
  findTopics: 'Thématiques',
}

function getMessageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('')
}

function getPreviousUserMessageText(messages: UIMessage[], messageIndex: number) {
  for (let index = messageIndex - 1; index >= 0; index -= 1) {
    const message = messages[index]

    if (message?.role === 'user') {
      return getMessageText(message)
    }
  }

  return ''
}

type CitationKind = 'claim' | 'source'

type CitationTarget = {
  id: string
  kind: CitationKind
  label: string
}

type SourceCitation = {
  actor?: {
    color: null | string
    name: null | string
    type: null | string
  } | null
  id: number
  platform: null | string
  publishedAt: null | string
  slug: null | string
  title: string
  url: null | string
  verificationStatus: null | string
}

type ClaimCitation = {
  actor: {
    color: null | string
    name: null | string
    type: null | string
  }
  claimText: null | string
  evidenceQuote: null | string
  id: number
  positionDate: null | string
  source: null | SourceCitation
  sourceUrl: null | string
  title: null | string
}

type CitationMetadata = {
  claims: Record<string, ClaimCitation>
  sources: Record<string, SourceCitation>
}

type CitationResponse = {
  claims?: ClaimCitation[]
  sources?: SourceCitation[]
}

type RectLike = Pick<DOMRect, 'bottom' | 'left'>

type CitationPopupPosition = {
  left: number
  top: number
}

type MarkdownMessageProps = {
  answer?: string
  canSubmitClaimFeedback?: boolean
  citationMetadata: CitationMetadata
  isUser: boolean
  messageId?: string
  question?: string
  text: string
}

const emptyCitationMetadata: CitationMetadata = { claims: {}, sources: {} }

function getHexColor(color?: null | string) {
  return color && /^#[\dA-F]{6}$/i.test(color) ? color : null
}

export function getSafeSourceUrl(value?: null | string) {
  if (!value) {
    return null
  }

  try {
    const url = new URL(value)

    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

export function getToolDisplayName(name?: null | string) {
  if (!name) {
    return 'Outil MCP'
  }

  return toolDisplayNames[name] || 'Outil MCP'
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function getCitationFromHref(href: string) {
  const match = href.match(/^(claim|source):(\d+)$/)

  if (!match) {
    return null
  }

  return { id: match[2], kind: match[1] as CitationKind }
}

function getCitationIds(text: string) {
  const claims = new Set<string>()
  const sources = new Set<string>()

  for (const match of text.matchAll(/\]\((claim|source):(\d+)\)/g)) {
    if (match[1] === 'claim') {
      claims.add(match[2])
    } else {
      sources.add(match[2])
    }
  }

  return { claims: Array.from(claims), sources: Array.from(sources) }
}

function sortCitationIds(ids: Iterable<string>) {
  return Array.from(ids).sort((left, right) => Number(left) - Number(right))
}

export function getCitationMetadataUrl(texts: string[]) {
  const claims = new Set<string>()
  const sources = new Set<string>()

  for (const text of texts) {
    const citationIds = getCitationIds(text)

    for (const id of citationIds.claims) {
      claims.add(id)
    }

    for (const id of citationIds.sources) {
      sources.add(id)
    }
  }

  if (claims.size === 0 && sources.size === 0) {
    return null
  }

  const params = new URLSearchParams()
  const sortedClaims = sortCitationIds(claims)
  const sortedSources = sortCitationIds(sources)

  if (sortedClaims.length > 0) {
    params.set('claims', sortedClaims.join(','))
  }

  if (sortedSources.length > 0) {
    params.set('sources', sortedSources.join(','))
  }

  return `/compare/citations?${params.toString()}`
}

function getMessageTexts(messages: UIMessage[]) {
  return messages.flatMap((message) =>
    message.parts.filter((part) => part.type === 'text').map((part) => part.text),
  )
}

async function fetchCitationMetadata(url: string): Promise<CitationMetadata> {
  const response = await fetch(url)

  if (!response.ok) {
    return emptyCitationMetadata
  }

  return toCitationMetadata((await response.json()) as CitationResponse)
}

function useCitationMetadata(url: null | string) {
  const { data } = useSWR<CitationMetadata>(url, fetchCitationMetadata, {
    fallbackData: emptyCitationMetadata,
  })

  return data || emptyCitationMetadata
}

function getCitationColor(citation: CitationTarget, metadata: CitationMetadata) {
  const color =
    citation.kind === 'claim'
      ? metadata.claims[citation.id]?.actor.color
      : metadata.sources[citation.id]?.actor?.color

  return getHexColor(color)
}

function getCitationStyle(citation: CitationTarget, metadata: CitationMetadata) {
  const color = getCitationColor(citation, metadata)

  if (!color) {
    return ''
  }

  return ` style="border-color: ${color}66; background-color: ${color}18; color: ${color};"`
}

function renderMarkdown(text: string, citationMetadata: CitationMetadata) {
  const renderer = new marked.Renderer()
  const renderDefaultLink = renderer.link.bind(renderer)

  renderer.link = (token) => {
    const citation = getCitationFromHref(token.href)

    if (!citation) {
      return renderDefaultLink(token)
    }

    const label = token.text.trim() || (citation.kind === 'claim' ? 'Preuve' : 'Source')
    const target: CitationTarget = { ...citation, label }
    const style = getCitationStyle(target, citationMetadata)

    return `<a aria-label="Voir la preuve: ${escapeHtml(label)}" class="inline-flex items-center rounded-full border px-2 py-0.5 align-baseline text-xs font-bold no-underline transition hover:brightness-95" data-citation-id="${citation.id}" data-citation-kind="${citation.kind}" href="#citation-${citation.kind}-${citation.id}"${style}>${escapeHtml(label)}</a>`
  }

  const html = marked.parse(text, { async: false, breaks: true, gfm: true, renderer }) as string
  const whiteList = getDefaultWhiteList()

  whiteList.a = [
    ...(whiteList.a || []),
    'aria-label',
    'class',
    'data-citation-id',
    'data-citation-kind',
    'style',
  ]

  // User and model messages are rendered as HTML, so sanitize after Markdown parsing.
  return xss(html, { whiteList })
}

function toCitationMetadata(response: CitationResponse): CitationMetadata {
  return {
    claims: Object.fromEntries((response.claims || []).map((claim) => [String(claim.id), claim])),
    sources: Object.fromEntries(
      (response.sources || []).map((source) => [String(source.id), source]),
    ),
  }
}

export function getCitationPopupPosition(
  linkRect: RectLike,
  viewportWidth: number,
  scrollX = 0,
  scrollY = 0,
): CitationPopupPosition {
  const gutter = 24
  const popupWidth = Math.min(416, Math.max(0, viewportWidth - gutter * 2))
  const minViewportLeft = gutter
  const maxViewportLeft = Math.max(minViewportLeft, viewportWidth - popupWidth - gutter)
  const viewportLeft = Math.min(Math.max(linkRect.left, minViewportLeft), maxViewportLeft)

  return {
    left: viewportLeft + scrollX,
    top: linkRect.bottom + scrollY + 8,
  }
}

function CitationDetails({
  answer,
  canSubmitClaimFeedback,
  citation,
  metadata,
  messageId,
  onClose,
  position,
  question,
}: {
  answer?: string
  canSubmitClaimFeedback?: boolean
  citation: CitationTarget
  metadata: CitationMetadata
  messageId?: string
  onClose: () => void
  position: CitationPopupPosition
  question?: string
}) {
  const claim = citation.kind === 'claim' ? metadata.claims[citation.id] : undefined
  const source = citation.kind === 'source' ? metadata.sources[citation.id] : claim?.source
  const sourceUrl = getSafeSourceUrl(claim?.sourceUrl) || getSafeSourceUrl(source?.url)
  const color = getCitationColor(citation, metadata)
  const sourceActor = citation.kind === 'source' ? source?.actor : null

  return (
    <div
      className="absolute z-[100] w-[min(26rem,calc(100vw-3rem))] rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-2xl"
      style={{
        left: position.left,
        top: position.top,
        ...(color ? { borderColor: `${color}66` } : {}),
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {citation.kind === 'claim' ? 'Preuve citée' : 'Source citée'}
          </p>
          <p className="mt-1 font-semibold">{citation.label}</p>
        </div>
        <Button aria-label="Fermer" onClick={onClose} size="sm" type="button" variant="ghost">
          <X aria-hidden="true" />
        </Button>
      </div>
      {claim ? (
        <div className="mt-3 space-y-3 text-sm leading-6">
          {claim.actor.name ? (
            <p className="font-medium" style={color ? { color } : undefined}>
              {claim.actor.name}
            </p>
          ) : null}
          <p>{claim.claimText || claim.title || 'Claim publiée.'}</p>
          {claim.evidenceQuote ? (
            <blockquote className="rounded-xl border-l-4 border-primary/30 bg-secondary/50 p-3 text-muted-foreground">
              “{claim.evidenceQuote}”
            </blockquote>
          ) : null}
        </div>
      ) : null}
      {source ? (
        <div className="mt-3 rounded-xl bg-secondary/50 p-3 text-sm leading-6">
          <p className="font-semibold">{source.title}</p>
          {sourceActor?.name ? (
            <p className="font-medium" style={color ? { color } : undefined}>
              {sourceActor.name}
            </p>
          ) : null}
          <p className="text-muted-foreground">
            {[
              source.publishedAt ? new Date(source.publishedAt).toLocaleDateString('fr-FR') : null,
              source.verificationStatus,
            ]
              .filter(Boolean)
              .join(' · ') || 'Métadonnées source limitées'}
          </p>
        </div>
      ) : !claim ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Les détails de cette citation ne sont pas encore disponibles.
        </p>
      ) : null}
      {sourceUrl ? (
        <Button asChild className="mt-3" size="sm" variant="outline">
          <a href={sourceUrl} rel="noreferrer" target="_blank">
            Voir la source
            <ExternalLink aria-hidden="true" />
          </a>
        </Button>
      ) : null}
      {claim && canSubmitClaimFeedback && answer && messageId && question ? (
        <ClaimFreshnessFeedback
          answer={answer}
          claimId={String(claim.id)}
          messageId={messageId}
          question={question}
        />
      ) : null}
    </div>
  )
}

function MarkdownMessage({
  answer,
  canSubmitClaimFeedback,
  citationMetadata,
  isUser,
  messageId,
  question,
  text,
}: MarkdownMessageProps) {
  const [selectedCitation, setSelectedCitation] = useState<CitationTarget | null>(null)
  const [citationPosition, setCitationPosition] = useState<CitationPopupPosition | null>(null)
  const selectedCitationLinkRef = useRef<HTMLAnchorElement | null>(null)
  const html = renderMarkdown(text, citationMetadata)

  function clearSelectedCitation() {
    selectedCitationLinkRef.current = null
    setSelectedCitation(null)
    setCitationPosition(null)
  }

  function updateCitationPosition(link: HTMLAnchorElement) {
    setCitationPosition(
      getCitationPopupPosition(
        link.getBoundingClientRect(),
        window.innerWidth,
        window.scrollX,
        window.scrollY,
      ),
    )
  }

  useEffect(() => {
    if (!selectedCitation) {
      return
    }

    function syncCitationPosition() {
      const link = selectedCitationLinkRef.current

      if (!link?.isConnected) {
        clearSelectedCitation()
        return
      }

      updateCitationPosition(link)
    }

    window.addEventListener('scroll', syncCitationPosition, true)
    window.addEventListener('resize', syncCitationPosition)

    return () => {
      window.removeEventListener('scroll', syncCitationPosition, true)
      window.removeEventListener('resize', syncCitationPosition)
    }
  }, [selectedCitation])

  function handleCitationClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target instanceof Element ? event.target : null
    const link = target?.closest<HTMLAnchorElement>('a[data-citation-kind][data-citation-id]')

    if (!link) {
      return
    }

    const kind = link.dataset.citationKind
    const id = link.dataset.citationId

    if ((kind !== 'claim' && kind !== 'source') || !id) {
      return
    }

    event.preventDefault()
    selectedCitationLinkRef.current = link
    updateCitationPosition(link)

    setSelectedCitation({ id, kind, label: link.textContent?.trim() || 'Citation' })
  }

  const citationPopup =
    selectedCitation && citationPosition && typeof document !== 'undefined'
      ? createPortal(
          <CitationDetails
            answer={answer}
            canSubmitClaimFeedback={canSubmitClaimFeedback}
            citation={selectedCitation}
            metadata={citationMetadata}
            messageId={messageId}
            onClose={clearSelectedCitation}
            position={citationPosition}
            question={question}
          />,
          document.body,
        )
      : null

  return (
    <>
      <div
        className={cn(
          'break-words leading-7',
          '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
          '[&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-4',
          '[&_a[data-citation-kind]]:cursor-pointer [&_a[data-citation-kind]]:underline-offset-0',
          '[&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:pl-4',
          '[&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.92em]',
          '[&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:leading-8',
          '[&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:leading-8',
          '[&_h3]:mb-2 [&_h3]:font-bold',
          '[&_li]:pl-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5',
          '[&_p]:mb-3',
          '[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:p-3 [&_pre]:text-sm [&_pre]:leading-6',
          '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
          '[&_table]:w-full [&_table]:border-collapse [&_table]:text-sm',
          '[&_td]:border-t [&_td]:px-3 [&_td]:py-2 [&_td]:align-top',
          '[&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold',
          '[&_ul]:my-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5',
          isUser
            ? '[&_a]:text-primary-foreground [&_blockquote]:border-primary-foreground/40 [&_blockquote]:text-primary-foreground/90 [&_code]:bg-primary-foreground/15 [&_td]:border-primary-foreground/30 [&_th]:bg-primary-foreground/10 [&_th]:text-primary-foreground'
            : '[&_a]:text-primary [&_blockquote]:border-primary/30 [&_blockquote]:text-muted-foreground [&_code]:bg-secondary [&_code]:text-secondary-foreground [&_td]:border-border/70 [&_th]:bg-secondary [&_th]:text-secondary-foreground',
        )}
        dangerouslySetInnerHTML={{ __html: html }}
        onClick={handleCitationClick}
      />
      {citationPopup}
    </>
  )
}

function getToolPartName(part: UIMessage['parts'][number]) {
  if (part.type === 'dynamic-tool' && 'toolName' in part) {
    return getToolDisplayName(String(part.toolName))
  }

  return part.type.startsWith('tool-')
    ? getToolDisplayName(part.type.replace(/^tool-/, ''))
    : getToolDisplayName()
}

function getToolPartState(part: UIMessage['parts'][number]) {
  return 'state' in part && typeof part.state === 'string' ? part.state : null
}

function isToolStatusPart(part: UIMessage['parts'][number]) {
  return part.type === 'dynamic-tool' || part.type.startsWith('tool-')
}

function ToolStatusPart({ part }: { part: UIMessage['parts'][number] }) {
  const state = getToolPartState(part)
  const label =
    state === 'output-available'
      ? 'Résultats consultés'
      : state === 'output-error'
        ? 'Recherche indisponible'
        : 'Recherche dans le corpus'

  return (
    <div className="mb-3 flex items-center gap-2 rounded-xl border border-border/70 bg-secondary/40 px-3 py-2 text-sm text-muted-foreground">
      <Search className="size-4" aria-hidden="true" />
      <span className="font-medium text-foreground">{label}</span>
      <span className="truncate">{getToolPartName(part)}</span>
    </div>
  )
}

function ReasoningStatusPart({ part }: { part: UIMessage['parts'][number] }) {
  const state = 'state' in part && part.state === 'done' ? 'Analyse terminée' : 'Analyse en cours'

  return (
    <div className="mb-3 rounded-xl border border-border/70 bg-secondary/40 px-3 py-2 text-sm font-medium text-muted-foreground">
      {state}
    </div>
  )
}

function ThinkingIndicator() {
  return (
    <div
      aria-live="polite"
      className="flex max-w-2xl items-center gap-2 rounded-2xl border border-border bg-background/85 p-4 text-sm font-semibold text-muted-foreground"
      role="status"
    >
      <span>Réflexion...</span>
      <span className="flex gap-1" aria-hidden="true">
        <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/70" />
        <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/70 delay-150" />
        <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/70 delay-300" />
      </span>
    </div>
  )
}

function McpStatusBadge({ status }: { status: CompareMCPAccessStatus }) {
  const isConnected = status.status === 'connected'
  const label =
    status.status === 'checking'
      ? 'MCP...'
      : isConnected
        ? `MCP actif (${status.toolCount || 0})`
        : status.status === 'disconnected'
          ? 'MCP absent'
          : 'MCP non testé'
  const titleLines = [
    isConnected
      ? `Dernier appel: le modèle a reçu ${status.toolCount || 0} outils MCP.`
      : status.status === 'disconnected'
        ? "Dernier appel: le modèle n'a pas reçu d'outils MCP."
        : status.status === 'checking'
          ? 'Vérification MCP sur la requête en cours.'
          : 'Envoyez un message pour vérifier si le modèle reçoit les outils MCP.',
    status.requestId ? `Request: ${status.requestId}` : null,
    status.error ? `Erreur MCP: ${status.error}` : null,
  ].filter(Boolean)
  const title = titleLines.join('\n')

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold',
        status.status === 'checking' || status.status === 'unknown'
          ? 'border-border bg-secondary text-muted-foreground'
          : isConnected
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
            : 'border-destructive/30 bg-destructive/10 text-destructive',
      )}
      title={title}
    >
      <span
        className={cn(
          'size-2 rounded-full',
          status.status === 'checking' || status.status === 'unknown'
            ? 'bg-muted-foreground'
            : isConnected
              ? 'bg-emerald-500'
              : 'bg-destructive',
        )}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}

type CompareChatProps = {
  feedbackEnabled?: boolean
}

export function CompareChat({ feedbackEnabled = false }: CompareChatProps) {
  const { data: session, isPending } = authClient.useSession()
  const { isOffline } = useOnlineStatus()
  const [input, setInput] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { clearError, error, messages, sendMessage, setMessages, status, stop } = useChat({
    onError: (chatError) => logClientChatError('client-chat', chatError),
    transport: chatTransport,
  })
  const role = (session?.user as { role?: unknown } | undefined)?.role
  const isAdmin = hasAdminRole(role)
  const [mcpAccess, setMcpAccess] = useState<CompareMCPAccessStatus>({ status: 'unknown' })
  const isAuthenticated = Boolean(session?.user)
  const hasLegalConsent = isLegalConsentCurrent(session?.user)
  const isWorking = status === 'submitted' || status === 'streaming'
  const lastMessage = messages.at(-1)
  const isAwaitingAssistantResponse =
    isWorking &&
    (!lastMessage || lastMessage.role !== 'assistant' || !getMessageText(lastMessage).trim())
  const isDisabled = !isAuthenticated || !hasLegalConsent || isPending || isWorking || isOffline
  const canStartNewConversation =
    messages.length > 0 || Boolean(input) || Boolean(error) || isWorking
  const citationMetadataUrl =
    isAuthenticated && hasLegalConsent ? getCitationMetadataUrl(getMessageTexts(messages)) : null
  const citationMetadata = useCitationMetadata(citationMetadataUrl)

  useEffect(() => {
    if (!isAdmin) {
      return
    }

    function handleMcpStatus(event: Event) {
      const detail = (event as CustomEvent<CompareMCPAccessStatus>).detail

      if (detail?.status) {
        setMcpAccess(detail)
      }
    }

    window.addEventListener(mcpStatusEventType, handleMcpStatus)

    return () => window.removeEventListener(mcpStatusEventType, handleMcpStatus)
  }, [isAdmin])

  function handleNewConversation() {
    if (!canStartNewConversation) {
      return
    }

    if (isWorking) {
      stop()
    }

    clearError()
    setMessages([])
    setInput('')
  }

  async function submitQuestion(question: string) {
    const text = question.trim()

    if (!text || isDisabled) {
      return
    }

    setInput('')
    if (isAdmin) {
      setMcpAccess({ status: 'checking' })
    }
    await sendMessage({ text })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await submitQuestion(input)
  }

  async function handleTextareaKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) {
      return
    }

    event.preventDefault()
    await submitQuestion(input)
  }

  const chatPanel = (
    <Card
      aria-label="Chat comparatif"
      className={cn(
        'flex h-[min(46rem,calc(100vh-9rem))] min-h-[32rem] flex-col overflow-hidden border-primary/15 bg-card/90 shadow-2xl shadow-primary/10 backdrop-blur',
        isFullscreen && 'h-full min-h-0 rounded-none border-border shadow-none sm:rounded-xl',
      )}
      role="region"
    >
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 border-b border-border/70 p-3 sm:p-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
          {isAdmin ? <McpStatusBadge status={mcpAccess} /> : null}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            aria-label="Commencer une nouvelle conversation"
            disabled={!canStartNewConversation}
            onClick={handleNewConversation}
            size="sm"
            type="button"
            variant="outline"
          >
            <RotateCcw aria-hidden="true" />
            Nouvelle conversation
          </Button>
          <Button
            aria-label={isFullscreen ? 'Réduire le chat' : 'Afficher le chat en plein écran'}
            onClick={() => setIsFullscreen((value) => !value)}
            size="sm"
            type="button"
            variant="outline"
          >
            {isFullscreen ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
            {isFullscreen ? 'Réduire' : 'Plein écran'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col p-0">
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          {messages.length === 0 ? (
            <div className="mx-auto max-w-2xl py-6 text-center sm:py-10">
              <p className="text-lg font-semibold">Que voulez-vous comparer ?</p>
              <p className="mt-2 leading-7 text-muted-foreground">
                Posez une question libre ou lancez un exemple pour démarrer.
              </p>
              <div className="mt-5 grid gap-2 text-left sm:grid-cols-3">
                {suggestedQuestions.map((question) => (
                  <button
                    className="rounded-xl border border-border bg-background/75 p-3 text-sm font-semibold leading-6 transition hover:border-primary/40 hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isDisabled}
                    key={question}
                    onClick={() => submitQuestion(question)}
                    type="button"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {!isAuthenticated && !isPending ? (
            <div className="flex max-w-2xl items-start gap-3 rounded-2xl border border-primary/20 bg-background/80 p-4">
              <LockKeyhole className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <p className="font-semibold">Connexion requise</p>
                <p className="mt-1 leading-7 text-muted-foreground">
                  Le chat est visible mais désactivé pour les visiteurs anonymes.
                </p>
                <Button asChild className="mt-3" size="sm">
                  <Link href="/signin">Se connecter pour comparer</Link>
                </Button>
              </div>
            </div>
          ) : null}
          {isAuthenticated && !hasLegalConsent && !isPending ? (
            <div className="flex max-w-2xl items-start gap-3 rounded-2xl border border-primary/20 bg-background/80 p-4">
              <LockKeyhole className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <p className="font-semibold">Consentement requis</p>
                <p className="mt-1 leading-7 text-muted-foreground">
                  Confirmez les CGU, la confidentialité et la neutralité avant d’utiliser le chat.
                </p>
                <Button asChild className="mt-3" size="sm">
                  <Link href="/consent?next=/compare">Confirmer et comparer</Link>
                </Button>
              </div>
            </div>
          ) : null}
          <OfflineGuard
            className="max-w-2xl"
            message="Le chat comparatif nécessite une connexion Internet. Les pages déjà chargées restent lisibles hors ligne."
          />
          {messages.map((message, messageIndex) => {
            const text = getMessageText(message)
            const question = getPreviousUserMessageText(messages, messageIndex)
            const hasVisibleParts =
              Boolean(text.trim()) ||
              message.parts.some((part) => part.type === 'reasoning' || isToolStatusPart(part))
            const showFeedback =
              feedbackEnabled &&
              isAuthenticated &&
              message.role === 'assistant' &&
              Boolean(question) &&
              !(isWorking && messageIndex === messages.length - 1)
            const canSubmitClaimFeedback =
              isAuthenticated &&
              message.role === 'assistant' &&
              Boolean(question) &&
              !(isWorking && messageIndex === messages.length - 1)

            if (!hasVisibleParts) {
              return null
            }

            return (
              <div
                className={
                  message.role === 'user'
                    ? 'ml-auto max-w-2xl rounded-2xl bg-primary p-4 text-primary-foreground'
                    : 'max-w-2xl rounded-2xl border border-border bg-background/85 p-4 text-foreground'
                }
                key={message.id}
              >
                {message.parts.map((part, partIndex) => {
                  if (part.type === 'text') {
                    return (
                      <MarkdownMessage
                        answer={text}
                        canSubmitClaimFeedback={canSubmitClaimFeedback}
                        citationMetadata={citationMetadata}
                        isUser={message.role === 'user'}
                        key={`${message.id}-text-${partIndex}`}
                        messageId={message.id}
                        question={question}
                        text={part.text}
                      />
                    )
                  }

                  if (message.role === 'assistant' && part.type === 'reasoning') {
                    return (
                      <ReasoningStatusPart
                        key={`${message.id}-reasoning-${partIndex}`}
                        part={part}
                      />
                    )
                  }

                  if (message.role === 'assistant' && isToolStatusPart(part)) {
                    return <ToolStatusPart key={`${message.id}-tool-${partIndex}`} part={part} />
                  }

                  return null
                })}
                {showFeedback ? (
                  <CompareResponseFeedback
                    answer={text}
                    messageId={message.id}
                    question={question}
                  />
                ) : null}
              </div>
            )
          })}
          {isAwaitingAssistantResponse ? <ThinkingIndicator /> : null}
          {error ? (
            <p className="max-w-2xl rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
              {getReadableChatErrorMessage(error)}
            </p>
          ) : null}
        </div>
        <form className="shrink-0 border-t border-border/70 p-4 sm:p-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <textarea
              className="min-h-24 flex-1 resize-none rounded-xl border border-input bg-background/85 px-4 py-3 text-base outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isDisabled}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleTextareaKeyDown}
              placeholder={
                isOffline
                  ? 'Reconnectez-vous pour poser une question.'
                  : isAuthenticated
                    ? hasLegalConsent
                      ? 'Ex. Compare les positions sur la santé entre les principaux candidats.'
                      : 'Confirmez les conditions pour poser une question.'
                    : 'Connectez-vous pour poser une question.'
              }
              value={input}
            />
            <Button
              className="sm:self-end"
              disabled={isDisabled || !input.trim()}
              size="lg"
              type="submit"
            >
              Envoyer
              <SendHorizontal aria-hidden="true" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )

  if (isFullscreen) {
    return <div className="fixed inset-0 z-50 bg-background p-0 sm:p-4">{chatPanel}</div>
  }

  return <div className="mx-auto max-w-5xl">{chatPanel}</div>
}
