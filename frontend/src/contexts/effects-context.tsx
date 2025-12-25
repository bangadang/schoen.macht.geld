'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

export type EffectType =
  | 'boot'
  | 'hacker'
  | 'drunk'
  | 'redacted'
  | 'crt'
  | 'neon'
  | 'dvd'
  | 'binary'
  | 'aurora'
  | 'glitch'

interface EffectsContextType {
  // Individual effects
  enabledEffects: Set<EffectType>
  toggleEffect: (effect: EffectType) => void
  isEffectEnabled: (effect: EffectType) => boolean
  disableAllEffects: () => void

  // Boot sequence
  bootComplete: boolean
  setBootComplete: (complete: boolean) => void

  // Settings panel
  settingsPanelOpen: boolean
  setSettingsPanelOpen: (open: boolean) => void

  // Reset on error
  resetEffects: () => void
}

const EffectsContext = createContext<EffectsContextType | null>(null)

const STORAGE_KEY = 'smg-effects-settings'

interface StoredSettings {
  enabledEffects: EffectType[]
}

export function EffectsProvider({ children }: { children: React.ReactNode }) {
  const [enabledEffects, setEnabledEffects] = useState<Set<EffectType>>(new Set())
  const [bootComplete, setBootComplete] = useState(false)
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const settings: StoredSettings = JSON.parse(stored)
        setEnabledEffects(new Set(settings.enabledEffects))
      }
    } catch {
      // Ignore localStorage errors
    }
    setHydrated(true)
  }, [])

  // Save settings to localStorage when they change
  useEffect(() => {
    if (!hydrated) return
    try {
      const settings: StoredSettings = {
        enabledEffects: Array.from(enabledEffects),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // Ignore localStorage errors
    }
  }, [enabledEffects, hydrated])

  // Keyboard shortcut: Ctrl/Cmd + Shift + E
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault()
        setSettingsPanelOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const toggleEffect = useCallback((effect: EffectType) => {
    setEnabledEffects((prev) => {
      const next = new Set(prev)
      if (next.has(effect)) {
        next.delete(effect)
      } else {
        next.add(effect)
      }
      return next
    })
  }, [])

  const isEffectEnabled = useCallback(
    (effect: EffectType) => {
      return enabledEffects.has(effect)
    },
    [enabledEffects]
  )

  const disableAllEffects = useCallback(() => {
    setEnabledEffects(new Set())
  }, [])

  const resetEffects = useCallback(() => {
    setEnabledEffects(new Set())
  }, [])

  return (
    <EffectsContext.Provider
      value={{
        enabledEffects,
        toggleEffect,
        isEffectEnabled,
        disableAllEffects,
        bootComplete,
        setBootComplete,
        settingsPanelOpen,
        setSettingsPanelOpen,
        resetEffects,
      }}
    >
      {children}
    </EffectsContext.Provider>
  )
}

export function useEffects() {
  const context = useContext(EffectsContext)
  if (!context) {
    throw new Error('useEffects must be used within an EffectsProvider')
  }
  return context
}
