import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access'

export const SourceSnapshots: CollectionConfig = {
  slug: 'source-snapshots',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ['title', 'source', 'fetchStatus', 'fetchedAt'],
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
      name: 'url',
      type: 'text',
      required: true,
    },
    {
      name: 'canonicalUrl',
      type: 'text',
      index: true,
    },
    {
      name: 'externalId',
      type: 'text',
      index: true,
    },
    {
      name: 'contentHash',
      type: 'text',
      index: true,
    },
    {
      name: 'fetchStatus',
      type: 'select',
      defaultValue: 'fetched',
      index: true,
      options: [
        { label: 'Fetched', value: 'fetched' },
        { label: 'Failed', value: 'failed' },
        { label: 'Skipped', value: 'skipped' },
      ],
      required: true,
    },
    {
      name: 'httpStatus',
      type: 'number',
    },
    {
      name: 'contentType',
      type: 'text',
    },
    {
      name: 'fetchedAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      index: true,
      required: true,
    },
    {
      name: 'rawContent',
      type: 'textarea',
      admin: {
        description: 'Raw fetched text or serialized payload kept for audit and re-parsing.',
      },
    },
    {
      name: 'metadata',
      type: 'json',
    },
  ],
}
