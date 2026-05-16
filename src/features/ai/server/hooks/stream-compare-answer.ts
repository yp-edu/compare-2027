import { openai } from '@ai-sdk/openai'
import { convertToModelMessages, streamText, type UIMessage } from 'ai'

import { getCompareSystemPrompt } from './get-compare-system-prompt'
import { getComparisonContext } from './get-comparison-context'

type StreamCompareAnswerArgs = {
  messages: UIMessage[]
}

export async function streamCompareAnswer({ messages }: StreamCompareAnswerArgs) {
  const context = await getComparisonContext()
  const modelName = process.env.AI_CHAT_MODEL || 'gpt-4.1-mini'

  return streamText({
    maxOutputTokens: 900,
    messages: await convertToModelMessages(messages),
    model: openai(modelName),
    system: getCompareSystemPrompt(context),
    temperature: 0.2,
  })
}
