import { describe, expect, it } from 'vitest'
import { levels as gameLevels, promptConfig } from '../data'
import { getLetterPools, type Level } from './levels'
import { generatePrompt, type PromptConfig, type Random } from './prompt-generator'

const config: PromptConfig = { minLength: 6, maxLength: 8, newLetterRatio: 0.5 }

const levels: readonly Level[] = [
  { number: 1, newLetters: ['f', 'j'] },
  { number: 2, newLetters: ['d', 'k'] },
  { number: 3, newLetters: ['s', 'l'] },
]

/** Replays the given values, then fails if the generator asks for more. */
function sequence(...values: number[]): Random {
  let index = 0
  return () => {
    const value = values[index]
    index += 1
    if (value === undefined) {
      throw new Error('Random sequence exhausted')
    }
    return value
  }
}

/** Mulberry32: a small seeded generator for reproducible bulk tests. */
function seeded(seed: number): Random {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('generatePrompt', () => {
  it('draws only from new letters when there are no old letters', () => {
    const pools = getLetterPools(levels, 1)
    // length 6, then one draw per letter
    const random = sequence(0, 0, 0.9, 0.5, 0, 0.9, 0.4)

    expect(generatePrompt(pools, config, random)).toBe('fjjfjf')
  })

  it('draws a new letter below the ratio and an old letter otherwise', () => {
    const pools = getLetterPools(levels, 2)
    // length 6, then (pool choice, letter) for each letter
    const random = sequence(0, 0.1, 0, 0.6, 0, 0.4, 0.9, 0.5, 0.99, 0.2, 0.5, 0.7, 0.3)

    expect(generatePrompt(pools, config, random)).toBe('dfkjkf')
  })

  it('uses the full length range', () => {
    const pools = getLetterPools(levels, 1)

    expect(generatePrompt(pools, config, sequence(0, 0, 0, 0, 0, 0, 0))).toHaveLength(6)
    expect(
      generatePrompt(pools, config, sequence(0.99, 0, 0, 0, 0, 0, 0, 0, 0)),
    ).toHaveLength(8)
  })

  it('replaces a letter when the draw contains no new letter', () => {
    const pools = getLetterPools(levels, 2)
    // length 6, six old letters, then position 2 replaced with "k"
    const random = sequence(
      0,
      0.9,
      0,
      0.9,
      0.5,
      0.9,
      0,
      0.9,
      0.5,
      0.9,
      0,
      0.9,
      0.5,
      0.4,
      0.9,
    )

    expect(generatePrompt(pools, config, random)).toBe('fjkjfj')
  })

  it('respects the game rules over many prompts on every level', () => {
    const random = seeded(42)

    for (let i = 0; i < 1000; i += 1) {
      const pools = getLetterPools(gameLevels, (i % gameLevels.length) + 1)
      const unlocked = [...pools.newLetters, ...pools.oldLetters]
      const prompt = generatePrompt(pools, promptConfig, random)

      expect(prompt.length).toBeGreaterThanOrEqual(promptConfig.minLength)
      expect(prompt.length).toBeLessThanOrEqual(promptConfig.maxLength)
      expect([...prompt].every((letter) => unlocked.includes(letter))).toBe(true)
      expect([...prompt].some((letter) => pools.newLetters.includes(letter))).toBe(true)
    }
  })

  it('is deterministic for a given random source', () => {
    const pools = getLetterPools(levels, 3)

    expect(generatePrompt(pools, config, seeded(7))).toBe(
      generatePrompt(pools, config, seeded(7)),
    )
  })
})
