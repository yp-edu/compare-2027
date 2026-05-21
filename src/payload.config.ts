import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { collections } from './collections'
import { endpoints } from './endpoints'
import {
  sourceIngestionTasks,
  sourceIngestionWorkflows,
} from './features/sources/server/ingestion-workflow'
import { globals } from './globals'
import { getAllowedOrigins, getServerURL } from './lib/server-urls'
import { plugins } from './plugins'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const serverURL = getServerURL()
const allowedOrigins = getAllowedOrigins()

export default buildConfig({
  admin: {
    user: 'users',
    components: {
      beforeDashboard: ['@/components/admin/seed-button#SeedButton'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections,
  globals,
  cors: allowedOrigins,
  csrf: allowedOrigins,
  editor: lexicalEditor(),
  endpoints,
  email: resendAdapter({
    defaultFromAddress: 'noreply@compare2027.fr',
    defaultFromName: 'Compare 2027',
    apiKey: process.env.RESEND_API_KEY || '',
  }),
  serverURL,
  jobs: {
    addParentToTaskLog: true,
    enableConcurrencyControl: true,
    tasks: sourceIngestionTasks,
    workflows: sourceIngestionWorkflows,
  },
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
    },
    push: false,
  }),
  sharp,
  plugins,
})
