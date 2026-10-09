import { describe, expect, it } from 'vitest'
import { toGameLetter, type KeyInput } from './keyboard'

function keyInput(key: string, overrides: Partial<KeyInput> = {}): KeyInput {
  return {
    key,
    repeat: false,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    ...overrides,
  }
}

describe('toGameLetter', () => {
  it('accepts lowercase letters', () => {
    expect(toGameLetter(keyInput('f'))).toBe('f')
    expect(toGameLetter(keyInput('z'))).toBe('z')
  })

  it.each(['F', '1', 'é', ' ', ';', 'Enter', 'Shift', 'Escape'])(
    'ignores "%s"',
    (key) => {
      expect(toGameLetter(keyInput(key))).toBeNull()
    },
  )

  it('ignores auto-repeated key presses', () => {
    expect(toGameLetter(keyInput('f', { repeat: true }))).toBeNull()
  })

  it.each(['ctrlKey', 'altKey', 'metaKey'] as const)(
    'ignores letters combined with %s',
    (modifier) => {
      expect(toGameLetter(keyInput('r', { [modifier]: true }))).toBeNull()
    },
  )
})
