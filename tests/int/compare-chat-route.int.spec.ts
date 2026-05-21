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
  beforeEach(() => {
    process.env.AZURE_OPENAI_API_KEY = 'test-key'
    process.env.AZURE_OPENAI_DEPLOYMENT = 'test-deployment'
    process.env.AZURE_OPENAI_RESOURCE_NAME = 'test-resource'
  })

  afterEach(() => {
    vi.clearAllMocks()
    restoreEnv('AZURE_OPENAI_API_KEY')
    restoreEnv('AZURE_OPENAI_DEPLOYMENT')
    restoreEnv('AZURE_OPENAI_RESOURCE_NAME')
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
    await expect(response.json()).resolves.toEqual({ error: 'Malformed JSON payload' })
    expect(streamCompareAnswer).not.toHaveBeenCalled()
  })

  it('passes the authenticated user ID into the AI stream', async () => {
    vi.mocked(streamCompareAnswer).mockResolvedValueOnce({
      toUIMessageStreamResponse: () => new Response(null, { status: 200 }),
    } as Awaited<ReturnType<typeof streamCompareAnswer>>)

    const messages = [{ id: 'message-1', parts: [], role: 'user' }]
    const response = await POST(
      new Request('http://localhost/compare/chat', {
        body: JSON.stringify({ messages }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      }),
    )

    expect(response.status).toBe(200)
    expect(streamCompareAnswer).toHaveBeenCalledWith({ messages, userId: 123 })
  })
})
