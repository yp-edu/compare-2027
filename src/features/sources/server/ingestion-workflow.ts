import type { TaskConfig, WorkflowConfig } from 'payload'

import {
  completeSourceIngestion,
  failSourceIngestion,
  runSourceIngestion,
  startSourceIngestion,
} from './process-source'

type SourceIngestionInput = {
  reason?: null | string
  sourceID: number
}

type StartSourceIngestionOutput = {
  ingestionJobID: number
  sourceID: number
}

type ProcessSourceIngestionOutput = Awaited<ReturnType<typeof runSourceIngestion>>

type SourceIngestionTaskFunctions = {
  completeSourceIngestion: (
    taskID: string,
    args: {
      input: SourceIngestionInput & {
        ingestionJobID: number
        result: ProcessSourceIngestionOutput
      }
    },
  ) => Promise<{ completed: boolean }>
  processSourceIngestion: (
    taskID: string,
    args: { input: SourceIngestionInput & { ingestionJobID: number } },
  ) => Promise<ProcessSourceIngestionOutput>
  startSourceIngestion: (
    taskID: string,
    args: { input: SourceIngestionInput },
  ) => Promise<StartSourceIngestionOutput>
}

function getNumber(value: unknown) {
  const number = Number(value)

  return Number.isInteger(number) && number > 0 ? number : null
}

function getSourceIngestionInput(value: unknown): SourceIngestionInput {
  if (!value || typeof value !== 'object') {
    throw new Error('Source ingestion input is invalid.')
  }

  const record = value as Record<string, unknown>
  const sourceID = getNumber(record.sourceID)

  if (!sourceID) {
    throw new Error('Source ingestion input requires a sourceID.')
  }

  return {
    reason: typeof record.reason === 'string' ? record.reason : undefined,
    sourceID,
  }
}

type SourceIngestionTask = {
  input: object
  output: object
}

export const sourceIngestionTasks: TaskConfig<SourceIngestionTask>[] = [
  {
    handler: async ({ input, req }) => {
      const sourceInput = getSourceIngestionInput(input)
      const output = await startSourceIngestion({
        reason: sourceInput.reason,
        req,
        sourceID: sourceInput.sourceID,
      })

      return { output }
    },
    inputSchema: [
      { name: 'sourceID', type: 'number', required: true },
      { name: 'reason', type: 'text' },
    ],
    label: 'Start source ingestion',
    outputSchema: [
      { name: 'sourceID', type: 'number', required: true },
      { name: 'ingestionJobID', type: 'number', required: true },
    ],
    slug: 'startSourceIngestion',
  },
  {
    handler: async ({ input, req }) => {
      const sourceInput = getSourceIngestionInput(input)

      const output = await runSourceIngestion({ req, sourceID: sourceInput.sourceID })

      return { output }
    },
    inputSchema: [
      { name: 'sourceID', type: 'number', required: true },
      { name: 'ingestionJobID', type: 'number', required: true },
      { name: 'reason', type: 'text' },
    ],
    label: 'Process source ingestion',
    outputSchema: [
      { name: 'contentHash', type: 'text', required: true },
      { name: 'createdClaimsCount', type: 'number', required: true },
      { name: 'discoveredSourceIds', type: 'json' },
      { name: 'fetchedAt', type: 'date', required: true },
      { name: 'modelName', type: 'text' },
      { name: 'results', type: 'json' },
    ],
    slug: 'processSourceIngestion',
  },
  {
    handler: async ({ input, req }) => {
      const sourceInput = getSourceIngestionInput(input)
      const record = input as Record<string, unknown>
      const ingestionJobID = getNumber(record.ingestionJobID)
      const result = record.result as ProcessSourceIngestionOutput | undefined

      if (!ingestionJobID || !result) {
        throw new Error('Source ingestion completion input is invalid.')
      }

      await completeSourceIngestion({
        ingestionJobID,
        req,
        result,
        sourceID: sourceInput.sourceID,
      })

      return { output: { completed: true } }
    },
    inputSchema: [
      { name: 'sourceID', type: 'number', required: true },
      { name: 'ingestionJobID', type: 'number', required: true },
      { name: 'result', type: 'json', required: true },
      { name: 'reason', type: 'text' },
    ],
    label: 'Complete source ingestion',
    outputSchema: [{ name: 'completed', type: 'checkbox', required: true }],
    slug: 'completeSourceIngestion',
  },
]

export const sourceIngestionWorkflows: WorkflowConfig<SourceIngestionInput>[] = [
  {
    concurrency: {
      key: ({ input }) => {
        const sourceInput = getSourceIngestionInput(input)

        return `source:${sourceInput.sourceID}`
      },
      supersedes: true,
    },
    handler: async ({ job, req, tasks }) => {
      const input = getSourceIngestionInput(job.input)
      const taskFunctions = tasks as unknown as SourceIngestionTaskFunctions
      let ingestionJobID: null | number = null

      try {
        const started = await taskFunctions.startSourceIngestion('start', { input })
        ingestionJobID = started.ingestionJobID
        const result = await taskFunctions.processSourceIngestion('process', {
          input: { ...input, ingestionJobID },
        })

        await taskFunctions.completeSourceIngestion('complete', {
          input: { ...input, ingestionJobID, result },
        })
      } catch (error) {
        await failSourceIngestion({
          error,
          ingestionJobID,
          req,
          sourceID: input.sourceID,
        })
        throw error
      }
    },
    inputSchema: [
      { name: 'sourceID', type: 'number', required: true },
      { name: 'reason', type: 'text' },
    ],
    label: 'Ingest source',
    queue: 'ingestion',
    slug: 'ingestSource',
  },
]
