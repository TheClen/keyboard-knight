import { resolveHeroAttack, type CombatConfig, type HeroAttack } from './combat-rules'
import type { Level, LetterPools } from './levels'
import { generatePrompt, type PromptConfig } from './prompt-generator'
import {
  createPromptState,
  getPromptResult,
  typeLetter,
  type PromptState,
} from './prompt-typing'
import { createSeededRandom } from './random'

/** Phases that wait for the UI to finish a blocking animation. */
export type AnimatedCombatPhase =
  'monster-entering' | 'hero-attacking' | 'monster-dying' | 'hero-dying'

export type CombatPhase =
  AnimatedCombatPhase | 'prompt-pending' | 'typing' | 'victory' | 'defeat'

export interface CombatSetup {
  readonly level: Level
  readonly letterPools: LetterPools
  readonly promptConfig: PromptConfig
  readonly combatConfig: CombatConfig
}

export interface CombatState {
  readonly setup: CombatSetup
  readonly phase: CombatPhase
  readonly seed: number
  readonly heroHp: number
  /** 1 to monstersPerLevel for regular monsters, monstersPerLevel + 1 for the boss. */
  readonly monsterNumber: number
  readonly monsterHp: number
  readonly monsterMaxHp: number
  readonly perfectStreak: number
  readonly attackElapsedMs: number
  /** Timestamp (ms) up to which the attack bar has advanced, while typing. */
  readonly clockAt: number | null
  /** Incremented on each monster attack so the UI can replay its animation. */
  readonly monsterAttackCount: number
  /** Generated prompt waiting to be shown. */
  readonly pendingPromptText: string | null
  readonly prompt: PromptState | null
  readonly lastHeroAttack: HeroAttack | null
}

export type CombatAction =
  | { readonly type: 'tick'; readonly now: number }
  | { readonly type: 'key-pressed'; readonly letter: string; readonly at: number }
  | { readonly type: 'prompt-shown'; readonly at: number }
  | { readonly type: 'animation-finished'; readonly phase: AnimatedCombatPhase }

export function isBoss(state: CombatState): boolean {
  return state.monsterNumber > state.setup.combatConfig.monstersPerLevel
}

export function getAttackIntervalMs(state: CombatState): number {
  const multiplier = isBoss(state)
    ? state.setup.combatConfig.bossAttackIntervalMultiplier
    : 1
  return state.setup.level.monsterAttackIntervalMs * multiplier
}

/** Fill ratio of the monster attack bar, from 0 to 1. */
export function getAttackProgress(state: CombatState): number {
  return Math.min(state.attackElapsedMs / getAttackIntervalMs(state), 1)
}

function withMonster(state: CombatState, monsterNumber: number): CombatState {
  const config = state.setup.combatConfig
  const boss = monsterNumber > config.monstersPerLevel
  const monsterMaxHp = Math.round(config.monsterHp * (boss ? config.bossHpMultiplier : 1))

  return {
    ...state,
    phase: 'monster-entering',
    monsterNumber,
    monsterHp: monsterMaxHp,
    monsterMaxHp,
    attackElapsedMs: 0,
    clockAt: null,
    pendingPromptText: null,
    prompt: null,
    lastHeroAttack: null,
  }
}

export function createCombatState(setup: CombatSetup, seed: number): CombatState {
  return withMonster(
    {
      setup,
      phase: 'monster-entering',
      seed,
      heroHp: setup.combatConfig.heroMaxHp,
      monsterNumber: 1,
      monsterHp: 0,
      monsterMaxHp: 0,
      perfectStreak: 0,
      attackElapsedMs: 0,
      clockAt: null,
      monsterAttackCount: 0,
      pendingPromptText: null,
      prompt: null,
      lastHeroAttack: null,
    },
    1,
  )
}

function withNewPrompt(state: CombatState): CombatState {
  const { random, getSeed } = createSeededRandom(state.seed)
  const text = generatePrompt(state.setup.letterPools, state.setup.promptConfig, random)

  return {
    ...state,
    phase: 'prompt-pending',
    seed: getSeed(),
    pendingPromptText: text,
    prompt: null,
    clockAt: null,
  }
}

function advanceClock(state: CombatState, now: number): CombatState {
  if (state.clockAt === null) {
    return state
  }

  const delta = Math.min(
    Math.max(now - state.clockAt, 0),
    state.setup.combatConfig.maxTickDeltaMs,
  )

  // Frame and key timestamps may arrive slightly out of order: never move back.
  return {
    ...state,
    attackElapsedMs: state.attackElapsedMs + delta,
    clockAt: Math.max(state.clockAt, now),
  }
}

/** `onTie` decides whether an attack lands when the bar is exactly full. */
function resolveMonsterAttack(state: CombatState, onTie: boolean): CombatState {
  const interval = getAttackIntervalMs(state)
  const isDue = onTie
    ? state.attackElapsedMs >= interval
    : state.attackElapsedMs > interval

  if (!isDue) {
    return state
  }

  const heroHp = Math.max(state.heroHp - state.setup.combatConfig.monsterDamage, 0)

  return {
    ...state,
    heroHp,
    attackElapsedMs: 0,
    monsterAttackCount: state.monsterAttackCount + 1,
    phase: heroHp === 0 ? 'hero-dying' : state.phase,
  }
}

function applyKeystroke(state: CombatState, letter: string, at: number): CombatState {
  if (state.prompt === null) {
    return state
  }

  const prompt = typeLetter(state.prompt, letter, at)
  const isWrong = prompt.errorCount > state.prompt.errorCount
  const perfectStreak = isWrong ? 0 : state.perfectStreak
  const result = getPromptResult(prompt)

  if (result === null) {
    return { ...state, prompt, perfectStreak }
  }

  const streak = result.isPerfect ? perfectStreak + 1 : 0
  const attack = resolveHeroAttack(
    result,
    prompt.text.length,
    streak,
    state.setup.combatConfig,
  )

  return {
    ...state,
    phase: 'hero-attacking',
    prompt,
    perfectStreak: streak,
    monsterHp: Math.max(state.monsterHp - attack.damage, 0),
    lastHeroAttack: attack,
    clockAt: null,
  }
}

function finishAnimation(state: CombatState): CombatState {
  switch (state.phase) {
    case 'monster-entering':
      return withNewPrompt(state)
    case 'hero-attacking':
      return state.monsterHp === 0
        ? { ...state, phase: 'monster-dying' }
        : withNewPrompt(state)
    case 'monster-dying':
      return isBoss(state)
        ? { ...state, phase: 'victory' }
        : withMonster(state, state.monsterNumber + 1)
    case 'hero-dying':
      return { ...state, phase: 'defeat' }
    default:
      return state
  }
}

export function combatReducer(state: CombatState, action: CombatAction): CombatState {
  switch (action.type) {
    case 'tick': {
      if (state.phase !== 'typing') {
        return state
      }
      return resolveMonsterAttack(advanceClock(state, action.now), true)
    }

    case 'key-pressed': {
      if (state.phase !== 'typing') {
        return state
      }
      // Attacks strictly before the keystroke land first; on a tie the player wins.
      const beforeKey = resolveMonsterAttack(advanceClock(state, action.at), false)
      if (beforeKey.phase !== 'typing') {
        return beforeKey
      }
      const afterKey = applyKeystroke(beforeKey, action.letter, action.at)
      return afterKey.phase === 'typing' ? resolveMonsterAttack(afterKey, true) : afterKey
    }

    case 'prompt-shown': {
      if (state.phase !== 'prompt-pending' || state.pendingPromptText === null) {
        return state
      }
      return {
        ...state,
        phase: 'typing',
        prompt: createPromptState(state.pendingPromptText, action.at),
        pendingPromptText: null,
        clockAt: action.at,
      }
    }

    case 'animation-finished':
      return action.phase === state.phase ? finishAnimation(state) : state
  }
}
