import type { Access } from 'payload'

import { hasRole } from './roles'

export const authenticatedReadPublished: Access = ({ req }) => {
  if (hasRole(req, ['admin'])) {
    return true
  }

  if (!req.user) {
    return false
  }

  return {
    _status: {
      equals: 'published',
    },
  }
}
