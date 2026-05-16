import { describe, expect, it } from 'vitest'

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
