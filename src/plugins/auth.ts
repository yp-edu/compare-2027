import { admin, twoFactor } from 'better-auth/plugins'
import { APIError } from 'better-auth/api'
import { defaultRoles } from 'better-auth/plugins/admin/access'
import { nextCookies } from 'better-auth/next-js'
import { betterAuthPlugin } from 'payload-auth/better-auth'
import type { BetterAuthOptions, PayloadAuthOptions } from 'payload-auth/better-auth'

import { adminPanelRoles, publicRoles } from '@/access'
import { sendEmailVerificationEmail, sendPasswordResetEmail } from '@/features/email/server'
import { createLegalConsentAudit } from '@/features/legal/server'
import { getAllowedHosts, getAllowedOrigins, getServerURL } from '@/lib/server-urls'

const baseURL = getServerURL()
const authBaseURL: BetterAuthOptions['baseURL'] = process.env.VERCEL
  ? {
      allowedHosts: getAllowedHosts(),
      fallback: baseURL,
      protocol: 'https',
    }
  : baseURL
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

type AuthHookContext = {
  body?: Record<string, unknown>
  headers?: Headers
  path?: string
  query?: Record<string, unknown>
  request?: Request
  context?: {
    adapter?: {
      count: (args: {
        model: string
        where: { field: string; operator: 'eq'; value: string }[]
      }) => Promise<number>
    }
    headers?: Headers
    request?: Request
  }
}

function getAuthHookHeaders(ctx: AuthHookContext | undefined) {
  return (
    ctx?.headers || ctx?.request?.headers || ctx?.context?.headers || ctx?.context?.request?.headers
  )
}

function isEmailPasswordSignup(ctx: AuthHookContext | undefined) {
  return ctx?.path?.startsWith('/sign-up/email') || typeof ctx?.body?.password === 'string'
}

function hasAcceptedLegalConsent(ctx: AuthHookContext | undefined) {
  return ctx?.body?.legalConsentAccepted === true || ctx?.body?.legalConsentAccepted === 'true'
}

function getStringValue(value: unknown) {
  if (typeof value === 'string') {
    return value
  }

  if (Array.isArray(value) && typeof value[0] === 'string') {
    return value[0]
  }

  return null
}

function getAdminInviteToken(ctx: AuthHookContext | undefined) {
  const additionalData = ctx?.body?.additionalData

  return (
    ctx?.headers?.get('x-admin-invite-token') ||
    getStringValue(ctx?.query?.adminInviteToken) ||
    getStringValue(ctx?.body?.adminInviteToken) ||
    (typeof additionalData === 'object' && additionalData
      ? getStringValue((additionalData as Record<string, unknown>).adminInviteToken)
      : null)
  )
}

async function isValidAdminInviteSignup(ctx: AuthHookContext | undefined) {
  const adminInviteToken = getAdminInviteToken(ctx)
  const adapter = ctx?.context?.adapter

  if (!adminInviteToken || !adapter) {
    return false
  }

  const count = await adapter.count({
    model: 'admin-invitations',
    where: [
      {
        field: 'token',
        operator: 'eq',
        value: adminInviteToken,
      },
    ],
  })

  return count > 0
}

export const betterAuthOptions = {
  appName: 'Compare 2027',
  baseURL: authBaseURL,
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
  user: {
    additionalFields: {
      legalConsentAcceptedAt: {
        type: 'string',
        required: false,
        returned: true,
        input: false,
      },
      legalConsentVersion: {
        type: 'string',
        required: false,
        returned: true,
        input: false,
      },
      legalConsentIpHash: {
        type: 'string',
        required: false,
        returned: false,
        input: false,
      },
      legalConsentUserAgent: {
        type: 'string',
        required: false,
        returned: false,
        input: false,
      },
      legalConsentProviderIds: {
        type: 'string',
        required: false,
        returned: false,
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          const hookContext = ctx as AuthHookContext | undefined

          if (!isEmailPasswordSignup(hookContext)) {
            return { data: user }
          }

          if (await isValidAdminInviteSignup(hookContext)) {
            return { data: user }
          }

          if (!hasAcceptedLegalConsent(hookContext)) {
            throw new APIError('BAD_REQUEST', {
              message: 'legal_consent_required',
            })
          }

          return {
            data: {
              ...user,
              ...createLegalConsentAudit(getAuthHookHeaders(hookContext), ['email-password']),
            },
          }
        },
      },
    },
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

        if (
          'name' in field &&
          field.type === 'text' &&
          [
            'legalConsentAcceptedAt',
            'legalConsentVersion',
            'legalConsentIpHash',
            'legalConsentUserAgent',
            'legalConsentProviderIds',
          ].includes(field.name)
        ) {
          return {
            ...field,
            admin: {
              ...field.admin,
              readOnly: true,
            },
          }
        }

        return field
      }),
    }),
  },
} satisfies PayloadAuthOptions

export type ConstructedBetterAuthPluginOptions = typeof betterAuthPluginOptions

export const payloadAuth = () => betterAuthPlugin(betterAuthPluginOptions)
