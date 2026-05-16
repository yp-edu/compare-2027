import { afterEach, describe, expect, it, vi } from 'vitest'

import { requireChatSession } from '@/features/ai/server/hooks/get-chat-session'

const getSession = vi.fn()
const findByID = vi.fn()

vi.mock('@/payload.config', () => ({
  default: {},
}))

vi.mock('payload-auth/better-auth', () => ({
  getPayloadAuth: vi.fn(async () => ({
    betterAuth: {
      api: {
        getSession,
      },
    },
  })),
}))

vi.mock('payload', () => ({
  getPayload: vi.fn(async () => ({
    findByID,
  })),
}))

describe('requireChatSession', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when the session user no longer exists', async () => {
    getSession.mockResolvedValue({
      user: {
        emailVerified: true,
        id: '123',
      },
    })

    findByID.mockImplementation(async ({ disableErrors }) => {
      if (!disableErrors) {
        throw new Error('Not found')
      }

      return null
    })

    await expect(requireChatSession(new Request('http://localhost'))).resolves.toBeNull()
    expect(findByID).toHaveBeenCalledWith({
      collection: 'users',
      depth: 0,
      disableErrors: true,
      id: '123',
    })
  })
})
