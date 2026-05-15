import type { Access } from 'payload'

import { hasRole } from './roles'

export const isAdminOrSelf: Access = ({ id, req }) => {
  if (hasRole(req, ['admin'])) {
    return true
  }

  if (!req.user) {
    return false
  }

  return {
    id: {
      equals: id ?? req.user.id,
    },
  }
}
