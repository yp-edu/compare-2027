import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor, publishedOrAuthenticated } from '@/access'

export const Sources: CollectionConfig = {
  slug: 'sources',
  access: {
    create: isAdminOrEditor,
    delete: isAdmin,
    read: publishedOrAuthenticated,
    update: isAdminOrEditor,
  },
  admin: {
    defaultColumns: ['title', 'type', 'publisher', 'publishedAt', 'verificationStatus'],
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
      name: 'type',
      type: 'select',
      defaultValue: 'other',
      options: [
        { label: 'Official program', value: 'official_program' },
        { label: 'Speech', value: 'speech' },
        { label: 'Interview', value: 'interview' },
        { label: 'Press release', value: 'press_release' },
        { label: 'Vote', value: 'vote' },
        { label: 'Article', value: 'article' },
        { label: 'Report', value: 'report' },
        { label: 'Other', value: 'other' },
      ],
      required: true,
    },
    {
      name: 'url',
      type: 'text',
    },
    {
      name: 'archivedUrl',
      type: 'text',
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'publisher',
      type: 'text',
    },
    {
      name: 'publishedAt',
      type: 'date',
      index: true,
    },
    {
      name: 'retrievedAt',
      type: 'date',
    },
    {
      name: 'language',
      type: 'text',
      defaultValue: 'fr',
    },
    {
      name: 'quote',
      type: 'textarea',
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about verification, context, or caveats.',
      },
    },
    {
      name: 'verificationStatus',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Verified', value: 'verified' },
        { label: 'Disputed', value: 'disputed' },
        { label: 'Archived', value: 'archived' },
      ],
      required: true,
    },
  ],
  versions: {
    drafts: true,
  },
}
