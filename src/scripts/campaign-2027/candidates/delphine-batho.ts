import type { CampaignCandidateEntry } from '../types'

export const delphineBathoEntry: CampaignCandidateEntry = {
  candidate: {
    bio: 'Delphine Batho est candidate déclarée à l’élection présidentielle française de 2027.',
    candidacySourceSlug: 'batho-2027-candidature-generation-ecologie',
    declaredAt: '2025-11-26T00:00:00.000Z',
    displayName: 'Delphine Batho',
    firstName: 'Delphine',
    lastName: 'Batho',
    partySlug: 'generation-ecologie',
    slug: 'delphine-batho',
    sortOrder: 5,
    sourceSlugs: ['generation-ecologie-notre-projet'],
    website: 'https://www.delphinebatho.fr/',
  },
  programs: [
    {
      actor: { relationTo: 'candidates', slug: 'delphine-batho' },
      slug: 'delphine-batho-generation-ecologie-projet',
      sources: [
        { role: 'index', sourceSlug: 'generation-ecologie-notre-projet' },
        { role: 'supporting', sourceSlug: 'batho-2027-candidature-generation-ecologie' },
      ],
      summary:
        'Corpus officiel Génération Écologie et déclaration de candidature, en attendant un programme présidentiel complet publié pour 2027.',
      title: 'Projet écologiste en construction - Delphine Batho',
    },
  ],
  sources: [
    {
      notes: 'Annonce officielle publiée par Génération Écologie.',
      platform: 'party_site',
      publishedAt: '2025-11-26T00:00:00.000Z',
      publisher: 'Génération Écologie',
      quote:
        'Dans un entretien au Nouvel Obs qui paraît ce jeudi, Delphine Batho annonce que Génération Écologie a choisi de présenter sa candidature à l’élection présidentielle.',
      references: [
        {
          isPrimary: true,
          label: 'Annonce Génération Écologie',
          url: 'https://www.generationecologie.fr/2025/11/26/je-suis-candidate-a-lelection-presidentielle-pour-reconstruire-une-ecologie-capable-de-gouverner/',
        },
      ],
      slug: 'batho-2027-candidature-generation-ecologie',
      sourceRole: 'candidacy_declaration',
      title:
        'Je suis candidate à l’élection présidentielle pour reconstruire une écologie capable de gouverner',
      type: 'candidacy_declaration',
    },
    {
      platform: 'party_site',
      publisher: 'Génération Écologie',
      references: [
        {
          isPrimary: true,
          label: 'Notre projet',
          url: 'https://www.generationecologie.fr/a-propos/generation-ecologie/notre-projet/',
        },
      ],
      slug: 'generation-ecologie-notre-projet',
      sourceRole: 'program_index',
      title: 'Notre projet - Génération Écologie',
      type: 'official_program',
    },
  ],
}
