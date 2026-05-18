import type { CollectionConfig } from 'payload'

import { authenticatedReadPublished, isAdmin } from '@/access'

export const SourceDocuments: CollectionConfig = {
  slug: 'source-documents',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: authenticatedReadPublished,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ['title', 'source', 'parser', 'parsedAt', '_status'],
    group: 'Ingestion',
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'source',
      type: 'relationship',
      index: true,
      relationTo: 'sources',
      required: true,
    },
    {
      name: 'snapshot',
      type: 'relationship',
      index: true,
      relationTo: 'source-snapshots',
    },
    {
      name: 'parser',
      type: 'select',
      defaultValue: 'manual',
      options: [
        { label: 'Manual', value: 'manual' },
        { label: 'HTML', value: 'html' },
        { label: 'PDF', value: 'pdf' },
        { label: 'Social post', value: 'social_post' },
        { label: 'Vote import', value: 'vote_import' },
        { label: 'Other', value: 'other' },
      ],
      required: true,
    },
    {
      name: 'language',
      type: 'text',
      defaultValue: 'fr',
      required: true,
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
    },
    {
      name: 'summary',
      type: 'textarea',
    },
    {
      name: 'wordCount',
      type: 'number',
      min: 0,
    },
    {
      name: 'parsedAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      index: true,
      required: true,
    },
    {
      name: 'metadata',
      type: 'json',
    },
  ],
  versions: {
    drafts: true,
  },
}
