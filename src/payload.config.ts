import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { collections } from './collections'
import { globals } from './globals'
import { seed } from './init/seed'
import { plugins } from './plugins'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const serverURL =
  process.env.VERCEL_ENV === 'production' && process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'
const allowedOrigins = [serverURL].filter(Boolean)

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections,
  globals,
  cors: allowedOrigins,
  csrf: allowedOrigins,
  editor: lexicalEditor(),
  email: resendAdapter({
    defaultFromAddress: 'noreply@compare2027.fr',
    defaultFromName: 'Compare 2027',
    apiKey: process.env.RESEND_API_KEY || '',
  }),
  serverURL,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
    },
  }),
  onInit: async (payload) => {
    await seed(payload)
  },
  sharp,
  plugins,
})
