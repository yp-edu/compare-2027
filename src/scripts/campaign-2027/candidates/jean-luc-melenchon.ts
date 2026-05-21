import type { CampaignCandidateEntry, CampaignSourceSeed } from '../types'

const programmeBase = 'https://melenchon2027.fr/programme2025/livre'

const programmeChapters: CampaignSourceSeed[] = [
  [
    'melenchon-laec-2025-introduction',
    'Introduction : Vers une nouvelle France',
    `${programmeBase}/introduction/`,
  ],
  [
    'melenchon-laec-2025-revolution-citoyenne',
    'Faire la révolution citoyenne',
    `${programmeBase}/faire-la-revolution-citoyenne/`,
  ],
  [
    'melenchon-laec-2025-chapitre-1',
    'Chapitre 1 : Le pouvoir au peuple',
    `${programmeBase}/chapitre1/`,
  ],
  [
    'melenchon-laec-2025-chapitre-2',
    'Chapitre 2 : Par delà la propriété privée',
    `${programmeBase}/chapitre2/`,
  ],
  [
    'melenchon-laec-2025-chapitre-3',
    'Chapitre 3 : Citoyens dans l’entreprise et dans la ville',
    `${programmeBase}/chapitre3/`,
  ],
  [
    'melenchon-laec-2025-chapitre-4',
    'Chapitre 4 : Étendre le domaine de la liberté',
    `${programmeBase}/chapitre4/`,
  ],
  [
    'melenchon-laec-2025-harmonie-humains',
    'L’harmonie des êtres humains entre eux',
    `${programmeBase}/l-harmonie-des-etres-humains-entre-eux/`,
  ],
  [
    'melenchon-laec-2025-chapitre-5',
    'Chapitre 5 : Élever le niveau d’instruction',
    `${programmeBase}/chapitre5/`,
  ],
  [
    'melenchon-laec-2025-chapitre-6',
    'Chapitre 6 : Partage des richesses',
    `${programmeBase}/chapitre6/`,
  ],
  [
    'melenchon-laec-2025-chapitre-7',
    'Chapitre 7 : La force de l’entraide',
    `${programmeBase}/chapitre7/`,
  ],
  [
    'melenchon-laec-2025-chapitre-8',
    'Chapitre 8 : Travailler tous, travailler moins, travailler mieux',
    `${programmeBase}/chapitre8/`,
  ],
  [
    'melenchon-laec-2025-chapitre-9',
    'Chapitre 9 : Produire nous-mêmes pour répondre aux besoins',
    `${programmeBase}/chapitre9/`,
  ],
  [
    'melenchon-laec-2025-chapitre-10',
    'Chapitre 10 : Faire place à la nouvelle France',
    `${programmeBase}/chapitre10/`,
  ],
  [
    'melenchon-laec-2025-chapitre-11',
    'Chapitre 11 : Humaniser par la culture et le sport',
    `${programmeBase}/chapitre11/`,
  ],
  [
    'melenchon-laec-2025-harmonie-nature',
    'L’harmonie des êtres humains avec la nature',
    `${programmeBase}/l-harmonie-des-etres-humains-avec-la-nature/`,
  ],
  [
    'melenchon-laec-2025-chapitre-12',
    'Chapitre 12 : Planification écologique',
    `${programmeBase}/chapitre12/`,
  ],
  [
    'melenchon-laec-2025-chapitre-13',
    'Chapitre 13 : Les grands chantiers de la bifurcation écologique',
    `${programmeBase}/chapitre13/`,
  ],
  [
    'melenchon-laec-2025-chapitre-14',
    'Chapitre 14 : Protection des biens communs et des droits de l’espèce',
    `${programmeBase}/chapitre14/`,
  ],
  [
    'melenchon-laec-2025-chapitre-15',
    'Chapitre 15 : Une approche de santé globale',
    `${programmeBase}/chapitre15/`,
  ],
  [
    'melenchon-laec-2025-ordonner-le-monde',
    'Ordonner le monde',
    `${programmeBase}/ordonner-le-monde/`,
  ],
  [
    'melenchon-laec-2025-chapitre-16',
    'Chapitre 16 : Une diplomatie altermondialiste pour la paix',
    `${programmeBase}/chapitre16/`,
  ],
  ['melenchon-laec-2025-chapitre-17', 'Chapitre 17 : Europe', `${programmeBase}/chapitre17/`],
  [
    'melenchon-laec-2025-chapitre-18',
    'Chapitre 18 : Nouvelles frontières de l’humanité',
    `${programmeBase}/chapitre18/`,
  ],
].map(([slug, title, url]) => ({
  parentSourceSlug: 'melenchon-laec-2025-index',
  platform: 'party_site',
  publisher: 'Mélenchon 2027',
  references: [{ isPrimary: true, label: title, url }],
  slug,
  sourceRole: 'program_chapter',
  title: `L’avenir en commun 2025 - ${title}`,
  type: 'official_program',
}))

export const jeanLucMelenchonEntry: CampaignCandidateEntry = {
  candidate: {
    bio: 'Jean-Luc Mélenchon est candidat déclaré à l’élection présidentielle française de 2027.',
    candidacySourceSlug: 'melenchon-2027-lettre-au-peuple',
    declaredAt: '2026-05-05T00:00:00.000Z',
    displayName: 'Jean-Luc Mélenchon',
    firstName: 'Jean-Luc',
    lastName: 'Mélenchon',
    partySlug: 'la-france-insoumise',
    slug: 'jean-luc-melenchon',
    sortOrder: 1,
    sourceSlugs: ['melenchon-laec-2025-index', ...programmeChapters.map((source) => source.slug)],
    website: 'https://melenchon2027.fr/',
  },
  programs: [
    {
      actor: { relationTo: 'candidates', slug: 'jean-luc-melenchon' },
      programDate: '2025-07-01T00:00:00.000Z',
      slug: 'jean-luc-melenchon-avenir-en-commun-2025',
      sources: [
        { role: 'index', sourceSlug: 'melenchon-laec-2025-index' },
        ...programmeChapters.map((source) => ({
          role: 'chapter' as const,
          sourceSlug: source.slug,
        })),
      ],
      summary:
        'Corpus officiel L’avenir en commun édition 2025, structuré en table des matières, parties, chapitres et sous-parties contributives.',
      title: 'L’avenir en commun - édition 2025',
    },
  ],
  sources: [
    {
      notes: 'Page officielle de campagne éditée par La France insoumise.',
      platform: 'party_site',
      publishedAt: '2026-05-05T00:00:00.000Z',
      publisher: 'Mélenchon 2027',
      quote: 'Tournons la page. C’est le sens de ma candidature à l’élection présidentielle.',
      references: [
        {
          isPrimary: true,
          label: 'Lettre au peuple de France',
          url: 'https://melenchon2027.fr/lettre-au-peuple-de-france/',
        },
      ],
      slug: 'melenchon-2027-lettre-au-peuple',
      sourceRole: 'candidacy_declaration',
      title: 'Lettre au peuple de France - Mélenchon 2027',
      type: 'candidacy_declaration',
    },
    {
      notes: 'Table des matières officielle du programme, utilisée comme racine de corpus.',
      platform: 'party_site',
      publisher: 'Mélenchon 2027',
      rawMetadata: {
        crawl: {
          allowedPathPrefixes: ['/programme2025/livre/'],
          enabled: true,
          maxDepth: 3,
        },
      },
      references: [{ isPrimary: true, label: 'Table des matières', url: `${programmeBase}/` }],
      slug: 'melenchon-laec-2025-index',
      sourceRole: 'program_index',
      title: 'L’avenir en commun édition 2025 - Table des matières',
      type: 'official_program',
    },
    ...programmeChapters,
  ],
}
