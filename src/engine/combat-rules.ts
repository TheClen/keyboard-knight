import type { PromptResult } from './prompt-typing'

export interface CombatConfig {
  readonly heroMaxHp: number
  readonly heroBaseDamage: number
  readonly perfectBonus: number
  readonly comboStepBonus: number
  readonly comboMaxBonus: number
  readonly speedBonus: number
  readonly speedBonusMsPerLetter: number
  readonly monstersPerLevel: number
  readonly monsterHp: number
  readonly monsterDamage: number
  readonly bossHpMultiplier: number
  readonly bossAttackIntervalMultiplier: number
  readonly maxTickDeltaMs: number
}

/** The combo is stored as a count of consecutive perfect prompts to avoid float drift. */
export function getComboBonus(perfectStreak: number, config: CombatConfig): number {
  return Math.min(perfectStreak * config.comboStepBonus, config.comboMaxBonus)
}

export function hasSpeedBonus(
  result: PromptResult,
  promptLength: number,
  config: CombatConfig,
): boolean {
  return result.durationMs <= config.speedBonusMsPerLetter * promptLength
}

export interface HeroAttack {
  readonly damage: number
  readonly isCritical: boolean
  readonly isFast: boolean
}

/** `perfectStreak` must already include the prompt being resolved. */
export function resolveHeroAttack(
  result: PromptResult,
  promptLength: number,
  perfectStreak: number,
  config: CombatConfig,
): HeroAttack {
  const isCritical = result.isPerfect
  const isFast = hasSpeedBonus(result, promptLength, config)
  const criticalBonus = isCritical ? config.perfectBonus : 0
  const speedBonus = isFast ? config.speedBonus : 0
  const comboBonus = getComboBonus(perfectStreak, config)

  return {
    damage: Math.round(
      config.heroBaseDamage * (1 + criticalBonus + comboBonus + speedBonus),
    ),
    isCritical,
    isFast,
  }
}
