import type { CollectionConfig } from 'payload'

import { authenticatedReadPublished, isAdmin } from '@/access'

export const ClaimEvidence: CollectionConfig = {
  slug: 'claim-evidence',
  labels: {
    singular: 'Claim evidence',
    plural: 'Claim evidence',
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: authenticatedReadPublished,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ['title', 'claim', 'source', 'reviewStatus', '_status'],
    group: 'Claims',
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'claim',
      type: 'relationship',
      index: true,
      relationTo: 'claims',
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
      name: 'document',
      type: 'relationship',
      relationTo: 'source-documents',
    },
    {
      name: 'chunk',
      type: 'relationship',
      relationTo: 'document-chunks',
    },
    {
      name: 'quote',
      type: 'textarea',
      required: true,
    },
    {
      name: 'sourceUrl',
      type: 'text',
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
      name: 'confidence',
      type: 'number',
      max: 1,
      min: 0,
    },
    {
      name: 'reviewStatus',
      type: 'select',
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Reviewed', value: 'reviewed' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Disputed', value: 'disputed' },
      ],
      required: true,
    },
    {
      name: 'notes',
      type: 'textarea',
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
