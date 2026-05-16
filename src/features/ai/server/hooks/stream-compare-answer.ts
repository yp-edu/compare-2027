import { createAzure } from '@ai-sdk/azure'
import { convertToModelMessages, streamText, type UIMessage } from 'ai'

import { getCompareSystemPrompt } from './get-compare-system-prompt'
import { getComparisonContext } from './get-comparison-context'

type StreamCompareAnswerArgs = {
  messages: UIMessage[]
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

export async function streamCompareAnswer({ messages }: StreamCompareAnswerArgs) {
  const context = await getComparisonContext()

  return streamText({
    maxOutputTokens: 900,
    messages: await convertToModelMessages(messages),
    model: getAzureOpenAIModel(),
    system: getCompareSystemPrompt(context),
    temperature: 0.2,
  })
}
