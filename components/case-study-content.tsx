"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight, ArrowUpRight, Github, Move3d } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DialogClose } from "@/components/ui/dialog"
import ProjectVisual from "@/components/project-visual"
import ArchitectureFlow from "@/components/architecture-flow"
import { ENCLOSURE_LEGEND, type LegendKey } from "@/components/enclosure-viewer"
import { cn } from "@/lib/utils"
import LanguageToggle from "@/components/language-toggle"
import { Project } from "@/lib/data"
import { useLang } from "@/lib/i18n"
import { site } from "@/lib/site"

interface CaseStudyContentProps {
  project: Project
  index?: number
  total?: number
}

export default function CaseStudyContent({ project, index = 0, total = 0 }: CaseStudyContentProps) {
  const { t, lang } = useLang()
  const { title, subtitle, tags, caseStudy, liveUrl, repoUrl, gradientTo, cover, architecture } = project
  const [exploded, setExploded] = useState(true)
  const [highlight, setHighlight] = useState<LegendKey | null>(null)
  const num = String(index + 1).padStart(2, "0")
  const totalStr = String(total).padStart(2, "0")

  // Reading progress bar
  const bodyRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    // The scrollable ancestor is the DialogContent div
    const scrollEl = el.closest(".overflow-y-auto") as HTMLElement | null
    if (!scrollEl) return

    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollEl
      const pct = scrollHeight <= clientHeight ? 100 : (scrollTop / (scrollHeight - clientHeight)) * 100
      setProgress(Math.min(100, pct))
    }

    scrollEl.addEventListener("scroll", onScroll, { passive: true })
    return () => scrollEl.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="relative min-h-screen flex flex-col" ref={bodyRef}>
      {/* Header: Sticky UI */}
      <header className="sticky top-0 z-[60] flex items-center justify-between px-6 py-4 bg-neutral-950/80 backdrop-blur-xl border-b border-white/5">
        <DialogClose asChild>
          <button className="flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors cursor-pointer group">
            <div className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/20 group-hover:bg-white/5">
              <ArrowRight className="h-4 w-4 rotate-180" />
            </div>
            {t.back}
          </button>
        </DialogClose>

        {total > 0 && (
          <span className="font-mono text-[11px] text-white/30 tabular-nums hidden sm:block">
            {num} / {totalStr}
          </span>
        )}

        <LanguageToggle />
      </header>

      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 z-[70] h-[2px] bg-white/10 w-full pointer-events-none">
        <div className="h-full bg-white/60 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
      </div>

      {/* Content Body */}
      <div className="flex-1 w-full max-w-7xl mx-auto overflow-x-hidden">
        {/* Hero Section */}
        <section className="px-6 py-8 sm:py-16">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-6 sm:space-y-8 order-2 xl:order-1">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-white/5 text-white/50 border-white/10 uppercase tracking-widest text-[10px]">
                    {tag}
                  </Badge>
                ))}
                {caseStudy?.year && (
                  <Badge variant="secondary" className="bg-white/5 text-white/30 border-white/10 font-mono text-[10px]">
                    {caseStudy.year}
                  </Badge>
                )}
              </div>
              <h2 className="text-4xl sm:text-6xl xl:text-7xl font-black leading-[0.9] tracking-tighter">{title}</h2>
              <p className="text-lg sm:text-xl xl:text-2xl text-white/40 font-medium leading-tight max-w-[34ch]">{subtitle}</p>

              {(liveUrl || repoUrl) && (
                <div className="flex flex-wrap gap-3">
                  {liveUrl && (
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-white/90 transition-colors"
                    >
                      {t.visitSite}
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  )}
                  {repoUrl && (
                    <a
                      href={repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      {t.viewCode}
                    </a>
                  )}
                </div>
              )}
            </div>
            <div className="order-1 xl:order-2 space-y-3">
              <div className="relative aspect-[4/3] sm:aspect-video xl:aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 bg-black">
                <ProjectVisual project={project} exploded={exploded} highlight={highlight} />
                {cover === "enclosure3d" && (
                  <div className="absolute left-4 top-4 z-10 flex items-center gap-3">
                    <div className="inline-flex rounded-full border border-white/10 bg-black/60 p-0.5 backdrop-blur">
                      {([false, true] as const).map((v) => (
                        <button
                          key={String(v)}
                          type="button"
                          onClick={() => setExploded(v)}
                          className={cn(
                            "rounded-full px-3 py-1 text-[11px] font-semibold transition-colors cursor-pointer",
                            exploded === v ? "bg-white text-black" : "text-white/50 hover:text-white"
                          )}
                        >
                          {v ? t.exploded : t.assembled}
                        </button>
                      ))}
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-white/35">
                      <Move3d className="h-3.5 w-3.5" /> {t.dragToRotate}
                    </span>
                  </div>
                )}
              </div>
              {cover === "enclosure3d" && <p className="px-1 text-xs text-white/35">{t.enclosureNote}</p>}
              {cover === "quakes" && <p className="px-1 text-xs text-white/35">{t.quakeNote}</p>}
            </div>
          </div>
        </section>

        {/* Detail Grid */}
        <section className="px-6 py-16 border-t border-white/5">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-16 xl:gap-24">
            <div className="space-y-16">
              <div className="space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">{t.challenge}</h3>
                <p className="text-2xl sm:text-3xl xl:text-4xl font-medium leading-[1.2] tracking-tight text-white">
                  {caseStudy?.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                {caseStudy?.execution && (
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">{t.execution}</h3>
                    <p className="text-base sm:text-lg text-white/60 leading-relaxed">{caseStudy.execution}</p>
                  </div>
                )}
                {caseStudy?.outcome && (
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">{t.outcome}</h3>
                    <p className="text-base sm:text-lg text-white/60 leading-relaxed">{caseStudy.outcome}</p>
                  </div>
                )}
              </div>

              {architecture && architecture.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">{t.architecture}</h3>
                  <ArchitectureFlow nodes={architecture} accent={gradientTo} />
                </div>
              )}
            </div>

            <aside className="space-y-12">
              {caseStudy?.role && (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">{t.role}</h3>
                  <p className="text-base text-white/80 leading-relaxed">{caseStudy.role}</p>
                </div>
              )}

              {caseStudy?.details?.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">{t.stack}</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {caseStudy.details.map((detail) => (
                      <div key={detail} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-colors">
                        <span className="text-xs font-bold uppercase tracking-wider text-white/60">{detail}</span>
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cover === "enclosure3d" && (
                <div className="space-y-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">{t.components}</h3>
                  <ul className="space-y-1" onMouseLeave={() => setHighlight(null)}>
                    {ENCLOSURE_LEGEND.map((l) => (
                      <li key={l.key}>
                        <button
                          type="button"
                          onMouseEnter={() => setHighlight(l.key)}
                          onFocus={() => setHighlight(l.key)}
                          onBlur={() => setHighlight(null)}
                          onClick={() => setHighlight((h) => (h === l.key ? null : l.key))}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors cursor-pointer",
                            highlight === l.key ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/5"
                          )}
                        >
                          <span className="h-2.5 w-2.5 flex-none rounded-sm" style={{ background: l.color }} />
                          {lang === "es" ? l.es : l.en}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA card */}
              <a href={`mailto:${site.email}`} className="relative block p-8 rounded-[2rem] bg-white overflow-hidden group">
                <div className="relative z-10 flex flex-col gap-4">
                  <p className="text-lg font-bold text-black leading-tight">{t.ctaTitle}</p>
                  <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-black/50 group-hover:text-black transition-colors">
                    {t.ctaButton} <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
                <div className="absolute -right-8 -bottom-8 h-32 w-32 bg-black/8 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
              </a>
            </aside>
          </div>
        </section>
      </div>
    </div>
  )
}
