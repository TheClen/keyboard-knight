import { useState } from 'react'
import { levels, promptConfig } from '../data'
import { getLetterPools } from '../engine/levels'
import { generatePrompt } from '../engine/prompt-generator'
import {
  createPromptState,
  getPromptResult,
  typeLetter,
  type PromptResult,
  type PromptState,
} from '../engine/prompt-typing'
import { toGameLetter, useKeyDown } from './keyboard'

// Temporary screen: plays level 1 prompts until the combat feature replaces it.
const testLevelPools = getLetterPools(levels, 1)

function createNextPrompt(): PromptState {
  // No animation here: the prompt is visible as soon as it is created.
  return createPromptState(
    generatePrompt(testLevelPools, promptConfig, Math.random),
    performance.now(),
  )
}

const durationFormat = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export function TypingTestScreen() {
  const [prompt, setPrompt] = useState(createNextPrompt)
  const [lastResult, setLastResult] = useState<PromptResult | null>(null)

  useKeyDown((event) => {
    const letter = toGameLetter(event)
    if (letter === null) {
      return
    }

    // event.timeStamp shares its time origin with performance.now()
    const next = typeLetter(prompt, letter, event.timeStamp)
    const result = getPromptResult(next)

    if (result) {
      setLastResult(result)
      setPrompt(createNextPrompt())
    } else {
      setPrompt(next)
    }
  })

  const hasError = prompt.lastKeystroke === 'wrong'

  return (
    <main className="game-frame" aria-labelledby="typing-test-title">
      <section className="typing-test-screen">
        <h1 id="typing-test-title" className="eyebrow">
          Entraînement — niveau 1
        </h1>
        <p
          // Remounting on each error restarts the flash animation.
          key={prompt.errorCount}
          className={hasError ? 'prompt prompt--error' : 'prompt'}
        >
          {[...prompt.text].map((letter, index) => (
            <span
              key={index}
              className={
                index < prompt.cursor
                  ? 'prompt-letter prompt-letter--done'
                  : index === prompt.cursor
                    ? 'prompt-letter prompt-letter--current'
                    : 'prompt-letter'
              }
            >
              {letter}
            </span>
          ))}
        </p>
        <p className="status" aria-live="polite">
          {lastResult
            ? `${lastResult.isPerfect ? 'Parfait !' : 'Avec erreurs'} — ${durationFormat.format(lastResult.durationMs / 1000)} s`
            : 'Tapez les lettres affichées.'}
        </p>
      </section>
    </main>
  )
}
