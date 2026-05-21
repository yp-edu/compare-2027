import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { POST } from '@/app/(frontend)/compare/chat/route'
import { streamCompareAnswer } from '@/features/ai/server'

vi.mock('@/features/ai/server', () => ({
  requireChatSession: vi.fn(async () => ({ user: { id: '123' } })),
  streamCompareAnswer: vi.fn(),
}))

const originalAzureEnv = {
  AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY,
  AZURE_OPENAI_DEPLOYMENT: process.env.AZURE_OPENAI_DEPLOYMENT,
  AZURE_OPENAI_RESOURCE_NAME: process.env.AZURE_OPENAI_RESOURCE_NAME,
  CHAT_DEBUG: process.env.CHAT_DEBUG,
}

function restoreEnv(name: keyof typeof originalAzureEnv) {
  const value = originalAzureEnv[name]

  if (value === undefined) {
    delete process.env[name]
    return
  }

  process.env[name] = value
}

describe('compare chat route', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    process.env.AZURE_OPENAI_API_KEY = 'test-key'
    process.env.AZURE_OPENAI_DEPLOYMENT = 'test-deployment'
    process.env.AZURE_OPENAI_RESOURCE_NAME = 'test-resource'
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    vi.clearAllMocks()
    restoreEnv('AZURE_OPENAI_API_KEY')
    restoreEnv('AZURE_OPENAI_DEPLOYMENT')
    restoreEnv('AZURE_OPENAI_RESOURCE_NAME')
    restoreEnv('CHAT_DEBUG')
  })

  it('returns a client error for malformed JSON', async () => {
    const response = await POST(
      new Request('http://localhost/compare/chat', {
        body: '{',
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      error: 'Malformed JSON payload',
      requestId: expect.any(String),
      stage: 'parse-json',
    })
    expect(streamCompareAnswer).not.toHaveBeenCalled()
  })

  it('returns a debuggable client error for invalid chat payloads', async () => {
    const response = await POST(
      new Request('http://localhost/compare/chat', {
        body: JSON.stringify({ messages: 'not messages' }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      error: 'Invalid chat payload',
      requestId: expect.any(String),
      stage: 'validate-payload',
    })
    expect(response.headers.get('x-chat-request-id')).toEqual(expect.any(String))
    expect(streamCompareAnswer).not.toHaveBeenCalled()
  })

  it('passes the authenticated user ID into the AI stream', async () => {
    const toUIMessageStreamResponse = vi.fn(() => new Response(null, { status: 200 }))

    vi.mocked(streamCompareAnswer).mockResolvedValueOnce({
      mcp: {
        status: 'connected',
        toolCount: 2,
      },
      result: {
        toUIMessageStreamResponse,
      },
    } as unknown as Awaited<ReturnType<typeof streamCompareAnswer>>)

    const messages = [{ id: 'message-1', parts: [], role: 'user' }]
    const response = await POST(
      new Request('http://localhost/compare/chat', {
        body: JSON.stringify({ messages }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      }),
    )

    expect(response.status).toBe(200)
    expect(streamCompareAnswer).toHaveBeenCalledWith({
      messages,
      requestId: expect.any(String),
      userId: 123,
    })
    expect(toUIMessageStreamResponse).toHaveBeenCalledWith({
      headers: {
        'x-chat-request-id': expect.any(String),
        'x-compare-mcp-status': 'connected',
        'x-compare-mcp-tool-count': '2',
      },
      onError: expect.any(Function),
    })
  })

  it('sanitizes MCP diagnostics before adding them to response headers', async () => {
    const toUIMessageStreamResponse = vi.fn(
      ({ headers }: { headers: HeadersInit }) => new Response(null, { headers, status: 200 }),
    )

    process.env.CHAT_DEBUG = '1'
    vi.mocked(streamCompareAnswer).mockResolvedValueOnce({
      mcp: {
        error: 'MCP\nfailed ✓',
        status: 'disconnected',
        toolCount: 0,
      },
      result: {
        toUIMessageStreamResponse,
      },
    } as unknown as Awaited<ReturnType<typeof streamCompareAnswer>>)

    const response = await POST(
      new Request('http://localhost/compare/chat', {
        body: JSON.stringify({ messages: [{ id: 'message-1', parts: [], role: 'user' }] }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      }),
    )

    expect(response.status).toBe(200)
    expect(toUIMessageStreamResponse).toHaveBeenCalledWith({
      headers: {
        'x-chat-request-id': expect.any(String),
        'x-compare-mcp-error': 'MCP failed',
        'x-compare-mcp-status': 'disconnected',
        'x-compare-mcp-tool-count': '0',
      },
      onError: expect.any(Function),
    })
  })

  it('returns a debuggable server error when the AI stream cannot start', async () => {
    vi.mocked(streamCompareAnswer).mockRejectedValueOnce(new Error('context failed'))

    const response = await POST(
      new Request('http://localhost/compare/chat', {
        body: JSON.stringify({ messages: [{ id: 'message-1', parts: [], role: 'user' }] }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      }),
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toMatchObject({
      details: 'context failed',
      error: 'Chat stream could not be started',
      requestId: expect.any(String),
      stage: 'stream-start',
    })
  })
})
