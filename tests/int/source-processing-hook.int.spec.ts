import { describe, expect, it, vi } from 'vitest'

import { queueSourceIngestionAfterChange } from '@/features/sources/server/process-source'

function getHookArgs(args: {
  operation: 'create' | 'update'
  previousStatus?: string
  status: string
}) {
  const queue = vi.fn()

  return {
    args: {
      context: {},
      doc: {
        id: 12,
        processingStatus: args.status,
      },
      operation: args.operation,
      previousDoc: args.previousStatus
        ? {
            id: 12,
            processingStatus: args.previousStatus,
          }
        : undefined,
      req: {
        payload: {
          jobs: {
            queue,
          },
        },
      },
    },
    queue,
  }
}

describe('queueSourceIngestionAfterChange', () => {
  it('queues ingestion when a source is created as queued', async () => {
    const { args, queue } = getHookArgs({ operation: 'create', status: 'queued' })

    await queueSourceIngestionAfterChange(args as never)

    expect(queue).toHaveBeenCalledWith({
      input: {
        reason: 'sourceCreated',
        sourceID: 12,
      },
      queue: 'ingestion',
      req: args.req,
      workflow: 'ingestSource',
    })
  })

  it('queues ingestion when a source is moved to queued on update', async () => {
    const { args, queue } = getHookArgs({
      operation: 'update',
      previousStatus: 'skipped',
      status: 'queued',
    })

    await queueSourceIngestionAfterChange(args as never)

    expect(queue).toHaveBeenCalledWith({
      input: {
        reason: 'sourceQueued',
        sourceID: 12,
      },
      queue: 'ingestion',
      req: args.req,
      workflow: 'ingestSource',
    })
  })

  it('does not requeue unchanged queued source updates', async () => {
    const { args, queue } = getHookArgs({
      operation: 'update',
      previousStatus: 'queued',
      status: 'queued',
    })

    await queueSourceIngestionAfterChange(args as never)

    expect(queue).not.toHaveBeenCalled()
  })
})
