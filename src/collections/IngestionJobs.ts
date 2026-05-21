import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access'

export const IngestionJobs: CollectionConfig = {
  slug: 'ingestion-jobs',
  labels: {
    singular: 'Ingestion job',
    plural: 'Ingestion jobs',
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ['title', 'jobType', 'status', 'source', 'updatedAt'],
    group: 'Ingestion',
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'jobType',
      type: 'select',
      defaultValue: 'url',
      options: [
        { label: 'URL', value: 'url' },
        { label: 'Document', value: 'document' },
        { label: 'Social post', value: 'social_post' },
        { label: 'Vote import', value: 'vote_import' },
        { label: 'Scheduled crawl', value: 'scheduled_crawl' },
      ],
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'queued',
      index: true,
      options: [
        { label: 'Queued', value: 'queued' },
        { label: 'Running', value: 'running' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      required: true,
    },
    {
      name: 'inputReferences',
      type: 'array',
      admin: {
        description: 'Concrete references to ingest for this job, such as URLs or external IDs.',
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
          name: 'url',
          type: 'text',
          index: true,
        },
        {
          name: 'externalId',
          type: 'text',
          index: true,
        },
      ],
    },
    {
      name: 'source',
      type: 'relationship',
      relationTo: 'sources',
    },
    {
      name: 'submittedBy',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'attempts',
      type: 'number',
      defaultValue: 0,
      min: 0,
      required: true,
    },
    {
      name: 'priority',
      type: 'number',
      defaultValue: 0,
      index: true,
      required: true,
    },
    {
      name: 'lastRunAt',
      type: 'date',
    },
    {
      name: 'completedAt',
      type: 'date',
    },
    {
      name: 'errorMessage',
      type: 'textarea',
    },
    {
      name: 'metadata',
      type: 'json',
    },
  ],
}
