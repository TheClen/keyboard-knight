import { describe, expect, it } from 'vitest'
import {
  createPromptState,
  getPromptResult,
  isPromptComplete,
  typeLetter,
  type PromptState,
} from './prompt-typing'

function typeAll(state: PromptState, letters: string, startAt: number): PromptState {
  return [...letters].reduce(
    (current, letter, index) => typeLetter(current, letter, startAt + index * 100),
    state,
  )
}

describe('createPromptState', () => {
  it('starts with the cursor on the first letter and no error', () => {
    expect(createPromptState('fjfj', 1000)).toEqual({
      text: 'fjfj',
      cursor: 0,
      errorCount: 0,
      lastKeystroke: null,
      shownAt: 1000,
      completedAt: null,
    })
  })

  it('rejects an empty prompt', () => {
    expect(() => createPromptState('', 0)).toThrow('A prompt cannot be empty')
  })
})

describe('typeLetter', () => {
  it('advances the cursor on the expected letter', () => {
    const state = typeLetter(createPromptState('fj', 0), 'f', 100)

    expect(state.cursor).toBe(1)
    expect(state.lastKeystroke).toBe('correct')
    expect(state.errorCount).toBe(0)
  })

  it('keeps the cursor in place and counts an error on a wrong letter', () => {
    const state = typeLetter(createPromptState('fj', 0), 'j', 100)

    expect(state.cursor).toBe(0)
    expect(state.lastKeystroke).toBe('wrong')
    expect(state.errorCount).toBe(1)
  })

  it('counts every wrong keystroke on the same position', () => {
    const state = typeAll(createPromptState('fj', 0), 'jjd', 100)

    expect(state.cursor).toBe(0)
    expect(state.errorCount).toBe(3)
  })

  it('completes the prompt on the last expected letter', () => {
    const state = typeAll(createPromptState('fj', 0), 'fj', 100)

    expect(isPromptComplete(state)).toBe(true)
    expect(state.completedAt).toBe(200)
  })

  it('ignores keystrokes once the prompt is complete', () => {
    const complete = typeAll(createPromptState('fj', 0), 'fj', 100)

    expect(typeLetter(complete, 'f', 300)).toBe(complete)
    expect(typeLetter(complete, 'k', 300)).toBe(complete)
  })

  it('does not mutate the given state', () => {
    const state = createPromptState('fj', 0)
    const snapshot = { ...state }

    typeLetter(state, 'f', 100)
    typeLetter(state, 'k', 100)

    expect(state).toEqual(snapshot)
  })
})

describe('getPromptResult', () => {
  it('has no result while the prompt is in progress', () => {
    expect(getPromptResult(typeLetter(createPromptState('fj', 0), 'f', 100))).toBeNull()
  })

  it('reports a perfect prompt and its duration since it was shown', () => {
    const state = typeAll(createPromptState('fjjf', 1000), 'fjjf', 1500)

    expect(getPromptResult(state)).toEqual({ isPerfect: true, durationMs: 800 })
  })

  it('reports an imperfect prompt when any error was made', () => {
    const state = typeAll(createPromptState('fj', 0), 'fkj', 100)

    expect(getPromptResult(state)).toEqual({ isPerfect: false, durationMs: 300 })
  })
})
