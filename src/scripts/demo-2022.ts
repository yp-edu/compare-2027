const cnccepBaseURL = 'https://www.cnccep.fr'

export type DemoPartySeed = {
  color: string
  description: string
  name: string
  shortName: string
  slug: string
  website?: string
}

export type DemoCandidateSeed = {
  declarationPath: string
  displayName: string
  firstName: string
  lastName: string
  partySlug: string
  slug: string
  sortOrder: number
}

export const cnccepCandidatesSource = {
  title: 'CNCCEP - Candidats au 1er tour de l’élection présidentielle 2022',
  url: `${cnccepBaseURL}/candidats.html`,
}

export const demoParties: DemoPartySeed[] = [
  {
    color: '#E32831',
    description: 'Parti de Nathalie Arthaud lors de l’élection présidentielle 2022.',
    name: 'Lutte ouvrière',
    shortName: 'LO',
    slug: 'lutte-ouvriere',
    website: 'https://www.lutte-ouvriere.org/',
  },
  {
    color: '#0087CD',
    description: 'Mouvement de Nicolas Dupont-Aignan lors de l’élection présidentielle 2022.',
    name: 'Debout la France',
    shortName: 'DLF',
    slug: 'debout-la-france',
    website: 'https://www.debout-la-france.fr/',
  },
  {
    color: '#E30040',
    description: 'Parti d’Anne Hidalgo lors de l’élection présidentielle 2022.',
    name: 'Parti socialiste',
    shortName: 'PS',
    slug: 'parti-socialiste',
    website: 'https://www.parti-socialiste.fr/',
  },
  {
    color: '#7AB41D',
    description: 'Parti de Yannick Jadot lors de l’élection présidentielle 2022.',
    name: 'Europe Écologie Les Verts',
    shortName: 'EELV',
    slug: 'europe-ecologie-les-verts',
    website: 'https://www.eelv.fr/',
  },
  {
    color: '#034EA1',
    description: 'Mouvement de Jean Lassalle lors de l’élection présidentielle 2022.',
    name: 'Résistons !',
    shortName: 'R!',
    slug: 'resistons',
    website: 'https://resistons-france.fr/',
  },
  {
    color: '#104E8B',
    description: 'Parti de Marine Le Pen lors de l’élection présidentielle 2022.',
    name: 'Rassemblement national',
    shortName: 'RN',
    slug: 'rassemblement-national',
    website: 'https://rassemblementnational.fr/',
  },
  {
    color: '#00205B',
    description:
      'Parti d’Emmanuel Macron lors de l’élection présidentielle 2022, renommé Renaissance en 2022.',
    name: 'La République en marche !',
    shortName: 'LREM',
    slug: 'la-republique-en-marche',
    website: 'https://parti-renaissance.fr/',
  },
  {
    color: '#7B13D6',
    description: 'Mouvement de Jean-Luc Mélenchon lors de l’élection présidentielle 2022.',
    name: 'La France insoumise',
    shortName: 'LFI',
    slug: 'la-france-insoumise',
    website: 'https://lafranceinsoumise.fr/',
  },
  {
    color: '#034EA2',
    description: 'Parti de Valérie Pécresse lors de l’élection présidentielle 2022.',
    name: 'Les Républicains',
    shortName: 'LR',
    slug: 'les-republicains',
    website: 'https://republicains.fr/',
  },
  {
    color: '#C0081F',
    description: 'Parti de Philippe Poutou lors de l’élection présidentielle 2022.',
    name: 'Nouveau Parti anticapitaliste',
    shortName: 'NPA',
    slug: 'nouveau-parti-anticapitaliste',
    website: 'https://npa-lanticapitaliste.org/',
  },
  {
    color: '#E4002B',
    description: 'Parti de Fabien Roussel lors de l’élection présidentielle 2022.',
    name: 'Parti communiste français',
    shortName: 'PCF',
    slug: 'parti-communiste-francais',
    website: 'https://www.pcf.fr/',
  },
  {
    color: '#0B0B66',
    description: 'Parti d’Éric Zemmour lors de l’élection présidentielle 2022.',
    name: 'Reconquête !',
    shortName: 'REC',
    slug: 'reconquete',
    website: 'https://www.parti-reconquete.fr/',
  },
]

export const demoCandidates: DemoCandidateSeed[] = [
  {
    declarationPath: '/pdfs/Candidat-01-Nathalie-Arthaud-Declaration.pdf',
    displayName: 'Nathalie Arthaud',
    firstName: 'Nathalie',
    lastName: 'Arthaud',
    partySlug: 'lutte-ouvriere',
    slug: 'nathalie-arthaud',
    sortOrder: 1,
  },
  {
    declarationPath: '/pdfs/Candidat-02-Nicolas-Dupont-Aignan-Declaration-accessible.pdf',
    displayName: 'Nicolas Dupont-Aignan',
    firstName: 'Nicolas',
    lastName: 'Dupont-Aignan',
    partySlug: 'debout-la-france',
    slug: 'nicolas-dupont-aignan',
    sortOrder: 2,
  },
  {
    declarationPath: '/pdfs/Candidat-03-Anne-Hidalgo-Declaration.pdf',
    displayName: 'Anne Hidalgo',
    firstName: 'Anne',
    lastName: 'Hidalgo',
    partySlug: 'parti-socialiste',
    slug: 'anne-hidalgo',
    sortOrder: 3,
  },
  {
    declarationPath: '/pdfs/Candidat-04-Yannick-Jadot-Declaration-accessible.pdf',
    displayName: 'Yannick Jadot',
    firstName: 'Yannick',
    lastName: 'Jadot',
    partySlug: 'europe-ecologie-les-verts',
    slug: 'yannick-jadot',
    sortOrder: 4,
  },
  {
    declarationPath: '/pdfs/Candidat-05-Jean-Lassalle-Declaration.pdf',
    displayName: 'Jean Lassalle',
    firstName: 'Jean',
    lastName: 'Lassalle',
    partySlug: 'resistons',
    slug: 'jean-lassalle',
    sortOrder: 5,
  },
  {
    declarationPath: '/pdfs/Candidat-06-Marine-Le-Pen-Declaration-accessible.pdf',
    displayName: 'Marine Le Pen',
    firstName: 'Marine',
    lastName: 'Le Pen',
    partySlug: 'rassemblement-national',
    slug: 'marine-le-pen',
    sortOrder: 6,
  },
  {
    declarationPath: '/pdfs/Candidat-07-Emmanuel-Macron-Declaration.pdf',
    displayName: 'Emmanuel Macron',
    firstName: 'Emmanuel',
    lastName: 'Macron',
    partySlug: 'la-republique-en-marche',
    slug: 'emmanuel-macron',
    sortOrder: 7,
  },
  {
    declarationPath: '/pdfs/Candidat-08-Jean-Luc-Melenchon-Declaration-accessible.pdf',
    displayName: 'Jean-Luc Mélenchon',
    firstName: 'Jean-Luc',
    lastName: 'Mélenchon',
    partySlug: 'la-france-insoumise',
    slug: 'jean-luc-melenchon',
    sortOrder: 8,
  },
  {
    declarationPath: '/pdfs/Candidat-09-Valerie-Pecresse-Declaration-accessible.pdf',
    displayName: 'Valérie Pécresse',
    firstName: 'Valérie',
    lastName: 'Pécresse',
    partySlug: 'les-republicains',
    slug: 'valerie-pecresse',
    sortOrder: 9,
  },
  {
    declarationPath: '/pdfs/Candidat-10-Philippe-Poutou-Declaration.pdf',
    displayName: 'Philippe Poutou',
    firstName: 'Philippe',
    lastName: 'Poutou',
    partySlug: 'nouveau-parti-anticapitaliste',
    slug: 'philippe-poutou',
    sortOrder: 10,
  },
  {
    declarationPath: '/pdfs/Candidat-11-Fabien-Roussel-Declaration-accessible.pdf',
    displayName: 'Fabien Roussel',
    firstName: 'Fabien',
    lastName: 'Roussel',
    partySlug: 'parti-communiste-francais',
    slug: 'fabien-roussel',
    sortOrder: 11,
  },
  {
    declarationPath: '/pdfs/Candidat-12-Eric-Zemmour-Declaration.pdf',
    displayName: 'Éric Zemmour',
    firstName: 'Éric',
    lastName: 'Zemmour',
    partySlug: 'reconquete',
    slug: 'eric-zemmour',
    sortOrder: 12,
  },
]

export function getDeclarationURL(candidate: DemoCandidateSeed) {
  return `${cnccepBaseURL}${candidate.declarationPath}`
}
