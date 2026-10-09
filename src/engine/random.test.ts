import { describe, expect, it } from 'vitest'
import { createSeededRandom, nextRandom } from './random'

describe('nextRandom', () => {
  it('returns the same value and next seed for the same seed', () => {
    expect(nextRandom(42)).toEqual(nextRandom(42))
  })

  it('returns values in [0, 1)', () => {
    let seed = 1
    for (let i = 0; i < 1000; i += 1) {
      const step = nextRandom(seed)
      expect(step.value).toBeGreaterThanOrEqual(0)
      expect(step.value).toBeLessThan(1)
      seed = step.seed
    }
  })
})

describe('createSeededRandom', () => {
  it('replays the nextRandom sequence and exposes the resulting seed', () => {
    const first = nextRandom(7)
    const second = nextRandom(first.seed)
    const { random, getSeed } = createSeededRandom(7)

    expect([random(), random()]).toEqual([first.value, second.value])
    expect(getSeed()).toBe(second.seed)
  })
})
