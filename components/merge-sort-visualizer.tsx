"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Panel, SectionHeader, StepNote } from "@/components/algorithm-shell"
import { PlaybackControls, useAutoPlay } from "@/components/playback-controls"

// Each cell keeps a stable id so blocks can animate between positions.
type Cell = { id: number; value: number }

type Phase = "start" | "split" | "compare" | "place" | "merged" | "done"

type MergeStep = {
  cells: Cell[] // full array snapshot (ordered), each with stable id
  lo: number
  hi: number
  mid: number
  phase: Phase
  depth: number
  note: string
  // ids currently in the active sub-range
  activeIds: number[]
  // ids being directly compared
  compareIds: number[]
  // id just placed into final position this step
  placedId: number | null
}

function buildSteps(input: number[]): MergeStep[] {
  const steps: MergeStep[] = []
  const cells: Cell[] = input.map((value, i) => ({ id: i, value }))

  const idsIn = (lo: number, hi: number) => cells.slice(lo, hi + 1).map((c) => c.id)

  function record(s: Omit<MergeStep, "cells">) {
    steps.push({ ...s, cells: cells.map((c) => ({ ...c })) })
  }

  function sort(lo: number, hi: number, depth: number) {
    if (lo >= hi) return
    const mid = Math.floor((lo + hi) / 2)
    record({
      lo,
      hi,
      mid,
      phase: "split",
      depth,
      note: `Divide [${lo}…${hi}] into [${lo}…${mid}] and [${mid + 1}…${hi}].`,
      activeIds: idsIn(lo, hi),
      compareIds: [],
      placedId: null,
    })
    sort(lo, mid, depth + 1)
    sort(mid + 1, hi, depth + 1)

    // merge step-by-step
    const left = cells.slice(lo, mid + 1)
    const right = cells.slice(mid + 1, hi + 1)
    const merged: Cell[] = []
    let i = 0
    let j = 0
    while (i < left.length && j < right.length) {
      // show the comparison
      record({
        lo,
        hi,
        mid,
        phase: "compare",
        depth,
        note: `Compare ${left[i].value} and ${right[j].value} — take the smaller.`,
        activeIds: idsIn(lo, hi),
        compareIds: [left[i].id, right[j].id],
        placedId: null,
      })
      const pick = left[i].value <= right[j].value ? left[i++] : right[j++]
      merged.push(pick)
      // Rebuild the whole sub-range as (placed) + (remaining left) + (remaining right).
      // This keeps a valid permutation so blocks slide/swap instead of disappearing.
      const sub = [...merged, ...left.slice(i), ...right.slice(j)]
      for (let k = 0; k < sub.length; k++) cells[lo + k] = sub[k]
      record({
        lo,
        hi,
        mid,
        phase: "place",
        depth,
        note: `Place ${pick.value} into position ${lo + merged.length - 1}.`,
        activeIds: idsIn(lo, hi),
        compareIds: [],
        placedId: pick.id,
      })
    }
    while (i < left.length) {
      const pick = left[i++]
      merged.push(pick)
      const sub = [...merged, ...left.slice(i), ...right.slice(j)]
      for (let k = 0; k < sub.length; k++) cells[lo + k] = sub[k]
      record({
        lo,
        hi,
        mid,
        phase: "place",
        depth,
        note: `Carry remaining ${pick.value} into position ${lo + merged.length - 1}.`,
        activeIds: idsIn(lo, hi),
        compareIds: [],
        placedId: pick.id,
      })
    }
    while (j < right.length) {
      const pick = right[j++]
      merged.push(pick)
      const sub = [...merged, ...left.slice(i), ...right.slice(j)]
      for (let k = 0; k < sub.length; k++) cells[lo + k] = sub[k]
      record({
        lo,
        hi,
        mid,
        phase: "place",
        depth,
        note: `Carry remaining ${pick.value} into position ${lo + merged.length - 1}.`,
        activeIds: idsIn(lo, hi),
        compareIds: [],
        placedId: pick.id,
      })
    }
    record({
      lo,
      hi,
      mid,
      phase: "merged",
      depth,
      note: `Sub-array [${lo}…${hi}] is now sorted.`,
      activeIds: idsIn(lo, hi),
      compareIds: [],
      placedId: null,
    })
  }

  record({
    lo: 0,
    hi: cells.length - 1,
    mid: -1,
    phase: "start",
    depth: 0,
    note: "Starting array — divide until each piece holds a single element.",
    activeIds: idsIn(0, cells.length - 1),
    compareIds: [],
    placedId: null,
  })
  sort(0, cells.length - 1, 0)
  record({
    lo: 0,
    hi: cells.length - 1,
    mid: -1,
    phase: "done",
    depth: 0,
    note: "Array fully sorted.",
    activeIds: idsIn(0, cells.length - 1),
    compareIds: [],
    placedId: null,
  })
  return steps
}

const presets: number[][] = [
  [38, 27, 43, 3, 9, 82, 10],
  [5, 2, 8, 1, 9, 3],
  [64, 34, 25, 12, 22, 11, 90, 5],
]

function randomArray() {
  const n = 7
  return Array.from({ length: n }, () => Math.floor(Math.random() * 95) + 5)
}

const GAP = 8 // px gap between blocks

export function MergeSortVisualizer() {
  const [input, setInput] = useState(presets[0])
  const [arrayInput, setArrayInput] = useState(presets[0].join(", "))
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(900)

  const steps = useMemo(() => buildSteps(input), [input])
  const total = steps.length
  const atEnd = step >= total - 1
  const current = steps[step]
  const maxVal = Math.max(...input)
  const n = input.length

  useAutoPlay(playing, atEnd, speed, () => setStep((s) => Math.min(s + 1, total - 1)))

  function load(arr: number[]) {
    setInput(arr)
    setArrayInput(arr.join(", "))
    setStep(0)
    setPlaying(false)
  }

  function applyCustom() {
    const parsed = arrayInput
      .split(/[,\s]+/)
      .map((x) => Number(x))
      .filter((x) => Number.isFinite(x) && x > 0)
      .slice(0, 12)
    load(parsed.length > 0 ? parsed : presets[0])
  }

  // map id -> index in current ordering for positioning
  const indexById = new Map<number, number>()
  current.cells.forEach((c, i) => indexById.set(c.id, i))

  return (
    <section className="flex flex-col gap-8 scroll-mt-24" id="merge-sort">
      <SectionHeader index="02" title="Merge Sort" complexity="O(n log n)">
        Merge sort recursively splits the array in half until each piece holds a single element, then
        merges the pieces back in sorted order. Watch the blocks glide into place: blue marks the active
        sub-array, amber the two values being compared, and green the elements locked into final order.
      </SectionHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Panel>
          <div className="flex flex-col gap-6">
            {/* Animation stage: blocks positioned absolutely by index so they slide on reorder */}
            <div className="relative h-64 w-full md:h-72">
              {current.cells.map((cell) => {
                const idx = indexById.get(cell.id) ?? 0
                const inRange = current.activeIds.includes(cell.id)
                const isComparing = current.compareIds.includes(cell.id)
                const isPlaced = current.placedId === cell.id
                const isMerged = current.phase === "merged" && inRange
                const isDone = current.phase === "done"

                let blockClass = "bg-secondary text-muted-foreground border border-border"
                if (isDone) blockClass = "bg-primary text-primary-foreground border border-primary"
                else if (isPlaced) blockClass = "bg-primary text-primary-foreground border border-primary"
                else if (isMerged) blockClass = "bg-primary/70 text-primary-foreground border border-primary/70"
                else if (isComparing) blockClass = "bg-chart-3 text-background border border-chart-3"
                else if (inRange && current.phase === "split")
                  blockClass = "bg-chart-2 text-background border border-chart-2"
                else if (inRange) blockClass = "bg-chart-2/30 text-foreground border border-chart-2/50"

                const widthPct = 100 / n
                const heightPct = 18 + (cell.value / maxVal) * 78

                return (
                  <div
                    key={cell.id}
                    className="absolute bottom-0 flex items-end justify-center transition-all duration-500 ease-out"
                    style={{
                      left: `calc(${idx * widthPct}% + ${GAP / 2}px)`,
                      width: `calc(${widthPct}% - ${GAP}px)`,
                      height: "100%",
                    }}
                  >
                    <div
                      className={`flex w-full items-start justify-center rounded-md pt-1.5 font-mono text-xs font-semibold tabular-nums transition-all duration-500 ease-out ${blockClass} ${
                        isComparing ? "scale-105 shadow-lg shadow-chart-3/30" : ""
                      } ${isPlaced ? "scale-105" : ""}`}
                      style={{ height: `${heightPct}%` }}
                    >
                      {cell.value}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* legend + phase badge */}
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 font-mono text-xs ${
                  current.phase === "split"
                    ? "bg-chart-2/20 text-chart-2"
                    : current.phase === "compare"
                      ? "bg-chart-3/20 text-chart-3"
                      : current.phase === "done"
                        ? "bg-primary/20 text-primary"
                        : "bg-primary/15 text-primary"
                }`}
              >
                {current.phase === "split"
                  ? "dividing"
                  : current.phase === "compare"
                    ? "comparing"
                    : current.phase === "place"
                      ? "placing"
                      : current.phase === "merged"
                        ? "merged"
                        : current.phase === "done"
                          ? "sorted"
                          : "start"}
              </span>
              <span className="font-mono text-xs text-muted-foreground">depth {current.depth}</span>
              <div className="ml-auto flex flex-wrap items-center gap-3 font-mono text-[10px] text-muted-foreground">
                <Legend className="bg-chart-2" label="active" />
                <Legend className="bg-chart-3" label="comparing" />
                <Legend className="bg-primary" label="placed" />
              </div>
            </div>

            <StepNote
              tone={atEnd ? "done" : current.phase === "compare" || current.phase === "place" ? "active" : "default"}
            >
              {current.note}
            </StepNote>
          </div>
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel>
            <PlaybackControls
              step={step}
              total={total}
              playing={playing}
              speed={speed}
              onSpeedChange={setSpeed}
              onPrev={() => setStep((s) => Math.max(s - 1, 0))}
              onNext={() => setStep((s) => Math.min(s + 1, total - 1))}
              onPlayToggle={() => {
                if (atEnd) setStep(0)
                setPlaying((p) => !p)
              }}
              onReset={() => {
                setStep(0)
                setPlaying(false)
              }}
              onScrub={(v) => {
                setPlaying(false)
                setStep(v)
              }}
            />
          </Panel>

          <Panel>
            <div className="flex flex-col gap-3">
              <span className="font-mono text-xs text-muted-foreground">your own array</span>
              <form
                className="flex flex-col gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  applyCustom()
                }}
              >
                <Input
                  value={arrayInput}
                  onChange={(e) => setArrayInput(e.target.value)}
                  className="font-mono text-xs"
                  aria-label="custom array"
                  placeholder="e.g. 38, 27, 43, 3, 9"
                />
                <Button type="submit" className="font-mono">
                  sort it
                </Button>
              </form>
              <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                Comma separated, up to 12 positive numbers.
              </p>

              <span className="mt-1 font-mono text-xs text-muted-foreground">or pick a dataset</span>
              <div className="flex flex-col gap-2">
                {presets.map((p, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="justify-start font-mono text-xs"
                    onClick={() => load(p)}
                  >
                    [{p.join(", ")}]
                  </Button>
                ))}
                <Button variant="secondary" size="sm" className="font-mono" onClick={() => load(randomArray())}>
                  shuffle random
                </Button>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </section>
  )
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`size-2.5 rounded-sm ${className}`} />
      {label}
    </span>
  )
}
