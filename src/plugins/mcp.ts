import { mcpPlugin } from '@payloadcms/plugin-mcp'

const readOnly = {
  create: false,
  delete: false,
  find: true,
  update: false,
} as const

const mcpCollections = {
  candidates: {
    description: 'Published presidential candidates available for political comparisons.',
    enabled: readOnly,
  },
  'claim-evidence': {
    description: 'Published evidence quotes and source locators that support structured claims.',
    enabled: readOnly,
  },
  claims: {
    description:
      'Published structured political claims extracted from programs, positions, votes, and documents.',
    enabled: readOnly,
  },
  'document-chunks': {
    description: 'Published chunks of parsed source documents used for retrieval and citations.',
    enabled: readOnly,
  },
  parties: {
    description: 'Published parties and political movements available for comparisons.',
    enabled: readOnly,
  },
  programs: {
    description: 'Published program records connected to candidates, parties, and sources.',
    enabled: readOnly,
  },
  proposals: {
    description: 'Published curated proposals connected to actors, topics, and sources.',
    enabled: readOnly,
  },
  'public-positions': {
    description: 'Published public positions connected to actors, topics, dates, and sources.',
    enabled: readOnly,
  },
  'source-documents': {
    description: 'Published parsed source documents used to create chunks and claims.',
    enabled: readOnly,
  },
  sources: {
    description: 'Published source metadata, URLs, publication dates, and verification status.',
    enabled: readOnly,
  },
  topics: {
    description: 'Published topic taxonomy used to filter and compare political claims.',
    enabled: readOnly,
  },
}

function toCamelCase(value: string) {
  return value.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
}

export function getCompareMcpApiKeyPermissions() {
  const permissions: Record<string, { find: true }> = {}

  for (const collection of Object.keys(mcpCollections)) {
    permissions[toCamelCase(collection)] = { find: true }
  }

  return permissions
}

export const mcp = () =>
  mcpPlugin({
    collections: mcpCollections,
    mcp: {
      serverOptions: {
        serverInfo: {
          name: 'Compare 2027 Payload MCP',
          version: '1.0.0',
        },
      },
    },
  })
