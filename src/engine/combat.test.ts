import { describe, expect, it } from 'vitest'
import { combatConfig, levels, promptConfig } from '../data'
import {
  combatReducer,
  createCombatState,
  getAttackProgress,
  isBoss,
  type CombatAction,
  type CombatSetup,
  type CombatState,
} from './combat'
import { getLetterPools } from './levels'

const level1 = levels.find((level) => level.number === 1)
if (!level1) {
  throw new Error('Level 1 is missing from the data')
}

const setup: CombatSetup = {
  level: level1,
  letterPools: getLetterPools(levels, 1),
  promptConfig,
  combatConfig,
}

const SEED = 1234

function dispatch(state: CombatState, ...actions: CombatAction[]): CombatState {
  return actions.reduce(combatReducer, state)
}

function promptText(state: CombatState): string {
  if (state.prompt === null) {
    throw new Error(`No prompt in phase ${state.phase}`)
  }
  return state.prompt.text
}

/** Plays the monster entrance and shows the first prompt at `at`. */
function startTyping(at = 0): CombatState {
  return dispatch(
    createCombatState(setup, SEED),
    { type: 'animation-finished', phase: 'monster-entering' },
    { type: 'prompt-shown', at },
  )
}

/** Types `letters` one every `stepMs`, starting at `startAt`. */
function typeLetters(
  state: CombatState,
  letters: string,
  startAt: number,
  stepMs = 100,
): CombatState {
  return [...letters].reduce(
    (current, letter, index) =>
      combatReducer(current, {
        type: 'key-pressed',
        letter,
        at: startAt + index * stepMs,
      }),
    state,
  )
}

function tickFor(state: CombatState, from: number, durationMs: number): CombatState {
  let current = state
  for (let now = from + 100; now <= from + durationMs; now += 100) {
    current = combatReducer(current, { type: 'tick', now })
  }
  return current
}

/** Types perfect prompts until the current monster is dead, then plays its death. */
function defeatMonster(state: CombatState): CombatState {
  let current = state
  while (current.phase !== 'monster-dying') {
    if (current.phase === 'prompt-pending') {
      current = combatReducer(current, { type: 'prompt-shown', at: 0 })
    } else if (current.phase === 'typing') {
      current = typeLetters(current, promptText(current), 0, 0)
    } else if (
      current.phase === 'hero-attacking' ||
      current.phase === 'monster-entering'
    ) {
      current = combatReducer(current, {
        type: 'animation-finished',
        phase: current.phase,
      })
    } else {
      throw new Error(`Unexpected phase ${current.phase}`)
    }
  }
  return combatReducer(current, { type: 'animation-finished', phase: 'monster-dying' })
}

describe('createCombatState', () => {
  it('starts with the first monster entering', () => {
    const state = createCombatState(setup, SEED)

    expect(state.phase).toBe('monster-entering')
    expect(state.heroHp).toBe(100)
    expect(state.monsterNumber).toBe(1)
    expect(state.monsterHp).toBe(25)
    expect(state.monsterMaxHp).toBe(25)
    expect(state.perfectStreak).toBe(0)
    expect(isBoss(state)).toBe(false)
  })
})

describe('phases', () => {
  it('generates a prompt after the entrance and starts typing once it is shown', () => {
    const entered = dispatch(createCombatState(setup, SEED), {
      type: 'animation-finished',
      phase: 'monster-entering',
    })

    expect(entered.phase).toBe('prompt-pending')
    expect(entered.pendingPromptText).toMatch(/^[fj]{6,8}$/)

    const typing = combatReducer(entered, { type: 'prompt-shown', at: 500 })

    expect(typing.phase).toBe('typing')
    expect(typing.prompt?.text).toBe(entered.pendingPromptText)
    expect(typing.prompt?.shownAt).toBe(500)
  })

  it('ignores an animation-finished action for another phase', () => {
    const state = createCombatState(setup, SEED)

    expect(
      combatReducer(state, { type: 'animation-finished', phase: 'hero-attacking' }),
    ).toBe(state)
  })

  it('ignores keystrokes outside the typing phase', () => {
    const state = dispatch(createCombatState(setup, SEED), {
      type: 'animation-finished',
      phase: 'monster-entering',
    })

    expect(combatReducer(state, { type: 'key-pressed', letter: 'f', at: 0 })).toBe(state)
  })

  it('asks for a new prompt when the monster survives the attack', () => {
    const typing = startTyping()
    const attacked = typeLetters(typing, promptText(typing), 0)

    expect(attacked.phase).toBe('hero-attacking')

    const next = combatReducer(attacked, {
      type: 'animation-finished',
      phase: 'hero-attacking',
    })

    expect(next.phase).toBe('prompt-pending')
    expect(next.pendingPromptText).toMatch(/^[fj]{6,8}$/)
  })
})

describe('hero damage', () => {
  it('deals 10 for a slow imperfect prompt', () => {
    const typing = startTyping()
    const withError = typeLetters(typing, 'k', 0)
    const state = typeLetters(withError, promptText(typing), 10_000)

    expect(state.lastHeroAttack).toEqual({ damage: 10, isCritical: false, isFast: false })
    expect(state.monsterHp).toBe(15)
  })

  it('deals 16 for a slow first perfect prompt', () => {
    const typing = startTyping()
    const state = typeLetters(typing, promptText(typing), 10_000)

    expect(state.lastHeroAttack).toEqual({ damage: 16, isCritical: true, isFast: false })
  })

  it('deals 17 for a fast first perfect prompt', () => {
    const typing = startTyping()
    const state = typeLetters(typing, promptText(typing), 0)

    expect(state.lastHeroAttack).toEqual({ damage: 17, isCritical: true, isFast: true })
    expect(state.monsterHp).toBe(8)
  })
})

describe('combo', () => {
  it('grows with each perfect prompt, across monsters', () => {
    const afterFirstMonster = defeatMonster(startTyping())

    expect(afterFirstMonster.monsterNumber).toBe(2)
    expect(afterFirstMonster.perfectStreak).toBe(2)
  })

  it('drops to zero as soon as a wrong letter is typed', () => {
    const typing = startTyping()
    const perfect = typeLetters(typing, promptText(typing), 0)
    const next = dispatch(
      perfect,
      { type: 'animation-finished', phase: 'hero-attacking' },
      { type: 'prompt-shown', at: 1000 },
    )

    expect(next.perfectStreak).toBe(1)
    expect(typeLetters(next, 'k', 1000).perfectStreak).toBe(0)
  })
})

describe('monster attacks', () => {
  it('does not fill the attack bar outside the typing phase', () => {
    const pending = dispatch(createCombatState(setup, SEED), {
      type: 'animation-finished',
      phase: 'monster-entering',
    })

    expect(tickFor(pending, 0, 20_000).attackElapsedMs).toBe(0)
  })

  it('attacks once the level interval has elapsed while typing', () => {
    const beforeAttack = tickFor(startTyping(), 0, 11_900)

    expect(beforeAttack.heroHp).toBe(100)
    expect(getAttackProgress(beforeAttack)).toBeCloseTo(11_900 / 12_000)

    const attacked = combatReducer(beforeAttack, { type: 'tick', now: 12_000 })

    expect(attacked.heroHp).toBe(90)
    expect(attacked.attackElapsedMs).toBe(0)
    expect(attacked.monsterAttackCount).toBe(1)
    expect(attacked.phase).toBe('typing')
  })

  it('caps the time elapsed between two actions', () => {
    const state = combatReducer(startTyping(), { type: 'tick', now: 60_000 })

    expect(state.attackElapsedMs).toBe(100)
    expect(state.heroHp).toBe(100)
  })

  it('ignores timestamps older than the last action', () => {
    const state = dispatch(
      startTyping(),
      { type: 'tick', now: 100 },
      { type: 'tick', now: 50 },
      { type: 'tick', now: 150 },
    )

    expect(state.attackElapsedMs).toBe(150)
  })

  describe('when the last letter and the attack happen together', () => {
    function almostDone(): CombatState {
      const typing = startTyping()
      const text = promptText(typing)
      const state = typeLetters(typing, text.slice(0, -1), 0, 0)
      return { ...state, attackElapsedMs: 11_950 }
    }

    it('lets the keystroke land first on a tie', () => {
      const state = almostDone()
      const done = typeLetters(state, promptText(state).slice(-1), 50)

      expect(done.phase).toBe('hero-attacking')
      expect(done.heroHp).toBe(100)
    })

    it('lets an earlier attack land first', () => {
      const state = almostDone()
      const done = typeLetters(state, promptText(state).slice(-1), 51)

      expect(done.phase).toBe('hero-attacking')
      expect(done.heroHp).toBe(90)
    })
  })

  it('kills the hero at 0 HP, even mid-prompt', () => {
    const fragile = { ...typeLetters(startTyping(), 'f', 0), heroHp: 10 }
    const dying = tickFor(fragile, 0, 12_000)

    expect(dying.heroHp).toBe(0)
    expect(dying.phase).toBe('hero-dying')
    expect(combatReducer(dying, { type: 'key-pressed', letter: 'f', at: 12_100 })).toBe(
      dying,
    )
    expect(
      combatReducer(dying, { type: 'animation-finished', phase: 'hero-dying' }).phase,
    ).toBe('defeat')
  })

  it('does not heal the hero between monsters', () => {
    const hit = tickFor(startTyping(), 0, 12_000)
    const nextMonster = defeatMonster(hit)

    expect(nextMonster.monsterNumber).toBe(2)
    expect(nextMonster.heroHp).toBe(90)
  })
})

describe('level progression', () => {
  it('brings the boss after 9 monsters and wins the level when it dies', () => {
    let state = createCombatState(setup, SEED)
    for (let monster = 1; monster <= 9; monster += 1) {
      state = defeatMonster(state)
    }

    expect(state.monsterNumber).toBe(10)
    expect(isBoss(state)).toBe(true)
    expect(state.monsterHp).toBe(75)

    const won = defeatMonster(state)
    expect(won.phase).toBe('victory')
  })
})

describe('combatReducer', () => {
  it('reaches the same state from the same seed and actions', () => {
    const play = () => defeatMonster(defeatMonster(createCombatState(setup, 99)))

    expect(play()).toEqual(play())
  })

  it('does not mutate the given state', () => {
    const typing = startTyping()
    const snapshot = structuredClone(typing)

    typeLetters(typing, `k${promptText(typing)}`, 0)
    tickFor(typing, 0, 12_000)

    expect(typing).toEqual(snapshot)
  })
})
