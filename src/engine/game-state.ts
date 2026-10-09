export type GamePhase =
  | 'title'
  | 'tutorial'
  | 'combat'
  | 'treasure'
  | 'summary'
  | 'game-over'
  | 'paused'
  | 'coming-soon'

export interface GameState {
  readonly phase: GamePhase
}

export const initialGameState: GameState = {
  phase: 'title',
}
