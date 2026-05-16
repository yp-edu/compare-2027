import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: '#fbf8ed',
    categories: ['education', 'news', 'politics'],
    description:
      'Compare 2027 aide à comparer les programmes, positions et partis politiques pour la prochaine élection présidentielle.',
    display: 'standalone',
    icons: [
      {
        sizes: '192x192',
        src: '/icons/icon-192.png',
        type: 'image/png',
      },
      {
        sizes: '512x512',
        src: '/icons/icon-512.png',
        type: 'image/png',
      },
      {
        purpose: 'maskable',
        sizes: '512x512',
        src: '/icons/maskable-512.png',
        type: 'image/png',
      },
    ],
    lang: 'fr',
    name: 'Compare 2027',
    orientation: 'portrait-primary',
    scope: '/',
    screenshots: [
      {
        form_factor: 'narrow',
        label: 'Logo Compare 2027',
        sizes: '512x512',
        src: '/icons/icon-512.png',
        type: 'image/png',
      },
    ],
    short_name: 'Compare 2027',
    shortcuts: [
      {
        description: 'Ouvrir le comparateur conversationnel.',
        name: 'Comparer',
        short_name: 'Comparer',
        url: '/compare',
      },
      {
        description: 'Se connecter à Compare 2027.',
        name: 'Connexion',
        short_name: 'Connexion',
        url: '/signin',
      },
    ],
    start_url: '/',
    theme_color: '#12305f',
  }
}
