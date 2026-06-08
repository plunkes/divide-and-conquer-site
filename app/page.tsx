import { GcdVisualizer } from "@/components/gcd-visualizer"
import { MergeSortVisualizer } from "@/components/merge-sort-visualizer"
import { BinarySearchVisualizer } from "@/components/binary-search-visualizer"
import { SiteNav } from "@/components/site-nav"

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      <main className="mx-auto max-w-5xl px-6 pb-32">
        {/* Hero */}
        <section className="flex flex-col items-center gap-6 py-20 text-center md:py-28">
          <span className="rounded-full border border-border bg-secondary px-4 py-1.5 font-mono text-xs text-muted-foreground">
            divide &amp; conquer · interactive
          </span>
          <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight md:text-6xl">
            Break it down. <span className="text-primary">Conquer</span> it. Visualize it.
          </h1>
          <p className="max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Three classic divide-and-conquer algorithms, each with a step-by-step simulation you can
            play, pause, and scrub through — using your own values. Watch a hard problem split into
            smaller ones and solve itself.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {[
              { href: "#gcd", label: "Euclidean GCD" },
              { href: "#merge-sort", label: "Merge Sort" },
              { href: "#binary-search", label: "Binary Search" },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-md border border-border bg-card px-4 py-2 font-mono text-sm transition-colors hover:border-primary/50 hover:text-primary"
              >
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-28">
          <GcdVisualizer />
          <MergeSortVisualizer />
          <BinarySearchVisualizer />
        </div>

        <footer className="mt-32 border-t border-border pt-8 text-center font-mono text-xs text-muted-foreground">
          Built to teach the divide-and-conquer paradigm · split → solve → combine
        </footer>
      </main>
    </div>
  )
}
