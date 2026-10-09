export type Hand = 'left' | 'right'

export type Finger = 'pinky' | 'ring' | 'middle' | 'index'

export interface FingerAssignment {
  readonly hand: Hand
  readonly finger: Finger
}

export type KeyboardLayout = Readonly<Record<string, FingerAssignment>>
