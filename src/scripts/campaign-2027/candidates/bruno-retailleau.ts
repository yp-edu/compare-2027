import type { CampaignCandidateEntry } from '../types'

export const brunoRetailleauEntry: CampaignCandidateEntry = {
  candidate: {
    bio: 'Bruno Retailleau est candidat déclaré à l’élection présidentielle française de 2027.',
    candidacySourceSlug: 'retailleau-2027-soutien-officiel',
    declaredAt: '2026-02-12T00:00:00.000Z',
    displayName: 'Bruno Retailleau',
    firstName: 'Bruno',
    lastName: 'Retailleau',
    partySlug: 'les-republicains',
    slug: 'bruno-retailleau',
    sortOrder: 7,
    website: 'https://www.avecretailleau.fr/',
  },
  sources: [
    {
      notes: 'Page officielle de soutien à la candidature de Bruno Retailleau.',
      platform: 'party_site',
      publishedAt: '2026-02-12T00:00:00.000Z',
      publisher: 'Avec Retailleau',
      quote:
        'Rejoignez celles et ceux qui soutiennent la candidature de Bruno Retailleau à l’élection présidentielle.',
      references: [
        {
          isPrimary: true,
          label: 'Page de soutien',
          url: 'https://www.avecretailleau.fr/soutien/',
        },
      ],
      slug: 'retailleau-2027-soutien-officiel',
      sourceRole: 'candidacy_declaration',
      title: 'Je soutiens Bruno Retailleau',
      type: 'candidacy_declaration',
    },
  ],
}
