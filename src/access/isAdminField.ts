import type { FieldAccess } from 'payload'

import { hasRole } from './roles'

export const isAdminField: FieldAccess = ({ req }) => hasRole(req, ['admin'])
