import { describe, expect, it } from 'vitest'
import { initialGameState } from './game-state'

describe('initialGameState', () => {
  it('starts on the title screen', () => {
    expect(initialGameState.phase).toBe('title')
  })
})
