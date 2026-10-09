import { useState } from 'react'
import { CombatScreen } from '../ui/combat-screen'
import { TitleScreen } from '../ui/title-screen'

// Local screen switch until the screen flow feature introduces the game reducer.
type Screen = 'title' | 'combat'

export function App() {
  const [screen, setScreen] = useState<Screen>('title')

  if (screen === 'combat') {
    return <CombatScreen />
  }

  return <TitleScreen onStart={() => setScreen('combat')} />
}
