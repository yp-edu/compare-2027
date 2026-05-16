import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor, publishedOrAuthenticated } from '@/access'

export const Proposals: CollectionConfig = {
  slug: 'proposals',
  access: {
    create: isAdminOrEditor,
    delete: isAdmin,
    read: publishedOrAuthenticated,
    update: isAdminOrEditor,
  },
  admin: {
    defaultColumns: ['title', 'actor', 'proposalStatus', '_status'],
    group: 'Content',
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      index: true,
      required: true,
      unique: true,
    },
    {
      name: 'actor',
      type: 'relationship',
      relationTo: ['candidates', 'parties'],
      required: true,
    },
    {
      name: 'topics',
      type: 'relationship',
      hasMany: true,
      relationTo: 'topics',
      required: true,
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
    },
    {
      name: 'details',
      type: 'textarea',
    },
    {
      name: 'sources',
      type: 'relationship',
      hasMany: true,
      relationTo: 'sources',
      required: true,
    },
    {
      name: 'proposalStatus',
      type: 'select',
      defaultValue: 'announced',
      options: [
        { label: 'Announced', value: 'announced' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Changed', value: 'changed' },
        { label: 'Withdrawn', value: 'withdrawn' },
        { label: 'Unclear', value: 'unclear' },
      ],
      required: true,
    },
    {
      name: 'publishedAt',
      type: 'date',
      index: true,
    },
    {
      name: 'lastVerifiedAt',
      type: 'date',
    },
  ],
  versions: {
    drafts: true,
  },
}
