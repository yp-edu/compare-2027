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

type TestTool = {
  execute: (input: unknown) => Promise<string>
}

function getRequestBody(fetchMock: ReturnType<typeof vi.fn>, callIndex: number) {
  return JSON.parse(fetchMock.mock.calls[callIndex]?.[1]?.body as string) as {
    params?: {
      arguments?: Record<string, unknown>
      name?: string
    }
  }
}

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

  it.each([401, 404])(
    'refreshes the MCP API key and retries tools/list once when the stored key returns %i',
    async (status) => {
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
        .mockResolvedValueOnce(
          new Response(status === 401 ? 'Unauthorized' : 'Not Found', { status }),
        )
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
    },
  )

  it('refreshes the MCP API key when the stored key cannot be sent as a header', async () => {
    const update = vi.fn().mockResolvedValue({ id: 1 })

    vi.mocked(getPayload).mockResolvedValue({
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            apiKey: 'm�p-api-key',
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
      .mockRejectedValueOnce(
        new TypeError(
          'Cannot convert argument to a ByteString because the character at index 8 has a value of 65533 which is greater than 255.',
        ),
      )
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
          authorization: 'Bearer m�p-api-key',
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
          apiKey: expect.not.stringContaining('�'),
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

  it('constrains generated find tools to published selected fields', async () => {
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

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 'request-id',
            jsonrpc: '2.0',
            result: {
              tools: [
                {
                  description: 'Find claims',
                  inputSchema: {
                    additionalProperties: false,
                    properties: {},
                    type: 'object',
                  },
                  name: 'findClaims',
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
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 'request-id',
            jsonrpc: '2.0',
            result: {
              content: [{ text: 'ok', type: 'text' }],
            },
          }),
          {
            headers: { 'content-type': 'application/json' },
            status: 200,
          },
        ),
      )

    vi.stubGlobal('fetch', fetchMock)

    const tools = await getCompareMCPTools(123, { requestId: 'chat-request-id' })
    const result = await (tools as unknown as { findClaims: TestTool }).findClaims.execute({
      depth: 6,
      draft: true,
      id: 42,
      limit: 100,
      select: '{"rawExtraction": true}',
      where: '{"claimText":{"contains":"école"}}',
    })

    expect(result).toBe('ok')
    expect(fetchMock).toHaveBeenCalledTimes(2)

    const requestBody = getRequestBody(fetchMock, 1)
    const args = requestBody.params?.arguments || {}
    const select = JSON.parse(args.select as string) as Record<string, unknown>
    const where = JSON.parse(args.where as string)

    expect(requestBody.params?.name).toBe('findClaims')
    expect(args.id).toBeUndefined()
    expect(args.depth).toBe(1)
    expect(args.draft).toBe(false)
    expect(args.limit).toBe(10)
    expect(select).toMatchObject({ claimText: true, evidenceQuote: true, title: true })
    expect(select.rawExtraction).toBeUndefined()
    expect(where).toEqual({
      and: [
        { claimText: { contains: 'école' } },
        { id: { equals: 42 } },
        { _status: { equals: 'published' } },
      ],
    })
  })

  it('rejects invalid generated query fields before calling MCP', async () => {
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

    const fetchMock = vi.fn().mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: 'request-id',
          jsonrpc: '2.0',
          result: {
            tools: [
              {
                description: 'Find document chunks',
                inputSchema: {
                  additionalProperties: false,
                  properties: {},
                  type: 'object',
                },
                name: 'findDocumentChunks',
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

    const tools = await getCompareMCPTools(123, { requestId: 'chat-request-id' })
    const result = await (
      tools as unknown as { findDocumentChunks: TestTool }
    ).findDocumentChunks.execute({
      where: '{"chunkText":{"contains":"école"},"content":{"contains":"école"}}',
    })

    expect(result).toContain('Invalid query fields for findDocumentChunks: chunkText, content')
    expect(result).toContain('Use text for chunk body text')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
