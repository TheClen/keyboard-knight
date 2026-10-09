import { describe, expect, it } from 'vitest'
import { combatConfig, keyboardAzerty, levels, promptConfig } from '.'

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

  it('speeds up monster attacks from 12 s on level 1 to 4 s on level 12', () => {
    const intervals = levels.map((level) => level.monsterAttackIntervalMs)

    expect(intervals[0]).toBe(12000)
    expect(intervals.at(-1)).toBe(4000)
    intervals.slice(1).forEach((interval, index) => {
      expect(interval).toBeLessThan(intervals[index] ?? Infinity)
    })
  })

  it('has a game over message for every level', () => {
    levels.forEach((level) => expect(level.gameOverMessage.trim()).not.toBe(''))
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

describe('combatConfig', () => {
  it('defines positive whole numbers for hit points, damage and counts', () => {
    const wholeValues = [
      combatConfig.heroMaxHp,
      combatConfig.heroBaseDamage,
      combatConfig.monstersPerLevel,
      combatConfig.monsterHp,
      combatConfig.monsterDamage,
    ]

    wholeValues.forEach((value) => {
      expect(Number.isInteger(value)).toBe(true)
      expect(value).toBeGreaterThan(0)
    })
  })

  it('defines non-negative bonuses with a combo cap above its step', () => {
    expect(combatConfig.perfectBonus).toBeGreaterThanOrEqual(0)
    expect(combatConfig.speedBonus).toBeGreaterThanOrEqual(0)
    expect(combatConfig.comboStepBonus).toBeGreaterThan(0)
    expect(combatConfig.comboMaxBonus).toBeGreaterThanOrEqual(combatConfig.comboStepBonus)
  })

  it('defines positive timings and multipliers', () => {
    expect(combatConfig.speedBonusMsPerLetter).toBeGreaterThan(0)
    expect(combatConfig.maxTickDeltaMs).toBeGreaterThan(0)
    expect(combatConfig.bossHpMultiplier).toBeGreaterThan(0)
    expect(combatConfig.bossAttackIntervalMultiplier).toBeGreaterThan(0)
  })
})
