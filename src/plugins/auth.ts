import { admin, twoFactor } from 'better-auth/plugins'
import { defaultRoles } from 'better-auth/plugins/admin/access'
import { nextCookies } from 'better-auth/next-js'
import { betterAuthPlugin } from 'payload-auth/better-auth'
import type { BetterAuthOptions, PayloadAuthOptions } from 'payload-auth/better-auth'

import { adminPanelRoles, publicRoles } from '@/access'
import { sendEmailVerificationEmail, sendPasswordResetEmail } from '@/features/email/server'
import { getAllowedOrigins, getServerURL } from '@/lib/server-urls'

const baseURL = getServerURL()
const trustedOrigins = getAllowedOrigins()
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
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: sendPasswordResetEmail,
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignIn: true,
    sendOnSignUp: true,
    sendVerificationEmail: sendEmailVerificationEmail,
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google', 'email-password'],
    },
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
