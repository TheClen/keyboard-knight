import type { Random } from './prompt-generator'

export interface RandomStep {
  readonly value: number
  readonly seed: number
}

/** Mulberry32: returns a number in [0, 1) and the seed for the next draw. */
export function nextRandom(seed: number): RandomStep {
  const next = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(next ^ (next >>> 15), 1 | next)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return { value: ((t ^ (t >>> 14)) >>> 0) / 4294967296, seed: next }
}

/**
 * Wraps a seed in a Random function for APIs that draw several values.
 * Read the seed back afterwards to keep the caller pure.
 */
export function createSeededRandom(seed: number): {
  readonly random: Random
  readonly getSeed: () => number
} {
  let current = seed

  return {
    random: () => {
      const step = nextRandom(current)
      current = step.seed
      return step.value
    },
    getSeed: () => current,
  }
}
