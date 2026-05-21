import { describe, expect, it } from 'vitest'

import {
  getCitationMetadataUrl,
  getCitationPopupPosition,
  getSafeSourceUrl,
  getToolDisplayName,
} from '@/components/compare/compare-chat'

describe('compare chat source URL safety', () => {
  it('allows only absolute HTTP(S) source URLs', () => {
    expect(getSafeSourceUrl('https://example.test/source')).toBe('https://example.test/source')
    expect(getSafeSourceUrl('http://example.test/source')).toBe('http://example.test/source')

    expect(getSafeSourceUrl('javascript:alert(1)')).toBeNull()
    expect(getSafeSourceUrl('data:text/html,<script>alert(1)</script>')).toBeNull()
    expect(getSafeSourceUrl('/relative-source')).toBeNull()
    expect(getSafeSourceUrl('not a url')).toBeNull()
  })
})

describe('compare chat tool display names', () => {
  it('maps MCP technical names to French labels', () => {
    expect(getToolDisplayName('findCandidates')).toBe('Candidats')
    expect(getToolDisplayName('findClaimEvidence')).toBe('Éléments de preuve')
    expect(getToolDisplayName('findDocumentChunks')).toBe('Extraits de documents')
    expect(getToolDisplayName('findPublicPositions')).toBe('Positions publiques')
    expect(getToolDisplayName('findSourceDocuments')).toBe('Documents sources')
  })

  it('does not leak unmapped technical names', () => {
    expect(getToolDisplayName('findInternalCollectionName')).toBe('Outil MCP')
  })
})

describe('compare chat citation popup positioning', () => {
  it('anchors the fixed popup below the clicked badge', () => {
    expect(getCitationPopupPosition({ bottom: 60, left: 180 }, 1200)).toEqual({
      left: 180,
      top: 68,
    })
  })

  it('keeps the popup inside the viewport near the right edge', () => {
    expect(getCitationPopupPosition({ bottom: 80, left: 1000 }, 1100)).toEqual({
      left: 660,
      top: 88,
    })
  })

  it('keeps the popup inside the viewport near the left edge', () => {
    expect(getCitationPopupPosition({ bottom: 80, left: 4 }, 1100)).toEqual({
      left: 24,
      top: 88,
    })
  })
})

describe('compare chat citation metadata URL', () => {
  it('deduplicates and sorts citation ids for stable SWR cache keys', () => {
    expect(
      getCitationMetadataUrl([
        'Source [B](claim:2), source [A](claim:1), doublon [B](claim:2).',
        'Sources directes [programme](source:10) puis [discours](source:5).',
      ]),
    ).toBe('/compare/citations?claims=1%2C2&sources=5%2C10')
  })

  it('returns null when there are no citations', () => {
    expect(getCitationMetadataUrl(['Réponse sans citation.'])).toBeNull()
  })
})
