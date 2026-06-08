"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function SectionHeader({
  index,
  title,
  complexity,
  children,
}: {
  index: string
  title: string
  complexity: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-xs text-primary">{index}</span>
        <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
        <span className="rounded-full border border-border bg-secondary px-3 py-1 font-mono text-xs text-muted-foreground">
          {complexity}
        </span>
      </div>
      <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">{children}</p>
    </div>
  )
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5 md:p-6", className)}>{children}</div>
  )
}

export function StepNote({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "active" | "done" }) {
  return (
    <p
      className={cn(
        "rounded-lg border px-4 py-3 font-mono text-sm leading-relaxed",
        tone === "default" && "border-border bg-secondary text-foreground",
        tone === "active" && "border-primary/40 bg-primary/10 text-foreground",
        tone === "done" && "border-primary/30 bg-primary/5 text-muted-foreground",
      )}
    >
      {children}
    </p>
  )
}
