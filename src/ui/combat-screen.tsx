import { useEffect, useReducer, useState, type AnimationEvent } from 'react'
import { combatConfig, levels, promptConfig } from '../data'
import {
  combatReducer,
  createCombatState,
  getAttackProgress,
  isBoss,
  type AnimatedCombatPhase,
  type CombatSetup,
  type CombatState,
} from '../engine/combat'
import { getComboBonus } from '../engine/combat-rules'
import { getLetterPools } from '../engine/levels'
import { toGameLetter, useKeyDown } from './keyboard'
import { PromptDisplay } from './prompt-display'
import { useAnimationFrame } from './use-animation-frame'

// Level 1 only until the screen flow feature handles level selection.
const level = levels.find((candidate) => candidate.number === 1)
if (!level) {
  throw new Error('Level 1 is missing from the data')
}

const combatSetup: CombatSetup = {
  level,
  letterPools: getLetterPools(levels, level.number),
  promptConfig,
  combatConfig,
}

function createInitialState(): CombatState {
  return createCombatState(combatSetup, Math.floor(Math.random() * 2 ** 32))
}

interface GaugeProps {
  readonly label: string
  readonly value: number
  readonly max: number
  readonly variant: 'hero-hp' | 'monster-hp' | 'attack'
  readonly showValue?: boolean
}

function Gauge({ label, value, max, variant, showValue = true }: GaugeProps) {
  return (
    <div className="gauge">
      <span className="gauge-label">
        {label}
        {showValue && ` ${value}/${max}`}
      </span>
      <div
        className={`gauge-track gauge-track--${variant}`}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
      >
        <div className="gauge-fill" style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  )
}

function Combat({ onRestart }: { readonly onRestart: () => void }) {
  const [state, dispatch] = useReducer(combatReducer, undefined, createInitialState)

  useAnimationFrame((now) => {
    if (state.phase === 'typing') {
      dispatch({ type: 'tick', now })
    }
  })

  useKeyDown((event) => {
    if (state.phase === 'victory' || state.phase === 'defeat') {
      if (event.key === 'Enter' && !event.repeat) {
        onRestart()
      }
      return
    }

    const letter = toGameLetter(event)
    if (letter !== null) {
      // event.timeStamp shares its time origin with performance.now()
      dispatch({ type: 'key-pressed', letter, at: event.timeStamp })
    }
  })

  useEffect(() => {
    if (state.phase === 'prompt-pending') {
      dispatch({ type: 'prompt-shown', at: performance.now() })
    }
  }, [state.phase])

  /** Reports the end of a blocking animation owned by this element. */
  function finishAnimation(
    event: AnimationEvent,
    ownedPhases: readonly AnimatedCombatPhase[],
  ) {
    // Ignore animations bubbling up from children (hit flash, damage number).
    if (event.target !== event.currentTarget) {
      return
    }
    const phase = ownedPhases.find((candidate) => candidate === state.phase)
    if (phase) {
      dispatch({ type: 'animation-finished', phase })
    }
  }

  const boss = isBoss(state)
  const comboPercent = Math.round(getComboBonus(state.perfectStreak, combatConfig) * 100)
  const promptText = state.prompt?.text ?? state.pendingPromptText

  return (
    <main className="game-frame" aria-label="Combat">
      <section className="combat-screen">
        <header className="combat-hud">
          <Gauge
            label="Héros"
            value={state.heroHp}
            max={combatConfig.heroMaxHp}
            variant="hero-hp"
          />
          <p className="combat-progress">
            {boss
              ? 'BOSS'
              : `Monstre ${state.monsterNumber}/${combatConfig.monstersPerLevel}`}
          </p>
          <p className="combat-combo">Combo +{comboPercent} %</p>
          <div className="combat-monster-gauges">
            <Gauge
              label={boss ? 'Boss' : 'Monstre'}
              value={state.monsterHp}
              max={state.monsterMaxHp}
              variant="monster-hp"
            />
            <Gauge
              label="Attaque"
              value={Math.round(getAttackProgress(state) * 100)}
              max={100}
              variant="attack"
              showValue={false}
            />
          </div>
        </header>

        <div className="combat-arena">
          <div className="hero-column">
            <div
              className={`hero hero--${state.phase}`}
              onAnimationEnd={(event) =>
                finishAnimation(event, ['hero-attacking', 'hero-dying'])
              }
            >
              {state.monsterAttackCount > 0 && (
                <span
                  key={state.monsterAttackCount}
                  className="hero-hit"
                  aria-hidden="true"
                />
              )}
            </div>
          </div>

          <div className="monster-column">
            {/* Always rendered so the monster does not move when the prompt hides. */}
            <div className="prompt-slot">
              {promptText !== null && (
                <PromptDisplay
                  text={promptText}
                  cursor={state.prompt?.cursor ?? 0}
                  errorCount={state.prompt?.errorCount ?? 0}
                  hasError={state.prompt?.lastKeystroke === 'wrong'}
                />
              )}
            </div>
            <div
              key={state.monsterNumber}
              className={`monster ${boss ? 'monster--boss' : ''} monster--${state.phase}`}
              onAnimationEnd={(event) =>
                finishAnimation(event, ['monster-entering', 'monster-dying'])
              }
            >
              {state.phase === 'hero-attacking' && state.lastHeroAttack !== null && (
                <p className="damage-number" aria-live="polite">
                  -{state.lastHeroAttack.damage}
                  {state.lastHeroAttack.isCritical && (
                    <span className="attack-bonus attack-bonus--critical">
                      Critique !
                    </span>
                  )}
                  {state.lastHeroAttack.isFast && (
                    <span className="attack-bonus attack-bonus--fast">Rapide !</span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {(state.phase === 'victory' || state.phase === 'defeat') && (
          <div className="combat-end" role="status">
            <p className="combat-end-title">
              {state.phase === 'victory'
                ? 'Victoire !'
                : combatSetup.level.gameOverMessage}
            </p>
            <p className="status">Appuyez sur Entrée pour recommencer</p>
          </div>
        )}
      </section>
    </main>
  )
}

export function CombatScreen() {
  const [run, setRun] = useState(0)

  // A new key remounts the combat with a fresh state and seed.
  return <Combat key={run} onRestart={() => setRun((current) => current + 1)} />
}
