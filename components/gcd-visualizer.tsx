"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Panel, SectionHeader, StepNote } from "@/components/algorithm-shell"
import { PlaybackControls, useAutoPlay } from "@/components/playback-controls"

type GcdStep = {
  a: number
  b: number
  q: number
  r: number
  done: boolean
}

function buildSteps(a: number, b: number): GcdStep[] {
  const steps: GcdStep[] = []
  let x = Math.max(a, b)
  let y = Math.min(a, b)
  let guard = 0
  while (y !== 0 && guard < 100) {
    const q = Math.floor(x / y)
    const r = x % y
    steps.push({ a: x, b: y, q, r, done: r === 0 })
    x = y
    y = r
    guard++
  }
  if (steps.length === 0) steps.push({ a, b, q: 0, r: 0, done: true })
  return steps
}

const presets = [
  [48, 36],
  [1071, 462],
  [252, 105],
  [120, 23],
]

export function GcdVisualizer() {
  const [a, setA] = useState(48)
  const [b, setB] = useState(36)
  const [inputA, setInputA] = useState("48")
  const [inputB, setInputB] = useState("36")
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)

  const steps = useMemo(() => buildSteps(a, b), [a, b])
  const total = steps.length
  const atEnd = step >= total - 1
  const current = steps[step]
  const result = steps[total - 1]?.b === 0 ? steps[total - 1].a : steps[total - 1]?.b || a

  useAutoPlay(playing, atEnd, speed, () => setStep((s) => Math.min(s + 1, total - 1)))

  function reset(na = a, nb = b) {
    setA(na)
    setB(nb)
    setInputA(String(na))
    setInputB(String(nb))
    setStep(0)
    setPlaying(false)
  }

  function applyCustom() {
    const na = Math.max(1, Math.floor(Math.abs(Number(inputA))) || 0)
    const nb = Math.max(1, Math.floor(Math.abs(Number(inputB))) || 0)
    reset(na, nb)
  }

  const gcdResult = steps.reduce((acc, s) => (s.r === 0 ? s.b : acc), Math.min(a, b))

  return (
    <section className="flex flex-col gap-8 scroll-mt-24" id="gcd">
      <SectionHeader index="01" title="MDC Euclidiano" complexity="O(log min(a, b))">
        O algoritmo de Euclides encontra o máximo divisor comum substituindo repetidamente o maior
        número pelo resto da divisão pelo menor. O problema diminui rapidamente até que o resto
        chegue a zero — o último divisor não nulo é a resposta.
      </SectionHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Panel>
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "a", value: current?.a ?? a },
                { label: "b", value: current?.b ?? b },
              ].map((box) => (
                <div key={box.label} className="rounded-lg border border-border bg-secondary p-4 text-center">
                  <div className="font-mono text-xs text-muted-foreground">{box.label}</div>
                  <div className="font-mono text-3xl font-semibold tabular-nums md:text-4xl">{box.value}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              {steps.map((s, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded-md border px-4 py-2 font-mono text-sm transition-colors ${
                    i === step
                      ? "border-primary/50 bg-primary/10"
                      : i < step
                        ? "border-border bg-secondary/40 text-muted-foreground"
                        : "border-border bg-transparent text-muted-foreground/50"
                  }`}
                >
                  <span>
                    {s.a} = {s.q} &times; {s.b} + <span className={s.r === 0 ? "text-primary" : "text-foreground"}>{s.r}</span>
                  </span>
                  {s.r === 0 && <span className="text-primary">mdc encontrado</span>}
                </div>
              ))}
            </div>

            <StepNote tone={atEnd ? "done" : "active"}>
              {current?.r === 0
                ? `Resto é 0 → mdc(${a}, ${b}) = ${gcdResult}`
                : `${current?.a} mod ${current?.b} = ${current?.r}. Substitua (a, b) por (${current?.b}, ${current?.r}).`}
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
              onReset={() => reset()}
              onScrub={(v) => {
                setPlaying(false)
                setStep(v)
              }}
            />
          </Panel>

          <Panel>
            <div className="flex flex-col gap-3">
              <span className="font-mono text-xs text-muted-foreground">seus próprios valores</span>
              <form
                className="flex items-end gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  applyCustom()
                }}
              >
                <label className="flex flex-1 flex-col gap-1">
                  <span className="font-mono text-[10px] text-muted-foreground">a</span>
                  <Input
                    inputMode="numeric"
                    value={inputA}
                    onChange={(e) => setInputA(e.target.value.replace(/[^0-9]/g, ""))}
                    className="font-mono"
                    aria-label="valor a"
                  />
                </label>
                <label className="flex flex-1 flex-col gap-1">
                  <span className="font-mono text-[10px] text-muted-foreground">b</span>
                  <Input
                    inputMode="numeric"
                    value={inputB}
                    onChange={(e) => setInputB(e.target.value.replace(/[^0-9]/g, ""))}
                    className="font-mono"
                    aria-label="valor b"
                  />
                </label>
                <Button type="submit" className="font-mono">
                  executar
                </Button>
              </form>

              <span className="mt-1 font-mono text-xs text-muted-foreground">ou tente um preset</span>
              <div className="grid grid-cols-2 gap-2">
                {presets.map(([pa, pb]) => (
                  <Button
                    key={`${pa}-${pb}`}
                    variant="outline"
                    size="sm"
                    className="font-mono"
                    onClick={() => reset(pa, pb)}
                  >
                    {pa}, {pb}
                  </Button>
                ))}
              </div>
              <div className="mt-2 rounded-lg border border-primary/30 bg-primary/5 p-4 text-center">
                <div className="font-mono text-xs text-muted-foreground">resultado</div>
                <div className="font-mono text-2xl font-semibold text-primary">mdc = {gcdResult}</div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </section>
  )
}
