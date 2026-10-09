import { useEffect, useEffectEvent } from 'react'

/** Calls `callback` on every frame with a timestamp sharing performance.now()'s origin. */
export function useAnimationFrame(callback: (now: number) => void): void {
  const onFrame = useEffectEvent(callback)

  useEffect(() => {
    let frameId = requestAnimationFrame(function loop(now) {
      onFrame(now)
      frameId = requestAnimationFrame(loop)
    })
    return () => cancelAnimationFrame(frameId)
  }, [])
}
