import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor, isAuthenticated } from '@/access'

export const CandidateSubmissions: CollectionConfig = {
  slug: 'candidate-submissions',
  labels: {
    singular: 'Candidate submission',
    plural: 'Candidate submissions',
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
        if (operation === 'create' && data) {
          data.status = 'pending'
          delete data.reviewNotes

          if (req.user) {
            data.submittedBy = req.user.id
          }
        }

        return data
      },
    ],
  },
  admin: {
    defaultColumns: ['candidateName', 'matchedCandidate', 'status', 'createdAt'],
    group: 'Moderation',
    useAsTitle: 'candidateName',
  },
  fields: [
    {
      name: 'candidateName',
      type: 'text',
      required: true,
    },
    {
      name: 'candidateDetails',
      type: 'textarea',
      admin: {
        description: 'Optional context supplied by the user for a newly declared candidate.',
      },
    },
    {
      name: 'matchedCandidate',
      type: 'relationship',
      relationTo: 'candidates',
    },
    {
      name: 'declarationSource',
      type: 'relationship',
      index: true,
      relationTo: 'sources',
      required: true,
    },
    {
      name: 'submittedBy',
      type: 'relationship',
      index: true,
      relationTo: 'users',
      required: true,
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
