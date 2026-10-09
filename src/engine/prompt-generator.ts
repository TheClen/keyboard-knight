import type { LetterPools } from './levels'

/** Returns a number in [0, 1), like Math.random. */
export type Random = () => number

export interface PromptConfig {
  readonly minLength: number
  readonly maxLength: number
  readonly newLetterRatio: number
}

function pickIndex(length: number, random: Random): number {
  return Math.floor(random() * length)
}

function pickLetter(letters: readonly string[], random: Random): string {
  const letter = letters[pickIndex(letters.length, random)]

  if (letter === undefined) {
    throw new Error('Cannot pick a letter from an empty pool')
  }

  return letter
}

export function generatePrompt(
  pools: LetterPools,
  config: PromptConfig,
  random: Random,
): string {
  const length =
    config.minLength + pickIndex(config.maxLength - config.minLength + 1, random)

  const letters = Array.from({ length }, () => {
    const useNewLetter = pools.oldLetters.length === 0 || random() < config.newLetterRatio
    return pickLetter(useNewLetter ? pools.newLetters : pools.oldLetters, random)
  })

  if (!letters.some((letter) => pools.newLetters.includes(letter))) {
    letters[pickIndex(length, random)] = pickLetter(pools.newLetters, random)
  }

  return letters.join('')
}
