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
            dividir &amp; conquistar · interativo
          </span>
          <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight md:text-6xl">
            <span className="text-primary">Divida</span>. Conquiste. Visualize.
          </h1>
          <p className="max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Três algoritmos clássicos de dividir e conquistar, cada um com uma simulação passo a passo que você pode
            reproduzir, pausar e percorrer — usando seus próprios valores. Veja um problema difícil se dividir em
            partes menores e se resolver sozinho.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {[
              { href: "#gcd", label: "MDC Euclidiano" },
              { href: "#merge-sort", label: "Merge Sort" },
              { href: "#binary-search", label: "Busca Binária" },
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
          Feito para ensinar o paradigma de dividir e conquistar · dividir → resolver → combinar
        </footer>
      </main>
    </div>
  )
}
