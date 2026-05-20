export type CampaignPartySeed = {
  color?: string
  description: string
  name: string
  shortName: string
  slug: string
  website?: string
}

export type CampaignSourceSeed = {
  notes?: string
  platform?: 'party_site' | 'press' | 'institution' | 'other'
  publishedAt?: string
  publisher: string
  quote: string
  title: string
  type: 'candidacy_declaration'
  url: string
}

export type CampaignCandidateSeed = {
  bio: string
  candidacySource: CampaignSourceSeed
  declaredAt: string
  displayName: string
  firstName: string
  lastName: string
  partySlug: string
  slug: string
  sortOrder: number
  website?: string
}

const cnccepBaseURL = 'https://www.cnccep.fr'

const legacy2022DeclarationPaths = [
  '/pdfs/Candidat-01-Nathalie-Arthaud-Declaration.pdf',
  '/pdfs/Candidat-02-Nicolas-Dupont-Aignan-Declaration-accessible.pdf',
  '/pdfs/Candidat-03-Anne-Hidalgo-Declaration.pdf',
  '/pdfs/Candidat-04-Yannick-Jadot-Declaration-accessible.pdf',
  '/pdfs/Candidat-05-Jean-Lassalle-Declaration.pdf',
  '/pdfs/Candidat-06-Marine-Le-Pen-Declaration-accessible.pdf',
  '/pdfs/Candidat-07-Emmanuel-Macron-Declaration.pdf',
  '/pdfs/Candidat-08-Jean-Luc-Melenchon-Declaration-accessible.pdf',
  '/pdfs/Candidat-09-Valerie-Pecresse-Declaration-accessible.pdf',
  '/pdfs/Candidat-10-Philippe-Poutou-Declaration.pdf',
  '/pdfs/Candidat-11-Fabien-Roussel-Declaration-accessible.pdf',
  '/pdfs/Candidat-12-Eric-Zemmour-Declaration.pdf',
]

export const legacy2022SourceURLs = [
  `${cnccepBaseURL}/candidats.html`,
  ...legacy2022DeclarationPaths.map((path) => `${cnccepBaseURL}${path}`),
]

export const legacy2022CandidateSlugs = [
  'nathalie-arthaud',
  'anne-hidalgo',
  'yannick-jadot',
  'jean-lassalle',
  'marine-le-pen',
  'emmanuel-macron',
  'valerie-pecresse',
  'philippe-poutou',
  'fabien-roussel',
  'eric-zemmour',
]

export const legacy2022PartySlugs = [
  'lutte-ouvriere',
  'parti-socialiste',
  'europe-ecologie-les-verts',
  'resistons',
  'rassemblement-national',
  'la-republique-en-marche',
  'nouveau-parti-anticapitaliste',
  'parti-communiste-francais',
  'reconquete',
]

export const campaignParties: CampaignPartySeed[] = [
  {
    color: '#7B13D6',
    description: 'Mouvement de Jean-Luc Mélenchon pour l’élection présidentielle 2027.',
    name: 'La France insoumise',
    shortName: 'LFI',
    slug: 'la-france-insoumise',
    website: 'https://lafranceinsoumise.fr/',
  },
  {
    color: '#0087CD',
    description: 'Mouvement de Nicolas Dupont-Aignan pour l’élection présidentielle 2027.',
    name: 'Debout la France',
    shortName: 'DLF',
    slug: 'debout-la-france',
    website: 'https://www.debout-la-france.fr/',
  },
  {
    color: '#E94545',
    description:
      'Mouvement politique fondé par François Ruffin pour la campagne présidentielle 2027.',
    name: 'Debout !',
    shortName: 'Debout !',
    slug: 'debout',
    website: 'https://debout.fr/',
  },
  {
    color: '#D24F9A',
    description: 'Mouvement cofondé par Clémentine Autain.',
    name: 'L’Après',
    shortName: 'L’Après',
    slug: 'l-apres',
    website: 'https://www.apres2024.fr/',
  },
  {
    color: '#31A64A',
    description: 'Parti de Delphine Batho pour l’élection présidentielle 2027.',
    name: 'Génération Écologie',
    shortName: 'GE',
    slug: 'generation-ecologie',
    website: 'https://www.generationecologie.fr/',
  },
  {
    color: '#00A3E0',
    description: 'Parti d’Édouard Philippe pour l’élection présidentielle 2027.',
    name: 'Horizons',
    shortName: 'Horizons',
    slug: 'horizons',
    website: 'https://horizonsleparti.fr/',
  },
  {
    color: '#034EA2',
    description: 'Parti de Bruno Retailleau pour l’élection présidentielle 2027.',
    name: 'Les Républicains',
    shortName: 'LR',
    slug: 'les-republicains',
    website: 'https://www.avecretailleau.fr/',
  },
]

export const campaignCandidates: CampaignCandidateSeed[] = [
  {
    bio: 'Jean-Luc Mélenchon est candidat déclaré à l’élection présidentielle française de 2027.',
    candidacySource: {
      notes: 'Page officielle de campagne éditée par La France insoumise.',
      platform: 'party_site',
      publishedAt: '2026-05-05T00:00:00.000Z',
      publisher: 'Mélenchon 2027',
      quote: 'Tournons la page. C’est le sens de ma candidature à l’élection présidentielle.',
      title: 'Lettre au peuple de France - Mélenchon 2027',
      type: 'candidacy_declaration',
      url: 'https://melenchon2027.fr/lettre-au-peuple-de-france/',
    },
    declaredAt: '2026-05-05T00:00:00.000Z',
    displayName: 'Jean-Luc Mélenchon',
    firstName: 'Jean-Luc',
    lastName: 'Mélenchon',
    partySlug: 'la-france-insoumise',
    slug: 'jean-luc-melenchon',
    sortOrder: 1,
    website: 'https://melenchon2027.fr/',
  },
  {
    bio: 'Nicolas Dupont-Aignan est candidat déclaré à l’élection présidentielle française de 2027.',
    candidacySource: {
      notes: 'Article officiel de Debout la France reprenant son discours de candidature.',
      platform: 'party_site',
      publishedAt: '2025-09-25T00:00:00.000Z',
      publisher: 'Debout la France',
      quote:
        'Nicolas Dupont-Aignan, président de Debout la France, a officiellement annoncé, ce samedi 8 mars, sa candidature à l’élection présidentielle de 2027.',
      title:
        'Je suis candidat pour rendre le pouvoir aux Français et rendre sa liberté à la France !',
      type: 'candidacy_declaration',
      url: 'https://www.debout-la-france.fr/actualite/je-suis-candidat-pour/',
    },
    declaredAt: '2025-03-08T00:00:00.000Z',
    displayName: 'Nicolas Dupont-Aignan',
    firstName: 'Nicolas',
    lastName: 'Dupont-Aignan',
    partySlug: 'debout-la-france',
    slug: 'nicolas-dupont-aignan',
    sortOrder: 2,
    website: 'https://www.dupontaignan.fr/',
  },
  {
    bio: 'François Ruffin est candidat déclaré à l’élection présidentielle française de 2027.',
    candidacySource: {
      notes: 'Site officiel de campagne édité par Debout !.',
      platform: 'party_site',
      publishedAt: '2026-01-23T00:00:00.000Z',
      publisher: 'Nous Président !',
      quote:
        'Je suis candidat pour les millions de travailleurs qui, dans les usines, les bureaux, les écoles, les hôpitaux, tiennent la France debout.',
      title: 'François Ruffin 2027',
      type: 'candidacy_declaration',
      url: 'https://nouspresident.fr/',
    },
    declaredAt: '2026-01-23T00:00:00.000Z',
    displayName: 'François Ruffin',
    firstName: 'François',
    lastName: 'Ruffin',
    partySlug: 'debout',
    slug: 'francois-ruffin',
    sortOrder: 3,
    website: 'https://nouspresident.fr/',
  },
  {
    bio: 'Clémentine Autain est candidate déclarée à l’élection présidentielle française de 2027.',
    candidacySource: {
      notes: 'Manifeste publié sur le site officiel de Clémentine Autain.',
      platform: 'party_site',
      publishedAt: '2026-02-06T00:00:00.000Z',
      publisher: 'Clémentine Autain',
      quote:
        'Je veux représenter la gauche et les écologistes à l’élection présidentielle de 2027.',
      title: 'Mon manifeste - Clémentine Autain',
      type: 'candidacy_declaration',
      url: 'https://clementine-autain.fr/mon-manifeste/',
    },
    declaredAt: '2026-02-06T00:00:00.000Z',
    displayName: 'Clémentine Autain',
    firstName: 'Clémentine',
    lastName: 'Autain',
    partySlug: 'l-apres',
    slug: 'clementine-autain',
    sortOrder: 4,
    website: 'https://clementine-autain.fr/',
  },
  {
    bio: 'Delphine Batho est candidate déclarée à l’élection présidentielle française de 2027.',
    candidacySource: {
      notes: 'Annonce officielle publiée par Génération Écologie.',
      platform: 'party_site',
      publishedAt: '2025-11-26T00:00:00.000Z',
      publisher: 'Génération Écologie',
      quote:
        'Dans un entretien au Nouvel Obs qui paraît ce jeudi, Delphine Batho annonce que Génération Écologie a choisi de présenter sa candidature à l’élection présidentielle.',
      title:
        'Je suis candidate à l’élection présidentielle pour reconstruire une écologie capable de gouverner',
      type: 'candidacy_declaration',
      url: 'https://www.generationecologie.fr/2025/11/26/je-suis-candidate-a-lelection-presidentielle-pour-reconstruire-une-ecologie-capable-de-gouverner/',
    },
    declaredAt: '2025-11-26T00:00:00.000Z',
    displayName: 'Delphine Batho',
    firstName: 'Delphine',
    lastName: 'Batho',
    partySlug: 'generation-ecologie',
    slug: 'delphine-batho',
    sortOrder: 5,
    website: 'https://www.delphinebatho.fr/',
  },
  {
    bio: 'Édouard Philippe est candidat déclaré à l’élection présidentielle française de 2027.',
    candidacySource: {
      notes: 'Article publié sur le site officiel du parti Horizons.',
      platform: 'party_site',
      publishedAt: '2025-06-12T00:00:00.000Z',
      publisher: 'Horizons',
      quote:
        'Mais en tant que candidat à l’élection présidentielle, je veux comme vous terminer sur du positif.',
      title: 'Le prix de nos mensonges : ma réponse à François Ruffin',
      type: 'candidacy_declaration',
      url: 'https://horizonsleparti.fr/reponse-ruffin',
    },
    declaredAt: '2025-06-12T00:00:00.000Z',
    displayName: 'Édouard Philippe',
    firstName: 'Édouard',
    lastName: 'Philippe',
    partySlug: 'horizons',
    slug: 'edouard-philippe',
    sortOrder: 6,
    website: 'https://horizonsleparti.fr/',
  },
  {
    bio: 'Bruno Retailleau est candidat déclaré à l’élection présidentielle française de 2027.',
    candidacySource: {
      notes: 'Page officielle de soutien à la candidature de Bruno Retailleau.',
      platform: 'party_site',
      publishedAt: '2026-02-12T00:00:00.000Z',
      publisher: 'Avec Retailleau',
      quote:
        'Rejoignez celles et ceux qui soutiennent la candidature de Bruno Retailleau à l’élection présidentielle.',
      title: 'Je soutiens Bruno Retailleau',
      type: 'candidacy_declaration',
      url: 'https://www.avecretailleau.fr/soutien/',
    },
    declaredAt: '2026-02-12T00:00:00.000Z',
    displayName: 'Bruno Retailleau',
    firstName: 'Bruno',
    lastName: 'Retailleau',
    partySlug: 'les-republicains',
    slug: 'bruno-retailleau',
    sortOrder: 7,
    website: 'https://www.avecretailleau.fr/',
  },
]
