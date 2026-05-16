import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor, publishedOrAuthenticated } from '@/access'

export const Programs: CollectionConfig = {
  slug: 'programs',
  access: {
    create: isAdminOrEditor,
    delete: isAdmin,
    read: publishedOrAuthenticated,
    update: isAdminOrEditor,
  },
  admin: {
    defaultColumns: ['title', 'actor', 'programDate', '_status'],
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
      name: 'source',
      type: 'relationship',
      relationTo: 'sources',
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'programDate',
      type: 'date',
      index: true,
    },
    {
      name: 'summary',
      type: 'textarea',
    },
  ],
  versions: {
    drafts: true,
  },
}
