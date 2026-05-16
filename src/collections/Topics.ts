import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor, publishedOrAuthenticated } from '@/access'

export const Topics: CollectionConfig = {
  slug: 'topics',
  access: {
    create: isAdminOrEditor,
    delete: isAdmin,
    read: publishedOrAuthenticated,
    update: isAdminOrEditor,
  },
  admin: {
    defaultColumns: ['title', 'parent', 'order', '_status'],
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
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'topics',
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      index: true,
    },
    {
      name: 'color',
      type: 'text',
    },
  ],
  versions: {
    drafts: true,
  },
}
