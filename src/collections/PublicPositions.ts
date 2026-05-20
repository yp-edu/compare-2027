import type { CollectionConfig } from 'payload'

import { authenticatedReadPublished, isAdmin } from '@/access'

export const PublicPositions: CollectionConfig = {
  slug: 'public-positions',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: authenticatedReadPublished,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ['title', 'actor', 'positionType', 'positionDate', '_status'],
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
      name: 'source',
      type: 'relationship',
      relationTo: 'sources',
      required: true,
    },
    {
      name: 'positionDate',
      type: 'date',
      index: true,
    },
    {
      name: 'positionType',
      type: 'select',
      defaultValue: 'other',
      options: [
        { label: 'Speech', value: 'speech' },
        { label: 'Interview', value: 'interview' },
        { label: 'Vote', value: 'vote' },
        { label: 'Social post', value: 'social_post' },
        { label: 'Press release', value: 'press_release' },
        { label: 'Debate', value: 'debate' },
        { label: 'Other', value: 'other' },
      ],
      required: true,
    },
    {
      name: 'quote',
      type: 'textarea',
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
    },
    {
      name: 'stance',
      type: 'select',
      defaultValue: 'unclear',
      options: [
        { label: 'Supports', value: 'supports' },
        { label: 'Opposes', value: 'opposes' },
        { label: 'Mixed', value: 'mixed' },
        { label: 'Unclear', value: 'unclear' },
        { label: 'Not applicable', value: 'not_applicable' },
      ],
      required: true,
    },
  ],
  versions: {
    drafts: true,
  },
}
