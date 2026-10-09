import { useEffect, useEffectEvent } from 'react'

export interface KeyInput {
  readonly key: string
  readonly repeat: boolean
  readonly ctrlKey: boolean
  readonly altKey: boolean
  readonly metaKey: boolean
}

/** Returns the lowercase letter a–z carried by a key press, or null if the game ignores it. */
export function toGameLetter(input: KeyInput): string | null {
  if (input.repeat || input.ctrlKey || input.altKey || input.metaKey) {
    return null
  }

  return /^[a-z]$/.test(input.key) ? input.key : null
}

export function useKeyDown(handler: (event: KeyboardEvent) => void): void {
  const onKeyDown = useEffectEvent(handler)

  useEffect(() => {
    const listener = (event: KeyboardEvent) => onKeyDown(event)
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [])
}
