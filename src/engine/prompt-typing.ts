export type KeystrokeOutcome = 'correct' | 'wrong'

export interface PromptState {
  readonly text: string
  readonly cursor: number
  readonly errorCount: number
  readonly lastKeystroke: KeystrokeOutcome | null
  /** Timestamp (ms) at which the prompt became visible to the player. */
  readonly shownAt: number
  /** Timestamp (ms) of the last correct letter, once the prompt is complete. */
  readonly completedAt: number | null
}

export interface PromptResult {
  readonly isPerfect: boolean
  readonly durationMs: number
}

export function createPromptState(text: string, shownAt: number): PromptState {
  if (text.length === 0) {
    throw new Error('A prompt cannot be empty')
  }

  return {
    text,
    cursor: 0,
    errorCount: 0,
    lastKeystroke: null,
    shownAt,
    completedAt: null,
  }
}

export function isPromptComplete(state: PromptState): boolean {
  return state.completedAt !== null
}

/** Applies a lowercase letter typed at the given timestamp (ms). */
export function typeLetter(state: PromptState, letter: string, at: number): PromptState {
  if (isPromptComplete(state)) {
    return state
  }

  if (letter !== state.text[state.cursor]) {
    return { ...state, errorCount: state.errorCount + 1, lastKeystroke: 'wrong' }
  }

  const cursor = state.cursor + 1

  return {
    ...state,
    cursor,
    lastKeystroke: 'correct',
    completedAt: cursor === state.text.length ? at : null,
  }
}

export function getPromptResult(state: PromptState): PromptResult | null {
  if (state.completedAt === null) {
    return null
  }

  return {
    isPerfect: state.errorCount === 0,
    durationMs: state.completedAt - state.shownAt,
  }
}
