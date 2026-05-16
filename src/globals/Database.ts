import type { GlobalConfig } from 'payload'

export const Database: GlobalConfig = {
  slug: 'database',
  fields: [
    {
      name: 'seeded',
      type: 'checkbox',
      defaultValue: false,
      required: true,
    },
  ],
}
