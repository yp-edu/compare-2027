import type { CampaignCandidateEntry } from '../types'

export const francoisRuffinEntry: CampaignCandidateEntry = {
  candidate: {
    bio: 'François Ruffin est candidat déclaré à l’élection présidentielle française de 2027.',
    candidacySourceSlug: 'ruffin-2027-campaign-home',
    declaredAt: '2026-01-23T00:00:00.000Z',
    displayName: 'François Ruffin',
    firstName: 'François',
    lastName: 'Ruffin',
    partySlug: 'debout',
    slug: 'francois-ruffin',
    sortOrder: 3,
    sourceSlugs: ['ruffin-2027-pour-le-travail', 'ruffin-2027-pour-qui-je-me-bats'],
    website: 'https://nouspresident.fr/',
  },
  programs: [
    {
      actor: { relationTo: 'candidates', slug: 'francois-ruffin' },
      programDate: '2026-01-23T00:00:00.000Z',
      slug: 'francois-ruffin-nous-president-2027',
      sources: [
        { role: 'index', sourceSlug: 'ruffin-2027-campaign-home' },
        { role: 'section', sourceSlug: 'ruffin-2027-pour-le-travail' },
        { role: 'manifesto', sourceSlug: 'ruffin-2027-pour-qui-je-me-bats' },
      ],
      summary:
        'Corpus officiel de campagne Nous Président, organisé autour des premières propositions et de pages thématiques.',
      title: 'Nous Président - propositions de campagne 2027',
    },
  ],
  sources: [
    {
      notes: 'Site officiel de campagne édité par Debout !.',
      platform: 'party_site',
      publishedAt: '2026-01-23T00:00:00.000Z',
      publisher: 'Nous Président !',
      quote:
        'Je suis candidat pour les millions de travailleurs qui, dans les usines, les bureaux, les écoles, les hôpitaux, tiennent la France debout.',
      references: [
        { isPrimary: true, label: 'Accueil de campagne', url: 'https://nouspresident.fr/' },
      ],
      slug: 'ruffin-2027-campaign-home',
      sourceRole: 'program_index',
      title: 'François Ruffin 2027 - Nous Président !',
      type: 'official_program',
    },
    {
      platform: 'party_site',
      publishedAt: '2026-04-15T00:00:00.000Z',
      publisher: 'Nous Président !',
      references: [
        {
          isPrimary: true,
          label: 'Page thématique travail',
          url: 'https://nouspresident.fr/pour-le-travail/',
        },
      ],
      slug: 'ruffin-2027-pour-le-travail',
      sourceRole: 'program_section',
      title: 'Pour le travail - Ruffin 2027',
      type: 'official_program',
    },
    {
      platform: 'party_site',
      publishedAt: '2026-01-27T00:00:00.000Z',
      publisher: 'Nous Président !',
      references: [
        {
          isPrimary: true,
          label: 'Texte de campagne',
          url: 'https://nouspresident.fr/pour-qui-je-me-bats/',
        },
      ],
      slug: 'ruffin-2027-pour-qui-je-me-bats',
      sourceRole: 'manifesto',
      title: 'Pour qui je me bats ? - Ruffin 2027',
      type: 'official_program',
    },
  ],
}
