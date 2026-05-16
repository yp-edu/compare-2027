import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

export const vercelBlob = () =>
  vercelBlobStorage({
    enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    token: process.env.BLOB_READ_WRITE_TOKEN,
    collections: {
      media: true,
    },
    clientUploads: true,
  })
