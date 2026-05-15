import { admin, twoFactor } from 'better-auth/plugins'
import { defaultRoles } from 'better-auth/plugins/admin/access'
import { nextCookies } from 'better-auth/next-js'
import { betterAuthPlugin } from 'payload-auth/better-auth'
import type { BetterAuthOptions, PayloadAuthOptions } from 'payload-auth/better-auth'

import { adminPanelRoles, publicRoles } from '@/access'

const baseURL =
  process.env.VERCEL_ENV === 'production' && process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'
const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

const betterAuthPlugins = [
  admin({
    adminRoles: [...adminPanelRoles],
    defaultRole: 'user',
    roles: {
      admin: defaultRoles.admin,
      editor: defaultRoles.admin,
      user: defaultRoles.user,
    },
  }),
  twoFactor({
    issuer: 'Compare 2027',
  }),
  nextCookies(),
]

export const betterAuthOptions = {
  appName: 'Compare 2027',
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET || process.env.PAYLOAD_SECRET,
  trustedOrigins: [baseURL],
  emailAndPassword: {
    enabled: true,
  },
  ...(googleClientId && googleClientSecret
    ? {
        socialProviders: {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        },
      }
    : {}),
  plugins: betterAuthPlugins,
} satisfies BetterAuthOptions

export const betterAuthPluginOptions = {
  admin: {
    loginMethods:
      googleClientId && googleClientSecret ? ['emailPassword', 'google'] : ['emailPassword'],
  },
  betterAuthOptions,
  hidePluginCollections: true,
  users: {
    slug: 'users',
    hidden: false,
    adminRoles: [...adminPanelRoles],
    defaultRole: 'user',
    defaultAdminRole: 'admin',
    roles: [...publicRoles],
    allowedFields: ['name'],
    collectionOverrides: ({ collection }) => ({
      ...collection,
      fields: collection.fields.map((field) => {
        if ('name' in field && field.name === 'role') {
          return {
            ...field,
            saveToJWT: true,
          }
        }

        return field
      }),
    }),
  },
} satisfies PayloadAuthOptions

export type ConstructedBetterAuthPluginOptions = typeof betterAuthPluginOptions

export const payloadAuth = () => betterAuthPlugin(betterAuthPluginOptions)
