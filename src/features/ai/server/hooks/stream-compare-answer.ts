import { createAzure } from '@ai-sdk/azure'
import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from 'ai'

import { getCompareMCPTools } from './get-compare-mcp-tools'
import { getCompareSystemPrompt } from './get-compare-system-prompt'
import { getComparisonContext } from './get-comparison-context'

type StreamCompareAnswerArgs = {
  abortSignal?: AbortSignal
  messages: UIMessage[]
  requestId?: string
  userId: number
}

const defaultCompareChatMaxOutputTokens = 4096

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

function logAIStreamWarning(stage: string, context: Record<string, unknown>) {
  console.warn('[compare-chat]', {
    ...context,
    stage,
  })
}

function getCompareChatMaxOutputTokens() {
  const configuredValue = process.env.COMPARE_CHAT_MAX_OUTPUT_TOKENS

  if (!configuredValue) {
    return defaultCompareChatMaxOutputTokens
  }

  const maxOutputTokens = Number(configuredValue)

  if (Number.isInteger(maxOutputTokens) && maxOutputTokens > 0) {
    return maxOutputTokens
  }

  logAIWarning('config', new Error('Invalid COMPARE_CHAT_MAX_OUTPUT_TOKENS'), {
    configuredValue,
  })

  return defaultCompareChatMaxOutputTokens
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
  abortSignal,
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
  const maxOutputTokens = getCompareChatMaxOutputTokens()

  return {
    mcp: {
      ...(mcpError ? { error: mcpError } : {}),
      status: mcpToolCount > 0 ? 'connected' : 'disconnected',
      toolCount: mcpToolCount,
    } satisfies CompareMCPAccess,
    result: streamText({
      abortSignal,
      maxOutputTokens,
      messages: await convertToModelMessages(messages),
      model: getAzureOpenAIModel(),
      onAbort: ({ steps }) => {
        logAIStreamWarning('stream-abort', {
          maxOutputTokens,
          messageCount: messages.length,
          requestId,
          stepCount: steps.length,
          userId,
        })
      },
      onError: ({ error }) => {
        logAIWarning('stream-error', error, {
          maxOutputTokens,
          messageCount: messages.length,
          requestId,
          userId,
        })
      },
      onFinish: ({ finishReason, rawFinishReason, steps, text, totalUsage }) => {
        if (finishReason !== 'length') {
          return
        }

        logAIStreamWarning('stream-finish-length', {
          finishReason,
          maxOutputTokens,
          messageCount: messages.length,
          outputTokens: totalUsage.outputTokens,
          rawFinishReason,
          requestId,
          stepCount: steps.length,
          textLength: text.length,
          totalTokens: totalUsage.totalTokens,
          userId,
        })
      },
      ...(mcpTools ? { stopWhen: stepCountIs(4), tools: mcpTools } : {}),
      system: getCompareSystemPrompt(context),
    }),
  }
}
