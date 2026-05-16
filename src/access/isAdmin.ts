import type { Access } from 'payload'

import { hasRole } from './roles'

export const isAdmin: Access = ({ req }) => hasRole(req, ['admin'])
