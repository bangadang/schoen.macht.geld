'use client'

import { useEffect } from 'react'
import { useEffects, EffectType } from '@/contexts/effects-context'
import { TerminalBoot } from './terminal-boot'
import { HackerMode } from './hacker-mode'
import { DrunkMode } from './drunk-mode'
import { RedactedMode } from './redacted-mode'
import { CrtMode } from './crt-mode'
import { NeonMode } from './neon-mode'
import { GlitchMode } from './glitch-mode'
import { DvdMode } from './dvd-mode'
import { BinaryMode } from './binary-mode'
import { AuroraMode } from './aurora-mode'
import { SettingsPanel } from './settings-panel'

// Effects that need body classes for CSS styling
const BODY_CLASS_EFFECTS: EffectType[] = ['hacker', 'drunk', 'redacted', 'crt', 'neon', 'glitch']

export function EffectsLayer() {
  const { isEffectEnabled } = useEffects()

  // Sync body classes with enabled effects
  useEffect(() => {
    const body = document.body

    BODY_CLASS_EFFECTS.forEach((effect) => {
      const className = `effect-${effect}`
      if (isEffectEnabled(effect)) {
        body.classList.add(className)
      } else {
        body.classList.remove(className)
      }
    })

    // Legacy class names for backward compatibility
    if (isEffectEnabled('hacker')) {
      body.classList.add('hacker-mode')
    } else {
      body.classList.remove('hacker-mode')
    }
    if (isEffectEnabled('drunk')) {
      body.classList.add('drunk-mode')
    } else {
      body.classList.remove('drunk-mode')
    }
    if (isEffectEnabled('redacted')) {
      body.classList.add('redacted-mode')
    } else {
      body.classList.remove('redacted-mode')
    }

    return () => {
      BODY_CLASS_EFFECTS.forEach((effect) => {
        body.classList.remove(`effect-${effect}`)
      })
      body.classList.remove('hacker-mode', 'drunk-mode', 'redacted-mode')
    }
  }, [isEffectEnabled])

  return (
    <>
      <TerminalBoot />
      <HackerMode />
      <DrunkMode />
      <RedactedMode />
      <CrtMode />
      <NeonMode />
      <GlitchMode />
      <DvdMode />
      <BinaryMode />
      <AuroraMode />
      <SettingsPanel />
    </>
  )
}

export { TerminalBoot } from './terminal-boot'
export { HackerMode } from './hacker-mode'
export { DrunkMode } from './drunk-mode'
export { RedactedMode } from './redacted-mode'
export { CrtMode } from './crt-mode'
export { NeonMode } from './neon-mode'
export { GlitchMode } from './glitch-mode'
export { DvdMode } from './dvd-mode'
export { BinaryMode } from './binary-mode'
export { AuroraMode } from './aurora-mode'
export { SettingsPanel } from './settings-panel'
