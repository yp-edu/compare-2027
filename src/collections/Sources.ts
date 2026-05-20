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
      'type',
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
      name: 'externalId',
      type: 'text',
      index: true,
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
