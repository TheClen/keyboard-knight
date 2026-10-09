import { describe, expect, it } from 'vitest'
import { combatConfig as config } from '../data'
import { getComboBonus, hasSpeedBonus, resolveHeroAttack } from './combat-rules'

const slow = 10_000
const fast = 1_000

describe('getComboBonus', () => {
  it('adds 0.1 per perfect prompt', () => {
    expect(getComboBonus(0, config)).toBe(0)
    expect(getComboBonus(1, config)).toBeCloseTo(0.1)
    expect(getComboBonus(3, config)).toBeCloseTo(0.3)
  })

  it('is capped at 1.0', () => {
    expect(getComboBonus(10, config)).toBeCloseTo(1)
    expect(getComboBonus(25, config)).toBeCloseTo(1)
  })
})

describe('hasSpeedBonus', () => {
  it('applies at or under 600 ms per letter', () => {
    expect(hasSpeedBonus({ isPerfect: true, durationMs: 3600 }, 6, config)).toBe(true)
    expect(hasSpeedBonus({ isPerfect: true, durationMs: 3601 }, 6, config)).toBe(false)
    expect(hasSpeedBonus({ isPerfect: true, durationMs: 4800 }, 8, config)).toBe(true)
  })
})

describe('resolveHeroAttack', () => {
  it('deals base damage for a slow imperfect prompt', () => {
    expect(
      resolveHeroAttack({ isPerfect: false, durationMs: slow }, 6, 0, config).damage,
    ).toBe(10)
  })

  it('adds the critical and combo bonuses for a first perfect prompt', () => {
    expect(
      resolveHeroAttack({ isPerfect: true, durationMs: slow }, 6, 1, config).damage,
    ).toBe(16)
  })

  it('adds the speed bonus for a fast prompt', () => {
    expect(
      resolveHeroAttack({ isPerfect: true, durationMs: fast }, 6, 1, config).damage,
    ).toBe(17)
    expect(
      resolveHeroAttack({ isPerfect: false, durationMs: fast }, 6, 0, config).damage,
    ).toBe(11)
  })

  it('reports which bonuses applied', () => {
    expect(
      resolveHeroAttack({ isPerfect: true, durationMs: fast }, 6, 1, config),
    ).toEqual({
      damage: 17,
      isCritical: true,
      isFast: true,
    })
    expect(
      resolveHeroAttack({ isPerfect: false, durationMs: slow }, 6, 0, config),
    ).toEqual({
      damage: 10,
      isCritical: false,
      isFast: false,
    })
  })

  it('reaches 26 with a full combo and the speed bonus', () => {
    expect(
      resolveHeroAttack({ isPerfect: true, durationMs: fast }, 6, 10, config).damage,
    ).toBe(26)
  })
})
