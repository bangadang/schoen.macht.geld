'use client'

import { Settings } from 'lucide-react'
import { useEffects, EffectType } from '@/contexts/effects-context'
import { useEvents } from '@/contexts/events-context'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

interface EffectOption {
  id: EffectType
  label: string
  description: string
}

const VISUAL_MODES: EffectOption[] = [
  {
    id: 'hacker',
    label: 'Hacker Mode',
    description: 'Matrix rain with green terminal aesthetic',
  },
  {
    id: 'drunk',
    label: 'Drunk Mode',
    description: 'Wobble and blur for after-hours trading',
  },
  {
    id: 'redacted',
    label: 'Redacted Mode',
    description: 'Classified document with black bars',
  },
  {
    id: 'crt',
    label: 'CRT Scanlines',
    description: 'Retro monitor with scanlines and flicker',
  },
  {
    id: 'neon',
    label: 'Neon Glow',
    description: 'Cyberpunk glowing edges and borders',
  },
  {
    id: 'glitch',
    label: 'Glitch/Static',
    description: 'VHS tracking errors and chromatic aberration',
  },
  {
    id: 'dvd',
    label: 'DVD Logo',
    description: 'Classic bouncing logo screensaver',
  },
  {
    id: 'binary',
    label: 'Binary Rain',
    description: 'Subtle 0s and 1s in the margins',
  },
  {
    id: 'aurora',
    label: 'Aurora Waves',
    description: 'Slow-moving northern lights gradients',
  },
]

export function SettingsPanel() {
  const {
    enabledEffects,
    toggleEffect,
    disableAllEffects,
    settingsPanelOpen,
    setSettingsPanelOpen,
  } = useEffects()

  const { eventsEnabled, setEventsEnabled } = useEvents()

  const renderEffectToggle = (effect: EffectOption) => (
    <div key={effect.id} className="flex items-center justify-between">
      <div>
        <Label htmlFor={effect.id} className="text-base">
          {effect.label}
        </Label>
        <p className="text-sm text-muted-foreground">{effect.description}</p>
      </div>
      <Switch
        id={effect.id}
        checked={enabledEffects.has(effect.id)}
        onCheckedChange={() => toggleEffect(effect.id)}
      />
    </div>
  )

  return (
    <>
      {/* Floating settings button - hidden when panel is open */}
      {!settingsPanelOpen && (
        <button
          onClick={() => setSettingsPanelOpen(true)}
          data-effects-settings
          className="fixed bottom-4 right-4 z-[9990] p-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white shadow-lg transition-all hover:scale-110"
          title="Visual Effects Settings (Ctrl+Shift+E)"
        >
          <Settings className="h-5 w-5" />
        </button>
      )}

      {/* Settings sheet */}
      <Sheet open={settingsPanelOpen} onOpenChange={setSettingsPanelOpen}>
        <SheetContent side="right" className="w-80 z-[200] flex flex-col">
          <SheetHeader className="flex-shrink-0">
            <SheetTitle>Settings</SheetTitle>
            <SheetDescription>
              Toggle effects. Use Ctrl+Shift+E to open this panel.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6 flex-1 overflow-y-auto pr-2">
            {/* Animations section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Animations
              </h4>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="boot" className="text-base">
                    Terminal Boot
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Fake boot sequence on page load
                  </p>
                </div>
                <Switch
                  id="boot"
                  checked={enabledEffects.has('boot')}
                  onCheckedChange={() => toggleEffect('boot')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="events" className="text-base">
                    Event Celebrations
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    New #1, all-time highs, crashes
                  </p>
                </div>
                <Switch
                  id="events"
                  checked={eventsEnabled}
                  onCheckedChange={setEventsEnabled}
                />
              </div>
            </div>

            <Separator />

            {/* Visual Effects header with disable button */}
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Visual Effects
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={disableAllEffects}
                className="text-xs"
              >
                Disable All
              </Button>
            </div>

            {/* Visual modes */}
            <div className="space-y-4">
              {VISUAL_MODES.map(renderEffectToggle)}
            </div>

            <Separator />

            {/* Info */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Settings are saved to your browser.</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}