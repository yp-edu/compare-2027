import type { UIMessage } from 'ai'

import { requireChatSession, streamCompareAnswer } from '@/features/ai/server'

export const maxDuration = 30

type ChatErrorStage =
  | 'auth'
  | 'config'
  | 'parse-json'
  | 'stream-response'
  | 'stream-start'
  | 'user'
  | 'validate-payload'

const exposeChatErrorDetails =
  process.env.NODE_ENV !== 'production' || process.env.CHAT_DEBUG === '1'

function createChatRequestId() {
  return globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)
}

function getErrorDetails(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    }
  }

  return {
    message: String(error),
    name: typeof error,
  }
}

function logChatError(
  requestId: string,
  stage: ChatErrorStage,
  error: unknown,
  context?: Record<string, unknown>,
) {
  console.error('[compare-chat]', {
    ...context,
    requestId,
    stage,
    ...getErrorDetails(error),
  })
}

function chatErrorResponse({
  error,
  message,
  requestId,
  stage,
  status,
}: {
  error?: unknown
  message: string
  requestId: string
  stage: ChatErrorStage
  status: number
}) {
  return Response.json(
    {
      error: message,
      requestId,
      stage,
      ...(exposeChatErrorDetails && error ? { details: getErrorDetails(error).message } : {}),
    },
    {
      headers: { 'x-chat-request-id': requestId },
      status,
    },
  )
}

function getStreamErrorMessage(requestId: string, stage: ChatErrorStage, error: unknown) {
  if (exposeChatErrorDetails) {
    return `Erreur du chat (${stage}, ${requestId}): ${getErrorDetails(error).message}`
  }

  return `Erreur du chat (${stage}, ${requestId}). Consultez les logs serveur avec cette référence.`
}

function hasAdminRole(role: unknown) {
  if (Array.isArray(role)) {
    return role.includes('admin')
  }

  return role === 'admin'
}

function sanitizeHeaderValue(value: string) {
  return Array.from(value, (character) => {
    const codePoint = character.codePointAt(0) ?? 0

    if (codePoint >= 0x20 && codePoint <= 0x7e) {
      return character
    }

    if (codePoint >= 0x80 && codePoint <= 0xff) {
      return character
    }

    return ' '
  })
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

function isUIMessageArray(value: unknown): value is UIMessage[] {
  return (
    Array.isArray(value) &&
    value.every(
      (message) =>
        typeof message === 'object' &&
        message !== null &&
        'role' in message &&
        'parts' in message &&
        Array.isArray((message as { parts?: unknown }).parts),
    )
  )
}

export async function POST(request: Request) {
  const requestId = createChatRequestId()
  let session: Awaited<ReturnType<typeof requireChatSession>>

  try {
    session = await requireChatSession(request)
  } catch (error) {
    logChatError(requestId, 'auth', error)

    return chatErrorResponse({
      error,
      message: 'Chat authentication failed',
      requestId,
      stage: 'auth',
      status: 500,
    })
  }

  if (!session) {
    return chatErrorResponse({
      message: 'Authentication required',
      requestId,
      stage: 'auth',
      status: 401,
    })
  }

  if (
    !process.env.AZURE_OPENAI_API_KEY ||
    !process.env.AZURE_OPENAI_RESOURCE_NAME ||
    !process.env.AZURE_OPENAI_DEPLOYMENT
  ) {
    return chatErrorResponse({
      message: 'AI provider is not configured',
      requestId,
      stage: 'config',
      status: 503,
    })
  }

  let body: { messages?: unknown }

  try {
    body = (await request.json()) as { messages?: unknown }
  } catch (error) {
    logChatError(requestId, 'parse-json', error)

    if (error instanceof SyntaxError) {
      return chatErrorResponse({
        error,
        message: 'Malformed JSON payload',
        requestId,
        stage: 'parse-json',
        status: 400,
      })
    }

    return chatErrorResponse({
      error,
      message: 'Unable to read chat payload',
      requestId,
      stage: 'parse-json',
      status: 500,
    })
  }

  if (!isUIMessageArray(body.messages)) {
    return chatErrorResponse({
      message: 'Invalid chat payload',
      requestId,
      stage: 'validate-payload',
      status: 400,
    })
  }

  const messages = body.messages

  const userId = Number(session.user.id)

  if (!Number.isInteger(userId)) {
    return chatErrorResponse({
      message: 'Invalid authenticated user',
      requestId,
      stage: 'user',
      status: 401,
    })
  }

  try {
    const { mcp, result } = await streamCompareAnswer({ messages, requestId, userId })
    const headers: Record<string, string> = {
      'x-chat-request-id': requestId,
      'x-compare-mcp-status': mcp.status,
      'x-compare-mcp-tool-count': String(mcp.toolCount),
    }
    const exposeMcpDiagnostics = hasAdminRole((session.user as { role?: unknown }).role)

    if ((exposeMcpDiagnostics || process.env.CHAT_DEBUG === '1') && mcp.error) {
      headers['x-compare-mcp-error'] = sanitizeHeaderValue(mcp.error)
    }

    return result.toUIMessageStreamResponse({
      headers,
      onError: (error) => {
        logChatError(requestId, 'stream-response', error, {
          messageCount: messages.length,
        })

        return getStreamErrorMessage(requestId, 'stream-response', error)
      },
    })
  } catch (error) {
    logChatError(requestId, 'stream-start', error, {
      messageCount: messages.length,
      userId,
    })

    return chatErrorResponse({
      error,
      message: 'Chat stream could not be started',
      requestId,
      stage: 'stream-start',
      status: 500,
    })
  }
}
