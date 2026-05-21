import { randomUUID } from 'crypto'
import { dynamicTool, jsonSchema, type ToolSet } from 'ai'

import { getServerURL } from '@/lib/server-urls'

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

function getMcpBearerToken() {
  return (
    process.env.PAYLOAD_SECRET || process.env.COMPARE_MCP_API_KEY || process.env.PAYLOAD_MCP_API_KEY
  )
}

function getMcpEndpointURL() {
  return new URL('/api/mcp', getServerURL()).toString()
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

async function parseMcpResponse<T>(response: Response) {
  const text = await response.text()
  const contentType = response.headers.get('content-type') || ''
  const parsed = (
    contentType.includes('text/event-stream') ? parseSSEJson(text) : JSON.parse(text)
  ) as JsonRpcResponse<T> | JsonRpcResponse<T>[]
  const payload = Array.isArray(parsed) ? parsed[0] : parsed

  if (!payload) {
    throw new Error('MCP response was empty')
  }

  if (payload.error) {
    throw new Error(`MCP ${payload.error.code}: ${payload.error.message}`)
  }

  return payload.result as T
}

async function callMcp<T>(method: string, params?: Record<string, unknown>) {
  const bearerToken = getMcpBearerToken()

  if (!bearerToken) {
    return undefined
  }

  const response = await fetch(getMcpEndpointURL(), {
    body: JSON.stringify({
      id: randomUUID(),
      jsonrpc: '2.0',
      method,
      ...(params ? { params } : {}),
    }),
    headers: {
      accept: 'application/json, text/event-stream',
      authorization: `Bearer ${bearerToken}`,
      'content-type': 'application/json',
      'mcp-protocol-version': '2025-06-18',
    },
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(`MCP request failed with status ${response.status}`)
  }

  return parseMcpResponse<T>(response)
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

export async function getCompareMCPTools() {
  const toolsList = await callMcp<MCPToolsListResult>('tools/list')

  if (!toolsList?.tools?.length) {
    return undefined
  }

  const tools: ToolSet = {}

  for (const mcpTool of toolsList.tools) {
    tools[mcpTool.name] = dynamicTool({
      description: mcpTool.description,
      inputSchema: jsonSchema(getInputSchema(mcpTool.inputSchema)),
      metadata: {
        source: 'payload-mcp',
      },
      title: mcpTool.title || mcpTool.name,
      execute: async (input) => {
        const result = await callMcp<MCPToolCallResult>('tools/call', {
          arguments: input as Record<string, unknown>,
          name: mcpTool.name,
        })

        if (!result) {
          return 'MCP is not configured for this environment.'
        }

        return getToolText(result)
      },
    })
  }

  return tools
}
