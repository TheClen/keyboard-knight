import { useState } from 'react'
import { TitleScreen } from '../ui/title-screen'
import { TypingTestScreen } from '../ui/typing-test-screen'

// Local screen switch until the screen flow feature introduces the game reducer.
type Screen = 'title' | 'typing-test'

export function App() {
  const [screen, setScreen] = useState<Screen>('title')

  if (screen === 'typing-test') {
    return <TypingTestScreen />
  }

  return <TitleScreen onStart={() => setScreen('typing-test')} />
}
