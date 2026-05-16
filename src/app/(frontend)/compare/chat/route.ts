import type { UIMessage } from 'ai'

import { requireChatSession, streamCompareAnswer } from '@/features/ai/server'

export const maxDuration = 30

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
  const session = await requireChatSession(request)

  if (!session) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  if (
    !process.env.AZURE_OPENAI_API_KEY ||
    !process.env.AZURE_OPENAI_RESOURCE_NAME ||
    !process.env.AZURE_OPENAI_DEPLOYMENT
  ) {
    return Response.json({ error: 'AI provider is not configured' }, { status: 503 })
  }

  let body: { messages?: unknown }

  try {
    body = (await request.json()) as { messages?: unknown }
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json({ error: 'Malformed JSON payload' }, { status: 400 })
    }

    throw error
  }

  if (!isUIMessageArray(body.messages)) {
    return Response.json({ error: 'Invalid chat payload' }, { status: 400 })
  }

  const result = await streamCompareAnswer({ messages: body.messages })

  return result.toUIMessageStreamResponse()
}
