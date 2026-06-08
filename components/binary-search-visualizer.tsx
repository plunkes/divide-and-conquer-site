"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Panel, SectionHeader, StepNote } from "@/components/algorithm-shell"
import { PlaybackControls, useAutoPlay } from "@/components/playback-controls"

type SearchStep = {
  lo: number
  hi: number
  mid: number
  comparison: "found" | "go-right" | "go-left" | "not-found"
  note: string
}

function buildSteps(arr: number[], target: number): SearchStep[] {
  const steps: SearchStep[] = []
  let lo = 0
  let hi = arr.length - 1
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (arr[mid] === target) {
      steps.push({ lo, hi, mid, comparison: "found", note: `arr[${mid}] = ${arr[mid]} = alvo. Encontrado no índice ${mid}.` })
      return steps
    }
    if (arr[mid] < target) {
      steps.push({
        lo,
        hi,
        mid,
        comparison: "go-right",
        note: `arr[${mid}] = ${arr[mid]} < ${target}. Descartar metade esquerda, buscar [${mid + 1}…${hi}].`,
      })
      lo = mid + 1
    } else {
      steps.push({
        lo,
        hi,
        mid,
        comparison: "go-left",
        note: `arr[${mid}] = ${arr[mid]} > ${target}. Descartar metade direita, buscar [${lo}…${mid - 1}].`,
      })
      hi = mid - 1
    }
  }
  steps.push({ lo, hi, mid: -1, comparison: "not-found", note: `${target} não está no array.` })
  return steps
}

const baseArray = [3, 8, 12, 17, 23, 29, 34, 41, 47, 53, 58, 64, 70, 77, 85]
const targetPresets = [41, 3, 85, 50]

export function BinarySearchVisualizer() {
  const [array, setArray] = useState<number[]>(baseArray)
  const [target, setTarget] = useState(41)
  const [arrayInput, setArrayInput] = useState(baseArray.join(", "))
  const [targetInput, setTargetInput] = useState("41")
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1100)

  const steps = useMemo(() => buildSteps(array, target), [array, target])
  const total = steps.length
  const atEnd = step >= total - 1
  const current = steps[step]

  useAutoPlay(playing, atEnd, speed, () => setStep((s) => Math.min(s + 1, total - 1)))

  function load(t: number) {
    setTarget(t)
    setTargetInput(String(t))
    setStep(0)
    setPlaying(false)
  }

  function applyCustom() {
    const parsed = arrayInput
      .split(/[,\s]+/)
      .map((x) => Number(x))
      .filter((x) => Number.isFinite(x))
    // binary search requires a sorted array
    const sorted = Array.from(new Set(parsed)).sort((p, q) => p - q)
    const arr = sorted.length > 0 ? sorted : baseArray
    const t = Number.isFinite(Number(targetInput)) ? Math.floor(Number(targetInput)) : arr[0]
    setArray(arr)
    setArrayInput(arr.join(", "))
    setTarget(t)
    setTargetInput(String(t))
    setStep(0)
    setPlaying(false)
  }

  return (
    <section className="flex flex-col gap-8 scroll-mt-24" id="binary-search">
      <SectionHeader index="03" title="Busca Binária" complexity="O(log n)">
        A busca binária localiza um valor em um array ordenado reduzindo repetidamente o intervalo de
        busca pela metade. Ela verifica o elemento do meio e descarta a metade que não pode conter o
        alvo, cortando o tamanho do problema pela metade a cada passo.
      </SectionHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Panel>
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap justify-center gap-2">
              {array.map((v, i) => {
                const inRange = i >= current.lo && i <= current.hi
                const isMid = i === current.mid
                const isFound = isMid && current.comparison === "found"
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className={`flex size-11 items-center justify-center rounded-md border font-mono text-sm font-medium transition-all duration-300 md:size-12 ${
                        isFound
                          ? "border-primary bg-primary text-primary-foreground scale-110"
                          : isMid
                            ? "border-chart-3 bg-chart-3/20 text-foreground scale-105"
                            : inRange
                              ? "border-border bg-secondary text-foreground"
                              : "border-border/40 bg-transparent text-muted-foreground/40"
                      }`}
                    >
                      {v}
                    </div>
                    <span
                      className={`font-mono text-[10px] ${isMid ? "text-chart-3" : "text-muted-foreground/50"}`}
                    >
                      {i}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-xs text-muted-foreground">
              <span>
                alvo: <span className="text-foreground">{target}</span>
              </span>
              <span>
                lo: <span className="text-foreground">{current.lo}</span>
              </span>
              <span>
                hi: <span className="text-foreground">{current.hi}</span>
              </span>
              <span>
                mid: <span className="text-chart-3">{current.mid >= 0 ? current.mid : "—"}</span>
              </span>
            </div>

            <StepNote
              tone={current.comparison === "found" ? "active" : current.comparison === "not-found" ? "done" : "default"}
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
              <span className="font-mono text-xs text-muted-foreground">seu próprio array &amp; alvo</span>
              <form
                className="flex flex-col gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  applyCustom()
                }}
              >
                <label className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    array (separado por vírgula — auto-ordenado)
                  </span>
                  <Input
                    value={arrayInput}
                    onChange={(e) => setArrayInput(e.target.value)}
                    className="font-mono text-xs"
                    aria-label="array personalizado"
                  />
                </label>
                <div className="flex items-end gap-2">
                  <label className="flex flex-1 flex-col gap-1">
                    <span className="font-mono text-[10px] text-muted-foreground">alvo</span>
                    <Input
                      inputMode="numeric"
                      value={targetInput}
                      onChange={(e) => setTargetInput(e.target.value.replace(/[^0-9-]/g, ""))}
                      className="font-mono"
                      aria-label="alvo personalizado"
                    />
                  </label>
                  <Button type="submit" className="font-mono">
                    executar
                  </Button>
                </div>
              </form>

              <span className="mt-1 font-mono text-xs text-muted-foreground">ou busque um preset</span>
              <div className="grid grid-cols-2 gap-2">
                {targetPresets.map((t) => (
                  <Button
                    key={t}
                    variant={t === target ? "default" : "outline"}
                    size="sm"
                    className="font-mono"
                    onClick={() => load(t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
              <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                O array é sempre ordenado antes da busca. Tente um valor que não esteja presente para ver o
                caminho de não encontrado.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </section>
  )
}
