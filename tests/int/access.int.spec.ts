import { describe, expect, it } from 'vitest'

import { authenticatedReadPublished } from '@/access/authenticatedReadPublished'
import { isAdminOrSelf } from '@/access/isAdminOrSelf'
import { CandidateSubmissions } from '@/collections/CandidateSubmissions'
import { ClaimFeedback } from '@/collections/ClaimFeedback'

const hookArgs = {
  collection: {},
  context: {},
  req: {},
} as Parameters<
  NonNullable<NonNullable<typeof CandidateSubmissions.hooks>['beforeValidate']>[number]
>[0]

describe('isAdminOrSelf', () => {
  it('restricts non-admin users to their own ID even when another ID is requested', () => {
    const access = isAdminOrSelf({
      id: 'other-user-id',
      req: {
        user: {
          id: 'current-user-id',
          role: 'user',
        },
      },
    } as unknown as Parameters<typeof isAdminOrSelf>[0])

    expect(access).toEqual({
      id: {
        equals: 'current-user-id',
      },
    })
  })
})

describe('authenticatedReadPublished', () => {
  it('rejects anonymous reads', () => {
    const access = authenticatedReadPublished({
      req: {},
    } as unknown as Parameters<typeof authenticatedReadPublished>[0])

    expect(access).toBe(false)
  })

  it('restricts authenticated non-admin users to published documents', () => {
    const access = authenticatedReadPublished({
      req: {
        user: {
          id: 'current-user-id',
          role: 'user',
        },
      },
    } as unknown as Parameters<typeof authenticatedReadPublished>[0])

    expect(access).toEqual({
      _status: {
        equals: 'published',
      },
    })
  })

  it('allows admins to bypass the published query', () => {
    const access = authenticatedReadPublished({
      req: {
        user: {
          id: 'admin-user-id',
          role: 'admin',
        },
      },
    } as unknown as Parameters<typeof authenticatedReadPublished>[0])

    expect(access).toBe(true)
  })
})

describe('moderated user submissions', () => {
  it('forces candidate submissions into pending review on create', async () => {
    const beforeValidate = CandidateSubmissions.hooks?.beforeValidate?.[0]

    const data = await beforeValidate?.({
      ...hookArgs,
      data: {
        candidateName: 'Candidate',
        reviewNotes: 'approve immediately',
        status: 'accepted',
      },
      operation: 'create',
    })

    expect(data).toMatchObject({ status: 'pending' })
    expect(data).not.toHaveProperty('reviewNotes')
  })

  it('forces claim feedback into pending review on create', async () => {
    const beforeValidate = ClaimFeedback.hooks?.beforeValidate?.[0]

    const data = await beforeValidate?.({
      ...hookArgs,
      data: {
        invalidatingSourceUrl: 'https://example.com',
        reviewNotes: 'approve immediately',
        status: 'accepted',
      },
      operation: 'create',
    })

    expect(data).toMatchObject({ status: 'pending' })
    expect(data).not.toHaveProperty('reviewNotes')
  })
})
