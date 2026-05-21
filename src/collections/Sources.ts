import type { CollectionConfig } from 'payload'

import { authenticatedReadPublished, isAdmin, isAdminField } from '@/access'
import { processSourceAfterChange } from '@/features/sources/server/process-source'

export const Sources: CollectionConfig = {
  slug: 'sources',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: authenticatedReadPublished,
    update: isAdmin,
  },
  hooks: {
    afterChange: [processSourceAfterChange],
  },
  admin: {
    defaultColumns: [
      'title',
      'slug',
      'type',
      'sourceRole',
      'publisher',
      'publishedAt',
      'processingStatus',
      'verificationStatus',
    ],
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
      name: 'type',
      type: 'select',
      defaultValue: 'other',
      options: [
        { label: 'Official program', value: 'official_program' },
        { label: 'Speech', value: 'speech' },
        { label: 'Interview', value: 'interview' },
        { label: 'Press release', value: 'press_release' },
        { label: 'Candidacy declaration', value: 'candidacy_declaration' },
        { label: 'Social post', value: 'social_post' },
        { label: 'Vote', value: 'vote' },
        { label: 'Article', value: 'article' },
        { label: 'Report', value: 'report' },
        { label: 'Other', value: 'other' },
      ],
      required: true,
    },
    {
      name: 'sourceRole',
      type: 'select',
      defaultValue: 'other',
      index: true,
      options: [
        { label: 'Program index', value: 'program_index' },
        { label: 'Program chapter', value: 'program_chapter' },
        { label: 'Program section', value: 'program_section' },
        { label: 'Manifesto', value: 'manifesto' },
        { label: 'Candidacy declaration', value: 'candidacy_declaration' },
        { label: 'Speech', value: 'speech' },
        { label: 'Interview', value: 'interview' },
        { label: 'Supporting document', value: 'supporting_document' },
        { label: 'Archive', value: 'archive' },
        { label: 'Other', value: 'other' },
      ],
      required: true,
    },
    {
      name: 'parentSource',
      type: 'relationship',
      index: true,
      relationTo: 'sources',
      admin: {
        description: 'Parent source for structured corpora, such as a programme index.',
      },
    },
    {
      name: 'platform',
      type: 'select',
      defaultValue: 'other',
      options: [
        { label: 'Party or candidate site', value: 'party_site' },
        { label: 'X', value: 'x' },
        { label: 'Assemblée nationale', value: 'assemblee' },
        { label: 'Datan', value: 'datan' },
        { label: 'Press', value: 'press' },
        { label: 'Institution', value: 'institution' },
        { label: 'Other', value: 'other' },
      ],
      required: true,
    },
    {
      name: 'references',
      type: 'array',
      admin: {
        description:
          'Concrete locations or identifiers for this source. A source may combine several URLs, files, archives, or institutional references.',
      },
      fields: [
        {
          name: 'kind',
          type: 'select',
          defaultValue: 'url',
          options: [
            { label: 'URL', value: 'url' },
            { label: 'File', value: 'file' },
            { label: 'Archive URL', value: 'archive' },
            { label: 'Institutional identifier', value: 'institution_id' },
            { label: 'Manual reference', value: 'manual' },
            { label: 'Other', value: 'other' },
          ],
          required: true,
        },
        {
          name: 'label',
          type: 'text',
        },
        {
          name: 'url',
          type: 'text',
          index: true,
        },
        {
          name: 'canonicalUrl',
          type: 'text',
          index: true,
        },
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'externalId',
          type: 'text',
          index: true,
        },
        {
          name: 'isPrimary',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'notes',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'relatedCandidates',
      type: 'relationship',
      hasMany: true,
      index: true,
      relationTo: 'candidates',
      admin: {
        description: 'Candidates this source is expected to support or invalidate claims for.',
      },
    },
    {
      name: 'submittedBy',
      type: 'relationship',
      relationTo: 'users',
      access: {
        read: isAdminField,
      },
    },
    {
      name: 'submissionStatus',
      type: 'select',
      defaultValue: 'internal',
      index: true,
      options: [
        { label: 'Internal', value: 'internal' },
        { label: 'Submitted', value: 'submitted' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Rejected', value: 'rejected' },
      ],
      required: true,
      access: {
        read: isAdminField,
      },
    },
    {
      name: 'processingStatus',
      type: 'select',
      defaultValue: 'queued',
      index: true,
      options: [
        { label: 'Queued', value: 'queued' },
        { label: 'Processing', value: 'processing' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
        { label: 'Skipped', value: 'skipped' },
      ],
      required: true,
      access: {
        read: isAdminField,
      },
    },
    {
      name: 'processedAt',
      type: 'date',
      access: {
        read: isAdminField,
      },
    },
    {
      name: 'processingError',
      type: 'textarea',
      access: {
        read: isAdminField,
      },
    },
    {
      name: 'llmModel',
      type: 'text',
      access: {
        read: isAdminField,
      },
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
      name: 'lastFetchedAt',
      type: 'date',
    },
    {
      name: 'contentHash',
      type: 'text',
      index: true,
    },
    {
      name: 'fetchStatus',
      type: 'select',
      defaultValue: 'not_fetched',
      options: [
        { label: 'Not fetched', value: 'not_fetched' },
        { label: 'Fetched', value: 'fetched' },
        { label: 'Failed', value: 'failed' },
        { label: 'Skipped', value: 'skipped' },
      ],
      required: true,
    },
    {
      name: 'fetchError',
      type: 'textarea',
      access: {
        read: isAdminField,
      },
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
      access: {
        read: isAdminField,
      },
      admin: {
        description: 'Internal notes about verification, context, or caveats.',
      },
    },
    {
      name: 'rawMetadata',
      type: 'json',
      access: {
        read: isAdminField,
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
