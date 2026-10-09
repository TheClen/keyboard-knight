export interface Level {
  readonly number: number
  readonly newLetters: readonly string[]
}

export interface LetterPools {
  readonly newLetters: readonly string[]
  readonly oldLetters: readonly string[]
}

export function getLetterPools(
  levels: readonly Level[],
  levelNumber: number,
): LetterPools {
  const level = levels.find((candidate) => candidate.number === levelNumber)

  if (!level) {
    throw new Error(`Level ${levelNumber} does not exist`)
  }

  const oldLetters = levels
    .filter((candidate) => candidate.number < levelNumber)
    .flatMap((candidate) => candidate.newLetters)

  return { newLetters: level.newLetters, oldLetters }
}
