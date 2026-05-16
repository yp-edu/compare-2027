import { vercelAdapter } from '@flags-sdk/vercel'
import { flag } from 'flags/next'

const compareResponseFeedbackMetadata = {
  key: 'compare-response-feedback',
  defaultValue: false,
  description: 'Show thumbs up/down feedback controls for compare chat responses.',
  options: [
    { label: 'Disabled', value: false },
    { label: 'Enabled', value: true },
  ],
}

export const compareResponseFeedback = flag<boolean>(
  process.env.FLAGS
    ? {
        ...compareResponseFeedbackMetadata,
        adapter: vercelAdapter(),
      }
    : {
        ...compareResponseFeedbackMetadata,
        decide: () => false,
      },
)
