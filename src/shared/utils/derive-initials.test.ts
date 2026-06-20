import { describe, it, expect } from 'vitest'
import { deriveInitials } from './derive-initials'

describe('deriveInitials', () => {
  it('derives initials from two names', () => {
    expect(deriveInitials('Paul Harms')).toBe('PH')
  })

  it('derives a single initial from one name', () => {
    expect(deriveInitials('John')).toBe('J')
  })

  it('handles three names', () => {
    expect(deriveInitials('Alice B Cooper')).toBe('ABC')
  })

  it('trims surrounding whitespace', () => {
    expect(deriveInitials('  Jane Doe  ')).toBe('JD')
  })

  it('uppercases initials', () => {
    expect(deriveInitials('alice doe')).toBe('AD')
  })
})
