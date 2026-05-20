import { describe, expect, it } from 'vitest'

import { authenticatedReadPublished } from '@/access/authenticatedReadPublished'
import { isAdminOrSelf } from '@/access/isAdminOrSelf'

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
