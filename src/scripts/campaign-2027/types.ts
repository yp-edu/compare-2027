export type CampaignPartySeed = {
  color?: string
  description: string
  name: string
  shortName: string
  slug: string
  website?: string
}

export type CampaignSourceReferenceSeed = {
  externalId?: string
  isPrimary?: boolean
  kind?: 'url' | 'file' | 'archive' | 'institution_id' | 'manual' | 'other'
  label?: string
  notes?: string
  url?: string
}

export type CampaignSourceSeed = {
  notes?: string
  parentSourceSlug?: string
  platform?: 'party_site' | 'press' | 'institution' | 'other'
  publishedAt?: string
  publisher: string
  quote?: string
  rawMetadata?: Record<string, unknown>
  references: CampaignSourceReferenceSeed[]
  slug: string
  sourceRole?:
    | 'program_index'
    | 'program_chapter'
    | 'program_section'
    | 'manifesto'
    | 'candidacy_declaration'
    | 'speech'
    | 'interview'
    | 'supporting_document'
    | 'archive'
    | 'other'
  title: string
  type:
    | 'official_program'
    | 'speech'
    | 'interview'
    | 'press_release'
    | 'candidacy_declaration'
    | 'social_post'
    | 'vote'
    | 'article'
    | 'report'
    | 'other'
}

export type CampaignProgramSourceSeed = {
  notes?: string
  role:
    | 'index'
    | 'chapter'
    | 'section'
    | 'pdf'
    | 'manifesto'
    | 'government_declaration'
    | 'supporting'
    | 'archive'
    | 'other'
  sourceSlug: string
}

export type CampaignProgramSeed = {
  actor: {
    relationTo: 'candidates' | 'parties'
    slug: string
  }
  programDate?: string
  slug: string
  sources: CampaignProgramSourceSeed[]
  summary?: string
  title: string
}

export type CampaignCandidateSeed = {
  bio: string
  candidacySourceSlug: string
  declaredAt: string
  displayName: string
  firstName: string
  lastName: string
  partySlug: string
  slug: string
  sortOrder: number
  sourceSlugs?: string[]
  website?: string
}

export type CampaignCandidateEntry = {
  candidate: CampaignCandidateSeed
  programs?: CampaignProgramSeed[]
  sources: CampaignSourceSeed[]
}
