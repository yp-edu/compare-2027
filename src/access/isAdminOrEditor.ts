import type { Access } from 'payload'

import { hasRole } from './roles'

export const isAdminOrEditor: Access = ({ req }) => hasRole(req, ['admin', 'editor'])
