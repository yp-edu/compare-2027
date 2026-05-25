import { randomBytes, randomUUID } from 'crypto'
import { dynamicTool, jsonSchema, type ToolSet } from 'ai'
import { getPayload } from 'payload'

import { getServerURL } from '@/lib/server-urls'
import config from '@/payload.config'
import { getCompareMcpApiKeyPermissions } from '@/plugins/mcp'

type JsonRpcResponse<T> = {
  error?: {
    code: number
    data?: unknown
    message: string
  }
  id: string
  jsonrpc: '2.0'
  result?: T
}

type MCPToolDescription = {
  description?: string
  inputSchema?: unknown
  name: string
  title?: string
}

type MCPToolsListResult = {
  tools?: MCPToolDescription[]
}

type MCPToolCallResult = {
  content?: Array<{
    text?: string
    type: string
  }>
  isError?: boolean
}

type JsonSchemaInput = Parameters<typeof jsonSchema>[0]

type McpDiagnosticsOptions = {
  requestId?: string
}

class McpHTTPError extends Error {
  status: number

  constructor(status: number) {
    super(`MCP request failed with status ${status}`)
    this.name = 'McpHTTPError'
    this.status = status
  }
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

function logMcpError(stage: string, error: unknown, context?: Record<string, unknown>) {
  console.error('[compare-chat]', {
    ...context,
    stage,
    ...getErrorDetails(error),
  })
}

function logMcpInfo(stage: string, context?: Record<string, unknown>) {
  console.info('[compare-chat]', {
    ...context,
    stage,
  })
}

function getBodyPreview(text: string) {
  return text.length > 500 ? `${text.slice(0, 500)}...` : text
}

function generateMcpApiKey() {
  return randomBytes(32).toString('base64url')
}

function getEnabledPermissionCount(value: Record<string, unknown>) {
  return Object.keys(getCompareMcpApiKeyPermissions()).filter((field) => {
    const permission = value[field]

    return Boolean(
      permission &&
      typeof permission === 'object' &&
      'find' in permission &&
      (permission as { find?: unknown }).find === true,
    )
  }).length
}

async function getOrCreateMcpBearerToken(
  userId: number,
  options: McpDiagnosticsOptions = {},
  { refresh = false }: { refresh?: boolean } = {},
) {
  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'payload-mcp-api-keys',
      depth: 0,
      limit: 1,
      pagination: false,
      sort: '-updatedAt',
      where: {
        user: {
          equals: userId,
        },
      },
    })

    const existingKey = docs[0]

    if (!refresh && existingKey?.enableAPIKey && existingKey.apiKey) {
      const enabledPermissionCount = getEnabledPermissionCount(
        existingKey as unknown as Record<string, unknown>,
      )

      logMcpInfo('mcp-api-key-selected', {
        enabledPermissionCount,
        keyAction: 'reused',
        keyId: existingKey.id,
        keyLabel: existingKey.label,
        requestId: options.requestId,
        userId,
      })

      return existingKey.apiKey
    }

    const apiKey = generateMcpApiKey()
    const data = {
      ...getCompareMcpApiKeyPermissions(),
      apiKey,
      description: 'Automatically managed key for Compare chat MCP calls.',
      enableAPIKey: true,
      label: 'Compare chat MCP',
      user: userId,
    }

    if (existingKey) {
      await payload.update({
        collection: 'payload-mcp-api-keys',
        data,
        id: existingKey.id,
      })

      logMcpInfo('mcp-api-key-selected', {
        keyAction: refresh ? 'refreshed' : 'updated',
        keyId: existingKey.id,
        requestId: options.requestId,
        userId,
      })

      return apiKey
    }

    const createdKey = await payload.create({
      collection: 'payload-mcp-api-keys',
      data,
    })

    logMcpInfo('mcp-api-key-selected', {
      keyAction: 'created',
      keyId: createdKey.id,
      requestId: options.requestId,
      userId,
    })

    return apiKey
  } catch (error) {
    logMcpError('mcp-api-key', error, {
      requestId: options.requestId,
      userId,
    })

    throw error
  }
}

function getMcpEndpointURL() {
  return new URL('/api/mcp', getServerURL()).toString()
}

function getMcpRequestHeaders(bearerToken: string) {
  const headers: Record<string, string> = {
    accept: 'application/json, text/event-stream',
    authorization: `Bearer ${bearerToken}`,
    'content-type': 'application/json',
    'mcp-protocol-version': '2025-06-18',
  }

  const vercelProtectionBypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET

  if (vercelProtectionBypass) {
    headers['x-vercel-protection-bypass'] = vercelProtectionBypass
  }

  return headers
}

function isMcpAuthError(error: unknown) {
  return error instanceof McpHTTPError && (error.status === 401 || error.status === 403)
}

function parseSSEJson(text: string) {
  const data = text
    .split('\n')
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.replace(/^data:\s?/, '').trim())
    .filter(Boolean)

  for (const value of data) {
    const parsed = JSON.parse(value) as unknown

    if (parsed && typeof parsed === 'object' && 'jsonrpc' in parsed) {
      return parsed
    }
  }

  throw new Error('MCP response did not include a JSON-RPC payload')
}

async function parseMcpResponse<T>(
  response: Response,
  { method, requestId }: { method: string; requestId?: string },
) {
  const text = await response.text()
  const contentType = response.headers.get('content-type') || ''
  let parsed: JsonRpcResponse<T> | JsonRpcResponse<T>[]

  try {
    parsed = (contentType.includes('text/event-stream') ? parseSSEJson(text) : JSON.parse(text)) as
      | JsonRpcResponse<T>
      | JsonRpcResponse<T>[]
  } catch (error) {
    logMcpError('mcp-parse-response', error, {
      bodyPreview: getBodyPreview(text),
      contentType,
      method,
      requestId,
      status: response.status,
    })

    throw error
  }

  const payload = Array.isArray(parsed) ? parsed[0] : parsed

  if (!payload) {
    const error = new Error('MCP response was empty')

    logMcpError('mcp-empty-response', error, {
      bodyPreview: getBodyPreview(text),
      contentType,
      method,
      requestId,
      status: response.status,
    })

    throw error
  }

  if (payload.error) {
    const error = new Error(`MCP ${payload.error.code}: ${payload.error.message}`)

    logMcpError('mcp-json-rpc', error, {
      code: payload.error.code,
      method,
      requestId,
    })

    throw error
  }

  return payload.result as T
}

async function callMcp<T>(
  bearerToken: string,
  method: string,
  params?: Record<string, unknown>,
  options: McpDiagnosticsOptions = {},
) {
  let response: Response

  try {
    response = await fetch(getMcpEndpointURL(), {
      body: JSON.stringify({
        id: randomUUID(),
        jsonrpc: '2.0',
        method,
        ...(params ? { params } : {}),
      }),
      headers: getMcpRequestHeaders(bearerToken),
      method: 'POST',
    })
  } catch (error) {
    logMcpError('mcp-request', error, {
      method,
      requestId: options.requestId,
    })

    throw error
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    const error = new McpHTTPError(response.status)

    logMcpError('mcp-http', error, {
      bodyPreview: getBodyPreview(text),
      contentType: response.headers.get('content-type') || '',
      method,
      requestId: options.requestId,
      status: response.status,
    })

    throw error
  }

  return parseMcpResponse<T>(response, { method, requestId: options.requestId })
}

function getInputSchema(inputSchema: unknown): JsonSchemaInput {
  if (inputSchema && typeof inputSchema === 'object') {
    return inputSchema as JsonSchemaInput
  }

  return {
    additionalProperties: false,
    properties: {},
    type: 'object',
  } as JsonSchemaInput
}

function getToolText(result: MCPToolCallResult) {
  const text =
    result.content
      ?.map((item) => (item.type === 'text' ? item.text : undefined))
      .filter((value): value is string => Boolean(value))
      .join('\n') || 'No MCP result content returned.'

  if (result.isError) {
    return `MCP tool returned an error:\n${text}`
  }

  return text
}

export async function getCompareMCPTools(userId: number, options: McpDiagnosticsOptions = {}) {
  let bearerToken = await getOrCreateMcpBearerToken(userId, options)
  let toolsList: MCPToolsListResult

  try {
    toolsList = await callMcp<MCPToolsListResult>(bearerToken, 'tools/list', undefined, options)
  } catch (error) {
    if (!isMcpAuthError(error)) {
      throw error
    }

    logMcpInfo('mcp-api-key-refresh-retry', {
      reason: getErrorDetails(error).message,
      requestId: options.requestId,
      userId,
    })
    bearerToken = await getOrCreateMcpBearerToken(userId, options, { refresh: true })
    toolsList = await callMcp<MCPToolsListResult>(bearerToken, 'tools/list', undefined, options)
  }

  const mcpTools = toolsList?.tools || []
  const toolNames = mcpTools.map((tool) => tool.name)

  if (!toolNames.length) {
    logMcpInfo('mcp-tools-empty', {
      requestId: options.requestId,
      userId,
    })

    return undefined
  }

  const tools: ToolSet = {}

  for (const mcpTool of mcpTools) {
    tools[mcpTool.name] = dynamicTool({
      description: mcpTool.description,
      inputSchema: jsonSchema(getInputSchema(mcpTool.inputSchema)),
      metadata: {
        source: 'payload-mcp',
      },
      title: mcpTool.title || mcpTool.name,
      execute: async (input) => {
        const result = await callMcp<MCPToolCallResult>(
          bearerToken,
          'tools/call',
          {
            arguments: input as Record<string, unknown>,
            name: mcpTool.name,
          },
          options,
        )

        return getToolText(result)
      },
    })
  }

  logMcpInfo('mcp-tools-ready', {
    requestId: options.requestId,
    toolCount: toolNames.length,
    toolNames,
    userId,
  })

  return tools
}
