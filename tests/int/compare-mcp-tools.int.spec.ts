import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getPayload } from 'payload'

import { getCompareMCPTools } from '@/features/ai/server/hooks/get-compare-mcp-tools'

vi.mock('payload', () => ({
  getPayload: vi.fn(),
}))

vi.mock('@/payload.config', () => ({
  default: {},
}))

vi.mock('@/lib/server-urls', () => ({
  getServerURL: () => 'https://preview.example.test',
}))

vi.mock('@/plugins/mcp', () => ({
  getCompareMcpApiKeyPermissions: () => ({
    candidates: { find: true },
  }),
}))

describe('compare MCP tools', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined)
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    consoleInfoSpy.mockRestore()
    vi.clearAllMocks()
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('sends the Vercel protection bypass header for internal MCP requests', async () => {
    vi.stubEnv('VERCEL_AUTOMATION_BYPASS_SECRET', 'vercel-bypass-secret')

    vi.mocked(getPayload).mockResolvedValueOnce({
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            apiKey: 'mcp-api-key',
            candidates: { find: true },
            enableAPIKey: true,
            id: 1,
            label: 'Compare chat MCP',
          },
        ],
      }),
    } as unknown as Awaited<ReturnType<typeof getPayload>>)

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'request-id',
          jsonrpc: '2.0',
          result: {
            tools: [
              {
                description: 'Find candidates',
                inputSchema: {
                  additionalProperties: false,
                  properties: {},
                  type: 'object',
                },
                name: 'findCandidates',
              },
            ],
          },
        }),
        {
          headers: { 'content-type': 'application/json' },
          status: 200,
        },
      ),
    )

    vi.stubGlobal('fetch', fetchMock)

    await expect(getCompareMCPTools(123, { requestId: 'chat-request-id' })).resolves.toEqual(
      expect.objectContaining({
        findCandidates: expect.any(Object),
      }),
    )

    expect(fetchMock).toHaveBeenCalledWith(
      'https://preview.example.test/api/mcp',
      expect.objectContaining({
        headers: expect.objectContaining({
          authorization: 'Bearer mcp-api-key',
          'x-vercel-protection-bypass': 'vercel-bypass-secret',
        }),
        method: 'POST',
      }),
    )
  })

  it('refreshes the MCP API key and retries tools/list once when the stored key fails', async () => {
    const update = vi.fn().mockResolvedValue({ id: 1 })

    vi.mocked(getPayload).mockResolvedValue({
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            apiKey: 'stale-mcp-api-key',
            candidates: { find: true },
            enableAPIKey: true,
            id: 1,
            label: 'Compare chat MCP',
          },
        ],
      }),
      update,
    } as unknown as Awaited<ReturnType<typeof getPayload>>)

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 'request-id',
            jsonrpc: '2.0',
            result: {
              tools: [
                {
                  description: 'Find candidates',
                  inputSchema: {
                    additionalProperties: false,
                    properties: {},
                    type: 'object',
                  },
                  name: 'findCandidates',
                },
              ],
            },
          }),
          {
            headers: { 'content-type': 'application/json' },
            status: 200,
          },
        ),
      )

    vi.stubGlobal('fetch', fetchMock)

    await expect(getCompareMCPTools(123, { requestId: 'chat-request-id' })).resolves.toEqual(
      expect.objectContaining({
        findCandidates: expect.any(Object),
      }),
    )

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://preview.example.test/api/mcp',
      expect.objectContaining({
        headers: expect.objectContaining({
          authorization: 'Bearer stale-mcp-api-key',
        }),
        method: 'POST',
      }),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://preview.example.test/api/mcp',
      expect.objectContaining({
        headers: expect.objectContaining({
          authorization: expect.stringMatching(/^Bearer [A-Za-z0-9_-]+$/),
        }),
        method: 'POST',
      }),
    )
    expect(update).toHaveBeenCalledTimes(1)
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'payload-mcp-api-keys',
        data: expect.objectContaining({
          apiKey: expect.not.stringContaining('stale-mcp-api-key'),
          enableAPIKey: true,
        }),
        id: 1,
      }),
    )
  })

  it('does not refresh the MCP API key when tools/list fails for non-auth reasons', async () => {
    const update = vi.fn()

    vi.mocked(getPayload).mockResolvedValue({
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            apiKey: 'mcp-api-key',
            candidates: { find: true },
            enableAPIKey: true,
            id: 1,
            label: 'Compare chat MCP',
          },
        ],
      }),
      update,
    } as unknown as Awaited<ReturnType<typeof getPayload>>)

    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('Internal server error', { status: 500 }))

    vi.stubGlobal('fetch', fetchMock)

    await expect(getCompareMCPTools(123, { requestId: 'chat-request-id' })).rejects.toThrow(
      'MCP request failed with status 500',
    )

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(update).not.toHaveBeenCalled()
  })
})
