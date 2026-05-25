import type { CollectionConfig } from 'payload'

import { isAdmin, publishedOrAuthenticated } from '@/access'

export const Candidates: CollectionConfig = {
  slug: 'candidates',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: publishedOrAuthenticated,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ['displayName', 'candidacyStatus', 'currentParty', '_status'],
    group: 'Content',
    useAsTitle: 'displayName',
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'displayName',
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
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'currentParty',
      type: 'relationship',
      relationTo: 'parties',
    },
    {
      name: 'candidacyStatus',
      type: 'select',
      defaultValue: 'expected',
      options: [
        { label: 'Declared', value: 'declared' },
        { label: 'Expected', value: 'expected' },
        { label: 'Exploring', value: 'exploring' },
        { label: 'Withdrawn', value: 'withdrawn' },
        { label: 'Not candidate', value: 'not_candidate' },
      ],
      required: true,
    },
    {
      name: 'declarationSource',
      type: 'relationship',
      relationTo: 'sources',
      admin: {
        description: 'Primary source proving that the candidate has declared or changed status.',
      },
    },
    {
      name: 'declaredAt',
      type: 'date',
      index: true,
    },
    {
      name: 'website',
      type: 'text',
    },
    {
      name: 'bio',
      type: 'textarea',
    },
    {
      name: 'sources',
      type: 'relationship',
      hasMany: true,
      relationTo: 'sources',
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      index: true,
    },
  ],
  versions: {
    drafts: true,
  },
}
