import { payloadAuth } from './auth'
import { mcp } from './mcp'
import { search } from './search'
import { vercelBlob } from './vercelBlob'

export const plugins = [payloadAuth(), vercelBlob(), search(), mcp()]
