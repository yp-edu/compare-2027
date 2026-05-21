import { campaignParties } from './parties'
import type {
  CampaignCandidateEntry,
  CampaignCandidateSeed,
  CampaignPartySeed,
  CampaignProgramSeed,
  CampaignSourceSeed,
} from './types'
import { brunoRetailleauEntry } from './candidates/bruno-retailleau'
import { clementineAutainEntry } from './candidates/clementine-autain'
import { delphineBathoEntry } from './candidates/delphine-batho'
import { edouardPhilippeEntry } from './candidates/edouard-philippe'
import { francoisRuffinEntry } from './candidates/francois-ruffin'
import { jeanLucMelenchonEntry } from './candidates/jean-luc-melenchon'
import { nicolasDupontAignanEntry } from './candidates/nicolas-dupont-aignan'

const campaignEntries: CampaignCandidateEntry[] = [
  jeanLucMelenchonEntry,
  nicolasDupontAignanEntry,
  francoisRuffinEntry,
  clementineAutainEntry,
  delphineBathoEntry,
  edouardPhilippeEntry,
  brunoRetailleauEntry,
]

export const campaignCandidates: CampaignCandidateSeed[] = campaignEntries.map(
  (entry) => entry.candidate,
)
export const campaignSources: CampaignSourceSeed[] = campaignEntries.flatMap(
  (entry) => entry.sources,
)
export const campaignPrograms: CampaignProgramSeed[] = campaignEntries.flatMap(
  (entry) => entry.programs || [],
)
export { campaignParties }
export type { CampaignCandidateSeed, CampaignPartySeed, CampaignProgramSeed, CampaignSourceSeed }
