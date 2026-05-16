import type { Access } from 'payload'

import { hasRole } from './roles'

export const isAdminOrSelf: Access = ({ req }) => {
  if (hasRole(req, ['admin'])) {
    return true
  }

  if (!req.user) {
    return false
  }

  return {
    id: {
      equals: req.user.id,
    },
  }
}
