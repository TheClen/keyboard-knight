import { describe, expect, it } from 'vitest'
import { keyboardAzerty, levels, promptConfig } from '.'

const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')

describe('levels', () => {
  it('lists the new letters of the 12 levels from the GDD', () => {
    expect(levels.map((level) => level.newLetters.join(' '))).toEqual([
      'f j',
      'd k',
      's l',
      'q m',
      'g h',
      'e i',
      'r u',
      't y',
      'z o',
      'a p',
      'c v n',
      'w x b',
    ])
  })

  it('numbers the levels from 1 to 12', () => {
    expect(levels.map((level) => level.number)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ])
  })

  it('introduces each of the 26 letters exactly once', () => {
    const letters = levels.flatMap((level) => level.newLetters)
    expect([...letters].sort()).toEqual(alphabet)
  })
})

describe('keyboardAzerty', () => {
  it('assigns a finger to each of the 26 letters', () => {
    expect(Object.keys(keyboardAzerty).sort()).toEqual(alphabet)
  })

  it('matches the finger table from the GDD', () => {
    const lettersByFinger = (hand: string, finger: string) =>
      Object.entries(keyboardAzerty)
        .filter(
          ([, assignment]) => assignment.hand === hand && assignment.finger === finger,
        )
        .map(([letter]) => letter)
        .sort()
        .join('')

    expect(lettersByFinger('left', 'pinky')).toBe('aqw')
    expect(lettersByFinger('left', 'ring')).toBe('sxz')
    expect(lettersByFinger('left', 'middle')).toBe('cde')
    expect(lettersByFinger('left', 'index')).toBe('bfgrtv')
    expect(lettersByFinger('right', 'index')).toBe('hjnuy')
    expect(lettersByFinger('right', 'middle')).toBe('ik')
    expect(lettersByFinger('right', 'ring')).toBe('lo')
    expect(lettersByFinger('right', 'pinky')).toBe('mp')
  })
})

describe('promptConfig', () => {
  it('defines a valid length range', () => {
    expect(Number.isInteger(promptConfig.minLength)).toBe(true)
    expect(Number.isInteger(promptConfig.maxLength)).toBe(true)
    expect(promptConfig.minLength).toBeGreaterThan(0)
    expect(promptConfig.maxLength).toBeGreaterThanOrEqual(promptConfig.minLength)
  })

  it('defines a ratio between 0 and 1', () => {
    expect(promptConfig.newLetterRatio).toBeGreaterThanOrEqual(0)
    expect(promptConfig.newLetterRatio).toBeLessThanOrEqual(1)
  })
})
