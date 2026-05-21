import type { CampaignCandidateEntry } from '../types'

export const nicolasDupontAignanEntry: CampaignCandidateEntry = {
  candidate: {
    bio: 'Nicolas Dupont-Aignan est candidat déclaré à l’élection présidentielle française de 2027.',
    candidacySourceSlug: 'dupont-aignan-2027-candidature-discours',
    declaredAt: '2025-03-08T00:00:00.000Z',
    displayName: 'Nicolas Dupont-Aignan',
    firstName: 'Nicolas',
    lastName: 'Dupont-Aignan',
    partySlug: 'debout-la-france',
    slug: 'nicolas-dupont-aignan',
    sortOrder: 2,
    sourceSlugs: [
      'debout-la-france-projet-index',
      'debout-la-france-projet-2027-livrets',
      'debout-la-france-projet-securite',
    ],
    website: 'https://www.dupontaignan.fr/',
  },
  programs: [
    {
      actor: { relationTo: 'candidates', slug: 'nicolas-dupont-aignan' },
      programDate: '2026-01-13T00:00:00.000Z',
      slug: 'nicolas-dupont-aignan-projet-2027',
      sources: [
        { role: 'index', sourceSlug: 'debout-la-france-projet-index' },
        { role: 'supporting', sourceSlug: 'debout-la-france-projet-2027-livrets' },
        { role: 'section', sourceSlug: 'debout-la-france-projet-securite' },
      ],
      summary:
        'Corpus officiel Debout la France pour 2027, composé de l’index du projet et de livrets ou pages thématiques mis à jour.',
      title: 'Projet Debout la France pour 2027',
    },
  ],
  sources: [
    {
      notes: 'Article officiel de Debout la France reprenant son discours de candidature.',
      platform: 'party_site',
      publishedAt: '2025-09-25T00:00:00.000Z',
      publisher: 'Debout la France',
      quote:
        'Nicolas Dupont-Aignan, président de Debout la France, a officiellement annoncé, ce samedi 8 mars, sa candidature à l’élection présidentielle de 2027.',
      references: [
        {
          isPrimary: true,
          label: 'Discours de candidature',
          url: 'https://www.debout-la-france.fr/actualite/je-suis-candidat-pour/',
        },
      ],
      slug: 'dupont-aignan-2027-candidature-discours',
      sourceRole: 'candidacy_declaration',
      title:
        'Je suis candidat pour rendre le pouvoir aux Français et rendre sa liberté à la France !',
      type: 'candidacy_declaration',
    },
    {
      platform: 'party_site',
      publisher: 'Debout la France',
      references: [
        {
          isPrimary: true,
          label: 'Index du projet',
          url: 'https://www.debout-la-france.fr/contenu/debout-la-france-en-bref',
        },
      ],
      slug: 'debout-la-france-projet-index',
      sourceRole: 'program_index',
      title: 'Projet - Debout la France',
      type: 'official_program',
    },
    {
      platform: 'party_site',
      publishedAt: '2026-01-13T00:00:00.000Z',
      publisher: 'Debout la France',
      references: [
        {
          isPrimary: true,
          label: 'Livrets du programme mis à jour',
          url: 'https://www.debout-la-france.fr/actualite/decouvrez-nos-livrets/',
        },
      ],
      slug: 'debout-la-france-projet-2027-livrets',
      sourceRole: 'supporting_document',
      title: 'Découvrez nos livrets du programme mis à jour !',
      type: 'official_program',
    },
    {
      platform: 'party_site',
      publishedAt: '2025-11-01T00:00:00.000Z',
      publisher: 'Debout la France',
      references: [
        {
          isPrimary: true,
          label: 'Projet sécurité',
          url: 'https://www.debout-la-france.fr/projet/securite/',
        },
      ],
      slug: 'debout-la-france-projet-securite',
      sourceRole: 'program_section',
      title: 'Sécurité - Debout la France',
      type: 'official_program',
    },
  ],
}
