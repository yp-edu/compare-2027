import { Candidates } from './Candidates'
import { CandidateSubmissions } from './CandidateSubmissions'
import { ClaimEvidence } from './ClaimEvidence'
import { ClaimFeedback } from './ClaimFeedback'
import { Claims } from './Claims'
import { DocumentChunks } from './DocumentChunks'
import { IngestionJobs } from './IngestionJobs'
import { Media } from './Media'
import { Parties } from './Parties'
import { Programs } from './Programs'
import { Proposals } from './Proposals'
import { PublicPositions } from './PublicPositions'
import { Sources } from './Sources'
import { SourceDocuments } from './SourceDocuments'
import { SourceSnapshots } from './SourceSnapshots'
import { Topics } from './Topics'
import { ResponseFeedback } from '../features/feedback/collections/ResponseFeedback'

export const collections = [
  Media,
  Sources,
  SourceSnapshots,
  SourceDocuments,
  DocumentChunks,
  IngestionJobs,
  Parties,
  Candidates,
  CandidateSubmissions,
  Topics,
  Claims,
  ClaimEvidence,
  ClaimFeedback,
  Programs,
  Proposals,
  PublicPositions,
  ResponseFeedback,
]
