import { afterEach, describe, expect, it, vi } from 'vitest'

import { GET } from '@/app/(frontend)/compare/citations/route'

const find = vi.hoisted(() => vi.fn())

vi.mock('@/features/ai/server', () => ({
  requireChatSession: vi.fn(async () => ({ user: { id: '123' } })),
}))

vi.mock('@/payload.config', () => ({
  default: {},
}))

vi.mock('payload', () => ({
  getPayload: vi.fn(async () => ({ find })),
}))

describe('compare citations route', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('adds program actor color metadata to direct source citations', async () => {
    find.mockImplementation(async ({ collection }) => {
      if (collection === 'sources') {
        return {
          docs: [
            {
              id: 10,
              references: [{ isPrimary: true, url: 'https://example.test/program' }],
              title: 'Programme officiel',
              verificationStatus: 'verified',
            },
          ],
        }
      }

      if (collection === 'programs') {
        return {
          docs: [
            {
              actor: {
                relationTo: 'candidates',
                value: {
                  currentParty: { color: '#123ABC' },
                  displayName: 'Candidate Example',
                },
              },
              sources: [{ source: 10 }],
            },
          ],
        }
      }

      return { docs: [] }
    })

    const response = await GET(new Request('http://localhost/compare/citations?sources=10'))

    await expect(response.json()).resolves.toEqual({
      claims: [],
      sources: [
        {
          actor: {
            color: '#123ABC',
            name: 'Candidate Example',
            type: 'candidates',
          },
          id: 10,
          platform: null,
          publishedAt: null,
          slug: null,
          title: 'Programme officiel',
          url: 'https://example.test/program',
          verificationStatus: 'verified',
        },
      ],
    })
  })
})
