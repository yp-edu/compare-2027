import config from '@payload-config'
import { toNextJsHandler } from 'better-auth/next-js'
import { getPayloadAuth } from 'payload-auth/better-auth'

import type { ConstructedBetterAuthPluginOptions } from '@/plugins/auth'

const payload = await getPayloadAuth<ConstructedBetterAuthPluginOptions>(config)

export const { GET, POST } = toNextJsHandler(payload.betterAuth)
