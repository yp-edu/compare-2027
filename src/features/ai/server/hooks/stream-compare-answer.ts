import { createAzure } from '@ai-sdk/azure'
import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from 'ai'

import { getCompareMCPTools } from './get-compare-mcp-tools'
import { getCompareSystemPrompt } from './get-compare-system-prompt'
import { getComparisonContext } from './get-comparison-context'

type StreamCompareAnswerArgs = {
  messages: UIMessage[]
  requestId?: string
  userId: number
}

export type CompareMCPAccess = {
  error?: string
  status: 'connected' | 'disconnected'
  toolCount: number
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

function logAIWarning(stage: string, error: unknown, context?: Record<string, unknown>) {
  console.warn('[compare-chat]', {
    ...context,
    stage,
    ...getErrorDetails(error),
  })
}

function getAzureOpenAIModel() {
  const apiKey = process.env.AZURE_OPENAI_API_KEY
  const resourceName = process.env.AZURE_OPENAI_RESOURCE_NAME
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT

  if (!apiKey || !resourceName || !deployment) {
    throw new Error('Azure OpenAI provider is not configured')
  }

  const azure = createAzure({
    apiKey,
    resourceName,
  })

  return azure(deployment)
}

export async function streamCompareAnswer({
  messages,
  requestId,
  userId,
}: StreamCompareAnswerArgs) {
  let mcpError: string | undefined
  const [context, mcpTools] = await Promise.all([
    getComparisonContext(),
    getCompareMCPTools(userId, { requestId }).catch((error) => {
      mcpError = getErrorDetails(error).message
      logAIWarning('mcp-tools', error, {
        requestId,
        userId,
      })

      return undefined
    }),
  ])
  const mcpToolCount = mcpTools ? Object.keys(mcpTools).length : 0

  return {
    mcp: {
      ...(mcpError ? { error: mcpError } : {}),
      status: mcpToolCount > 0 ? 'connected' : 'disconnected',
      toolCount: mcpToolCount,
    } satisfies CompareMCPAccess,
    result: streamText({
      maxOutputTokens: 900,
      messages: await convertToModelMessages(messages),
      model: getAzureOpenAIModel(),
      ...(mcpTools ? { stopWhen: stepCountIs(4), tools: mcpTools } : {}),
      system: getCompareSystemPrompt(context),
    }),
  }
}
