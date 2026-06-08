"use client"

import { Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

export function PlaybackControls({
  step,
  total,
  playing,
  onPrev,
  onNext,
  onPlayToggle,
  onReset,
  onScrub,
  speed,
  onSpeedChange,
}: {
  step: number
  total: number
  playing: boolean
  onPrev: () => void
  onNext: () => void
  onPlayToggle: () => void
  onReset: () => void
  onScrub: (v: number) => void
  speed: number
  onSpeedChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="icon" onClick={onReset} aria-label="Reset">
          <RotateCcw className="size-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onPrev} disabled={step === 0} aria-label="Previous step">
          <SkipBack className="size-4" />
        </Button>
        <Button onClick={onPlayToggle} className="min-w-24" aria-label={playing ? "Pause" : "Play"}>
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          {playing ? "Pause" : "Play"}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          disabled={step >= total - 1}
          aria-label="Next step"
        >
          <SkipForward className="size-4" />
        </Button>
        <span className="ml-auto font-mono text-xs text-muted-foreground">
          step {String(step + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>

      <Slider
        value={[step]}
        min={0}
        max={Math.max(total - 1, 1)}
        step={1}
        onValueChange={(v: number | readonly number[]) => onScrub(Array.isArray(v) ? v[0] : (v as number))}
        aria-label="Scrub steps"
      />

      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-muted-foreground">speed</span>
        <Slider
          value={[speed]}
          min={300}
          max={2000}
          step={100}
          onValueChange={(v: number | readonly number[]) =>
            onSpeedChange(Array.isArray(v) ? v[0] : (v as number))
          }
          className="max-w-48"
          aria-label="Animation speed"
        />
        <span className="font-mono text-xs text-muted-foreground">{(speed / 1000).toFixed(1)}s</span>
      </div>
    </div>
  )
}

import { useEffect, useRef } from "react"

export function useAutoPlay(playing: boolean, atEnd: boolean, speed: number, advance: () => void) {
  const advanceRef = useRef(advance)
  advanceRef.current = advance
  useEffect(() => {
    if (!playing || atEnd) return
    const id = setInterval(() => advanceRef.current(), speed)
    return () => clearInterval(id)
  }, [playing, atEnd, speed])
}
