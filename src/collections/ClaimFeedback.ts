import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor, isAuthenticated } from '@/access'

export const ClaimFeedback: CollectionConfig = {
  slug: 'claim-feedback',
  labels: {
    singular: 'Claim feedback',
    plural: 'Claim feedback',
  },
  access: {
    create: isAuthenticated,
    delete: isAdmin,
    read: isAdminOrEditor,
    update: isAdminOrEditor,
  },
  hooks: {
    beforeValidate: [
      ({ data, operation, req }) => {
        if (operation === 'create' && req.user && data) {
          data.submittedBy = req.user.id
        }

        return data
      },
    ],
  },
  admin: {
    defaultColumns: ['claim', 'invalidatingSourceUrl', 'status', 'createdAt'],
    group: 'Moderation',
    useAsTitle: 'invalidatingSourceUrl',
  },
  fields: [
    {
      name: 'claim',
      type: 'relationship',
      index: true,
      relationTo: 'claims',
      required: true,
    },
    {
      name: 'invalidatingSourceUrl',
      type: 'text',
      required: true,
    },
    {
      name: 'invalidatingSource',
      type: 'relationship',
      relationTo: 'sources',
    },
    {
      name: 'submittedBy',
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
    },
    {
      name: 'answer',
      type: 'textarea',
    },
    {
      name: 'comment',
      type: 'textarea',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Duplicate', value: 'duplicate' },
      ],
      required: true,
    },
    {
      name: 'reviewNotes',
      type: 'textarea',
    },
  ],
}
