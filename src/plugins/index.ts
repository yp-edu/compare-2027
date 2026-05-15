import { payloadAuth } from './auth'
import { search } from './search'
import { vercelBlob } from './vercelBlob'

export const plugins = [payloadAuth(), vercelBlob(), search()]
