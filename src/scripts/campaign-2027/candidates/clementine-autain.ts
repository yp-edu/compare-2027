import type { CampaignCandidateEntry } from '../types'

export const clementineAutainEntry: CampaignCandidateEntry = {
  candidate: {
    bio: 'Clémentine Autain est candidate déclarée à l’élection présidentielle française de 2027.',
    candidacySourceSlug: 'autain-2027-mon-manifeste',
    declaredAt: '2026-02-06T00:00:00.000Z',
    displayName: 'Clémentine Autain',
    firstName: 'Clémentine',
    lastName: 'Autain',
    partySlug: 'l-apres',
    slug: 'clementine-autain',
    sortOrder: 4,
    website: 'https://clementine-autain.fr/',
  },
  programs: [
    {
      actor: { relationTo: 'candidates', slug: 'clementine-autain' },
      programDate: '2026-02-06T00:00:00.000Z',
      slug: 'clementine-autain-la-vie-meilleure-2027',
      sources: [{ role: 'manifesto', sourceSlug: 'autain-2027-mon-manifeste' }],
      summary: 'Manifeste officiel de campagne présentant le projet « La vie meilleure ».',
      title: 'La vie meilleure - manifeste de campagne',
    },
  ],
  sources: [
    {
      notes: 'Manifeste publié sur le site officiel de Clémentine Autain.',
      platform: 'party_site',
      publishedAt: '2026-02-06T00:00:00.000Z',
      publisher: 'Clémentine Autain',
      quote:
        'Je veux représenter la gauche et les écologistes à l’élection présidentielle de 2027.',
      references: [
        {
          isPrimary: true,
          label: 'Mon manifeste',
          url: 'https://clementine-autain.fr/mon-manifeste/',
        },
      ],
      slug: 'autain-2027-mon-manifeste',
      sourceRole: 'manifesto',
      title: 'Mon manifeste - Clémentine Autain',
      type: 'official_program',
    },
  ],
}
