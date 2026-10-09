export interface LevelLetters {
  readonly number: number
  readonly newLetters: readonly string[]
}

export interface Level extends LevelLetters {
  readonly monsterAttackIntervalMs: number
  readonly gameOverMessage: string
}

export interface LetterPools {
  readonly newLetters: readonly string[]
  readonly oldLetters: readonly string[]
}

export function getLetterPools(
  levels: readonly LevelLetters[],
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
