import type { KeyboardLayout } from '../engine/keyboard'
import type { Level } from '../engine/levels'
import type { PromptConfig } from '../engine/prompt-generator'
import balanceJson from './balance.json'
import keyboardAzertyJson from './keyboard-azerty.json'
import levelsJson from './levels.json'

// JSON imports are widened to plain strings; data.test.ts guards these casts.
export const levels: readonly Level[] = levelsJson
export const keyboardAzerty = keyboardAzertyJson as KeyboardLayout
export const promptConfig: PromptConfig = balanceJson.prompt
