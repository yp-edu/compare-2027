import type { Access } from 'payload'

import { hasRole } from './roles'

export const publishedOrAuthenticated: Access = ({ req }) => {
  if (hasRole(req, ['admin', 'editor'])) {
    return true
  }

  return {
    _status: {
      equals: 'published',
    },
  }
}
