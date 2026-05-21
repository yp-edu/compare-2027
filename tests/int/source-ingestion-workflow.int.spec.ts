import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  completeSourceIngestion,
  failSourceIngestion,
  runSourceIngestion,
  startSourceIngestion,
} from '@/features/sources/server/process-source'
import {
  sourceIngestionTasks,
  sourceIngestionWorkflows,
} from '@/features/sources/server/ingestion-workflow'

vi.mock('@/features/sources/server/process-source', () => ({
  completeSourceIngestion: vi.fn(),
  failSourceIngestion: vi.fn(),
  runSourceIngestion: vi.fn(),
  startSourceIngestion: vi.fn(),
}))

describe('source ingestion workflow failures', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('lets the workflow record process task failures once', async () => {
    const error = new Error('source processing failed')
    const req = {}
    const workflow = sourceIngestionWorkflows[0]
    const workflowHandler = workflow.handler
    const tasks = {
      completeSourceIngestion: vi.mocked(completeSourceIngestion),
      processSourceIngestion: vi.fn().mockRejectedValueOnce(error),
      startSourceIngestion: vi.mocked(startSourceIngestion).mockResolvedValueOnce({
        ingestionJobID: 34,
        sourceID: 12,
      }),
    }

    if (typeof workflowHandler !== 'function') {
      throw new Error('Source ingestion workflow handler is not callable.')
    }

    await expect(
      workflowHandler({
        job: { input: { sourceID: 12 } },
        req,
        tasks,
      } as never),
    ).rejects.toThrow(error)

    expect(failSourceIngestion).toHaveBeenCalledTimes(1)
    expect(failSourceIngestion).toHaveBeenCalledWith({
      error,
      ingestionJobID: 34,
      req,
      sourceID: 12,
    })
  })

  it('does not record failures inside the process task handler', async () => {
    const error = new Error('source processing failed')
    const processTask = sourceIngestionTasks.find((task) => task.slug === 'processSourceIngestion')
    const processTaskHandler = processTask?.handler

    vi.mocked(runSourceIngestion).mockRejectedValueOnce(error)

    if (typeof processTaskHandler !== 'function') {
      throw new Error('Process source ingestion task handler is not callable.')
    }

    await expect(
      processTaskHandler({
        input: { ingestionJobID: 34, sourceID: 12 },
        req: {},
      } as never),
    ).rejects.toThrow(error)

    expect(failSourceIngestion).not.toHaveBeenCalled()
  })
})
