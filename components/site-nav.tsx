"use client"

import { useEffect, useState } from "react"
import { Binary } from "lucide-react"

const links = [
  { href: "#gcd", label: "MDC" },
  { href: "#merge-sort", label: "Merge Sort" },
  { href: "#binary-search", label: "Busca Binária" },
]

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors ${
        scrolled ? "border-border bg-background/80 backdrop-blur-md" : "border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a href="#" className="flex items-center gap-2 font-semibold tracking-tight">
          <Binary className="size-5 text-primary" />
          <span>Visualizador D&amp;C</span>
        </a>
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-1.5 font-mono text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  )
}
