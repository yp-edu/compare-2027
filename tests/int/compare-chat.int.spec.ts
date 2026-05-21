import { describe, expect, it } from 'vitest'

import { getSafeSourceUrl, getToolDisplayName } from '@/components/compare/compare-chat'

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
