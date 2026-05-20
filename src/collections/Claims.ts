import type { CollectionConfig } from 'payload'

import { authenticatedReadPublished, isAdmin } from '@/access'

export const Claims: CollectionConfig = {
  slug: 'claims',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: authenticatedReadPublished,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ['title', 'actor', 'reviewStatus', 'positionDate', '_status'],
    group: 'Claims',
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'claimText',
      type: 'textarea',
      required: true,
    },
    {
      name: 'actor',
      type: 'relationship',
      index: true,
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
      name: 'primarySource',
      type: 'relationship',
      index: true,
      relationTo: 'sources',
      required: true,
    },
    {
      name: 'sourceSnapshot',
      type: 'relationship',
      relationTo: 'source-snapshots',
    },
    {
      name: 'sourceDocument',
      type: 'relationship',
      relationTo: 'source-documents',
    },
    {
      name: 'claimType',
      type: 'select',
      defaultValue: 'other',
      index: true,
      options: [
        { label: 'Program', value: 'program' },
        { label: 'Public position', value: 'public_position' },
        { label: 'Vote', value: 'vote' },
        { label: 'Promise', value: 'promise' },
        { label: 'Factual record', value: 'factual_record' },
        { label: 'Biography', value: 'biography' },
        { label: 'Criticism', value: 'criticism' },
        { label: 'Other', value: 'other' },
      ],
      required: true,
    },
    {
      name: 'stance',
      type: 'select',
      defaultValue: 'unclear',
      index: true,
      options: [
        { label: 'Proposes', value: 'proposes' },
        { label: 'Supports', value: 'supports' },
        { label: 'Opposes', value: 'opposes' },
        { label: 'Mixed', value: 'mixed' },
        { label: 'Vote for', value: 'vote_for' },
        { label: 'Vote against', value: 'vote_against' },
        { label: 'Abstention', value: 'abstention' },
        { label: 'Unclear', value: 'unclear' },
        { label: 'Not applicable', value: 'not_applicable' },
      ],
      required: true,
    },
    {
      name: 'evidenceQuote',
      type: 'textarea',
      admin: {
        description:
          'Primary quote used for quick review. Additional spans belong in claim evidence.',
      },
    },
    {
      name: 'positionDate',
      type: 'date',
      index: true,
    },
    {
      name: 'validFrom',
      type: 'date',
    },
    {
      name: 'validUntil',
      type: 'date',
    },
    {
      name: 'retrievedAt',
      type: 'date',
    },
    {
      name: 'reviewStatus',
      type: 'select',
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Reviewed', value: 'reviewed' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Disputed', value: 'disputed' },
      ],
      required: true,
    },
    {
      name: 'confidence',
      type: 'number',
      max: 1,
      min: 0,
    },
    {
      name: 'extractionMethod',
      type: 'select',
      defaultValue: 'manual',
      options: [
        { label: 'Manual', value: 'manual' },
        { label: 'LLM', value: 'llm' },
        { label: 'Crawler', value: 'crawler' },
        { label: 'Import', value: 'import' },
        { label: 'API', value: 'api' },
      ],
      required: true,
    },
    {
      name: 'lastVerifiedAt',
      type: 'date',
    },
    {
      name: 'rawExtraction',
      type: 'json',
    },
  ],
  versions: {
    drafts: true,
  },
}
