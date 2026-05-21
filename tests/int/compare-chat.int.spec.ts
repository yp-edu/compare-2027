import { describe, expect, it } from 'vitest'

import { getSafeSourceUrl } from '@/components/compare/compare-chat'

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
