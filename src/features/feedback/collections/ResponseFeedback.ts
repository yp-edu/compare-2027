import type { Access, CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor } from '@/access'

const isAuthenticated: Access = ({ req }) => Boolean(req.user)

export const ResponseFeedback: CollectionConfig = {
  slug: 'response-feedback',
  labels: {
    singular: 'Response feedback',
    plural: 'Response feedback',
  },
  access: {
    create: isAuthenticated,
    delete: isAdmin,
    read: isAdminOrEditor,
    update: isAdminOrEditor,
  },
  admin: {
    defaultColumns: ['rating', 'user', 'createdAt'],
    group: 'Product',
    useAsTitle: 'rating',
  },
  fields: [
    {
      name: 'rating',
      type: 'select',
      options: [
        { label: 'Helpful', value: 'helpful' },
        { label: 'Not helpful', value: 'not_helpful' },
      ],
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      index: true,
      relationTo: 'users',
      required: true,
    },
    {
      name: 'messageId',
      type: 'text',
      index: true,
    },
    {
      name: 'question',
      type: 'textarea',
      required: true,
    },
    {
      name: 'answer',
      type: 'textarea',
      required: true,
    },
    {
      name: 'comment',
      type: 'textarea',
      admin: {
        description: 'Optional free-text feedback for later UI iterations.',
      },
    },
  ],
}
