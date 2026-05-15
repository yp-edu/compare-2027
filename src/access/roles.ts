import type { PayloadRequest } from 'payload'

export const adminRoles = ['admin'] as const
export const adminPanelRoles = ['admin', 'editor'] as const
export const publicRoles = ['user', 'editor', 'admin'] as const

export type UserRole = (typeof publicRoles)[number]

type UserWithRole = {
  role?: UserRole | UserRole[] | null
}

export function hasRole(req: PayloadRequest, roles: readonly UserRole[]) {
  const role = (req.user as UserWithRole | null | undefined)?.role

  if (!role) {
    return false
  }

  if (Array.isArray(role)) {
    return role.some((value) => roles.includes(value))
  }

  return roles.includes(role)
}
