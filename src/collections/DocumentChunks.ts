import type { CollectionConfig } from 'payload'

import { authenticatedReadPublished, isAdmin } from '@/access'

export const DocumentChunks: CollectionConfig = {
  slug: 'document-chunks',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: authenticatedReadPublished,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ['title', 'source', 'chunkIndex', 'embeddingStatus', '_status'],
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
      name: 'document',
      type: 'relationship',
      index: true,
      relationTo: 'source-documents',
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
      relationTo: 'source-snapshots',
    },
    {
      name: 'chunkIndex',
      type: 'number',
      index: true,
      min: 0,
      required: true,
    },
    {
      name: 'text',
      type: 'textarea',
      required: true,
    },
    {
      name: 'sectionTitle',
      type: 'text',
    },
    {
      name: 'pageNumber',
      type: 'number',
      min: 1,
    },
    {
      name: 'charStart',
      type: 'number',
      min: 0,
    },
    {
      name: 'charEnd',
      type: 'number',
      min: 0,
    },
    {
      name: 'tokenCount',
      type: 'number',
      min: 0,
    },
    {
      name: 'embeddingStatus',
      type: 'select',
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Embedded', value: 'embedded' },
        { label: 'Failed', value: 'failed' },
        { label: 'Skipped', value: 'skipped' },
      ],
      required: true,
    },
    {
      name: 'embeddingModel',
      type: 'text',
    },
    {
      name: 'embedding',
      type: 'json',
      admin: {
        description: 'Temporary JSON storage until a dedicated vector index is introduced.',
      },
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
