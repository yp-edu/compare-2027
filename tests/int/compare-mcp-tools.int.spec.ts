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
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined)
  })

  afterEach(() => {
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
})
