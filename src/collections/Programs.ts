import type { CollectionConfig } from 'payload'

import { authenticatedReadPublished, isAdmin } from '@/access'

export const Programs: CollectionConfig = {
  slug: 'programs',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: authenticatedReadPublished,
    update: isAdmin,
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
      name: 'sources',
      type: 'array',
      admin: {
        description:
          'Structured source corpus for this programme. Use precise chapter or section sources when available.',
      },
      fields: [
        {
          name: 'source',
          type: 'relationship',
          relationTo: 'sources',
          required: true,
        },
        {
          name: 'role',
          type: 'select',
          defaultValue: 'supporting',
          options: [
            { label: 'Index', value: 'index' },
            { label: 'Chapter', value: 'chapter' },
            { label: 'Section', value: 'section' },
            { label: 'PDF', value: 'pdf' },
            { label: 'Manifesto', value: 'manifesto' },
            { label: 'Government declaration', value: 'government_declaration' },
            { label: 'Supporting', value: 'supporting' },
            { label: 'Archive', value: 'archive' },
            { label: 'Other', value: 'other' },
          ],
          required: true,
        },
        {
          name: 'notes',
          type: 'textarea',
        },
      ],
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
