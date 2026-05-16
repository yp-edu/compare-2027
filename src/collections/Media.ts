import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor } from '@/access'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: isAdminOrEditor,
    delete: isAdmin,
    read: () => true,
    update: isAdminOrEditor,
  },
  admin: {
    group: 'Content',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}
