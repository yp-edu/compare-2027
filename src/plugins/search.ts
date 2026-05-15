import { searchPlugin } from '@payloadcms/plugin-search'
import type { BeforeSync } from '@payloadcms/plugin-search/types'

const searchableCollections = [
  'parties',
  'candidates',
  'topics',
  'programs',
  'proposals',
  'public-positions',
]

const getSearchTitle = (collectionSlug: string, doc: Record<string, unknown>) => {
  if (collectionSlug === 'candidates' && typeof doc.displayName === 'string') {
    return doc.displayName
  }

  if (collectionSlug === 'parties' && typeof doc.name === 'string') {
    return doc.name
  }

  if (collectionSlug === 'topics' && typeof doc.title === 'string') {
    return doc.title
  }

  return typeof doc.title === 'string' ? doc.title : 'Untitled'
}

const getSearchExcerpt = (doc: Record<string, unknown>) => {
  for (const field of ['summary', 'description', 'bio', 'quote'] as const) {
    const value = doc[field]

    if (typeof value === 'string' && value.trim().length > 0) {
      return value
    }
  }

  return undefined
}

const beforeSync: BeforeSync = ({ collectionSlug, originalDoc, searchDoc }) => ({
  ...searchDoc,
  collectionSlug,
  excerpt: getSearchExcerpt(originalDoc),
  title: getSearchTitle(collectionSlug, originalDoc),
})

export const search = () =>
  searchPlugin({
    beforeSync,
    collections: searchableCollections,
    defaultPriorities: {
      candidates: 30,
      parties: 25,
      topics: 20,
      proposals: 15,
      programs: 10,
      'public-positions': 10,
    },
    searchOverrides: {
      admin: {
        group: 'System',
      },
      fields: ({ defaultFields }) => [
        ...defaultFields,
        {
          name: 'collectionSlug',
          type: 'text',
          index: true,
        },
        {
          name: 'excerpt',
          type: 'textarea',
        },
      ],
    },
  })
