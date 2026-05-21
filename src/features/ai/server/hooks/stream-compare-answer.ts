import { createAzure } from '@ai-sdk/azure'
import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from 'ai'

import { getCompareMCPTools } from './get-compare-mcp-tools'
import { getCompareSystemPrompt } from './get-compare-system-prompt'
import { getComparisonContext } from './get-comparison-context'

type StreamCompareAnswerArgs = {
  messages: UIMessage[]
  userId: number
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

export async function streamCompareAnswer({ messages, userId }: StreamCompareAnswerArgs) {
  const [context, mcpTools] = await Promise.all([
    getComparisonContext(),
    getCompareMCPTools(userId),
  ])

  return streamText({
    maxOutputTokens: 900,
    messages: await convertToModelMessages(messages),
    model: getAzureOpenAIModel(),
    ...(mcpTools ? { stopWhen: stepCountIs(4), tools: mcpTools } : {}),
    system: getCompareSystemPrompt(context),
    temperature: 0.2,
  })
}
