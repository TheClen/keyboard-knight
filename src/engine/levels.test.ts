import { describe, expect, it } from 'vitest'
import { getLetterPools, type Level } from './levels'

const levels: readonly Level[] = [
  { number: 1, newLetters: ['f', 'j'] },
  { number: 2, newLetters: ['d', 'k'] },
  { number: 3, newLetters: ['s', 'l'] },
]

describe('getLetterPools', () => {
  it('has no old letters on the first level', () => {
    expect(getLetterPools(levels, 1)).toEqual({ newLetters: ['f', 'j'], oldLetters: [] })
  })

  it('accumulates the letters of previous levels as old letters', () => {
    expect(getLetterPools(levels, 3)).toEqual({
      newLetters: ['s', 'l'],
      oldLetters: ['f', 'j', 'd', 'k'],
    })
  })

  it('does not depend on the order of the levels', () => {
    expect(getLetterPools([...levels].reverse(), 3).oldLetters).toHaveLength(4)
  })

  it('rejects an unknown level', () => {
    expect(() => getLetterPools(levels, 4)).toThrow('Level 4 does not exist')
  })
})
