import type { CampaignCandidateEntry } from '../types'

export const edouardPhilippeEntry: CampaignCandidateEntry = {
  candidate: {
    bio: 'Édouard Philippe est candidat déclaré à l’élection présidentielle française de 2027.',
    candidacySourceSlug: 'philippe-2027-reponse-ruffin',
    declaredAt: '2025-06-12T00:00:00.000Z',
    displayName: 'Édouard Philippe',
    firstName: 'Édouard',
    lastName: 'Philippe',
    partySlug: 'horizons',
    slug: 'edouard-philippe',
    sortOrder: 6,
    sourceSlugs: ['horizons-pole-idees', 'horizons-home-publications'],
    website: 'https://horizonsleparti.fr/',
  },
  programs: [
    {
      actor: { relationTo: 'candidates', slug: 'edouard-philippe' },
      slug: 'edouard-philippe-horizons-corpus-idees',
      sources: [
        { role: 'index', sourceSlug: 'horizons-pole-idees' },
        { role: 'supporting', sourceSlug: 'horizons-home-publications' },
        { role: 'supporting', sourceSlug: 'philippe-2027-reponse-ruffin' },
      ],
      summary:
        'Corpus officiel Horizons de publications et travaux du pôle Idées, en attendant un programme présidentiel complet publié pour 2027.',
      title: 'Corpus programmatique Horizons - Édouard Philippe',
    },
  ],
  sources: [
    {
      notes: 'Article publié sur le site officiel du parti Horizons.',
      platform: 'party_site',
      publishedAt: '2025-06-12T00:00:00.000Z',
      publisher: 'Horizons',
      quote:
        'Mais en tant que candidat à l’élection présidentielle, je veux comme vous terminer sur du positif.',
      references: [
        {
          isPrimary: true,
          label: 'Réponse à François Ruffin',
          url: 'https://horizonsleparti.fr/reponse-ruffin',
        },
      ],
      slug: 'philippe-2027-reponse-ruffin',
      sourceRole: 'candidacy_declaration',
      title: 'Le prix de nos mensonges : ma réponse à François Ruffin',
      type: 'candidacy_declaration',
    },
    {
      platform: 'party_site',
      publisher: 'Horizons',
      references: [
        {
          isPrimary: true,
          label: 'Le pôle Idées',
          url: 'https://horizonsleparti.fr/le-pole-idees/',
        },
      ],
      slug: 'horizons-pole-idees',
      sourceRole: 'program_index',
      title: 'Le pôle Idées - Horizons',
      type: 'official_program',
    },
    {
      platform: 'party_site',
      publisher: 'Horizons',
      references: [
        { isPrimary: true, label: 'Publications Horizons', url: 'https://horizonsleparti.fr/' },
      ],
      slug: 'horizons-home-publications',
      sourceRole: 'supporting_document',
      title: 'Horizons - publications et manifeste',
      type: 'official_program',
    },
  ],
}
