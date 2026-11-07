"use client"

import { useState, useRef, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"
import { ArrowRight, FileText, Github, Linkedin, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import DotGridShader from "@/components/DotGridShader"
import ProjectCard from "@/components/project-card"
import AnimatedHeading from "@/components/animated-heading"
import RevealOnView from "@/components/reveal-on-view"
import LiveClock from "@/components/live-clock"
import LanguageToggle from "@/components/language-toggle"
import AboutCard from "@/components/about-card"
import { Project, localizeProject } from "@/lib/data"
import { LanguageProvider, useLang } from "@/lib/i18n"
import { site } from "@/lib/site"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"

function CaseStudyLoading() {
  const { t } = useLang()
  return (
    <div className="h-screen w-screen bg-neutral-950 flex items-center justify-center text-white/20 font-mono text-xs uppercase tracking-widest">
      {t.loadingCaseStudy}
    </div>
  )
}

// Dynamically import CaseStudyContent for performance (only loads when opening a dialog)
const CaseStudyContent = dynamic(() => import("@/components/case-study-content"), {
  loading: () => <CaseStudyLoading />,
})

const STACK = ["Python", "React", "Next.js", "TypeScript", "Supabase", "FastAPI", "SwiftUI", "PostGIS", "Deep Learning", "ESP32"]

interface PageClientProps {
  projects: Project[]
}

export default function PageClient(props: PageClientProps) {
  return (
    <LanguageProvider>
      <Portfolio {...props} />
    </LanguageProvider>
  )
}

function Portfolio({ projects: rawProjects }: PageClientProps) {
  const { lang, t } = useLang()
  const projects = useMemo(() => rawProjects.map((p) => localizeProject(p, lang)), [rawProjects, lang])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const selectedProject = selectedIndex !== null ? projects[selectedIndex] : null

  // Spotlight effect — use ref to avoid re-renders on every mouse move
  const spotlightRef = useRef<HTMLDivElement>(null)
  const asideRef = useRef<HTMLElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = asideRef.current
    const spotlight = spotlightRef.current
    if (!el || !spotlight) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    spotlight.style.background = `radial-gradient(180px circle at ${x}px ${y}px, rgba(255,255,255,0.12) 0%, transparent 70%)`
    spotlight.style.opacity = "1"
  }, [])

  const handleMouseLeave = useCallback(() => {
    const spotlight = spotlightRef.current
    if (spotlight) spotlight.style.opacity = "0"
  }, [])

  const links = [
    site.email && { href: `mailto:${site.email}`, label: "Email", icon: Mail },
    site.github && { href: site.github, label: "GitHub", icon: Github },
    site.linkedin && { href: site.linkedin, label: "LinkedIn", icon: Linkedin },
    site.cv && { href: site.cv, label: "CV", icon: FileText },
  ].filter(Boolean) as { href: string; label: string; icon: typeof Mail }[]

  return (
    <main className="bg-neutral-950 text-white min-h-screen">
      <section className="px-4 pt-4 pb-16 lg:pb-4">
        <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[440px_1fr]">
          {/* LEFT: sticky intro panel */}
          <aside
            ref={asideRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="lg:sticky lg:top-4 lg:h-[calc(100svh-2rem)]"
          >
            <RevealOnView
              as="div"
              intensity="hero"
              className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/60 p-6 sm:p-8 lg:overflow-y-auto"
              staggerChildren
            >
              {/* Spotlight overlay */}
              <div
                ref={spotlightRef}
                className="pointer-events-none absolute inset-0 z-10 rounded-3xl transition-opacity duration-300"
                style={{ opacity: 0 }}
              />

              {/* Texture background */}
              <div className="pointer-events-none absolute inset-0 opacity-5 mix-blend-soft-light">
                <DotGridShader />
              </div>

              <div>
                {/* Wordmark, clock, availability and language */}
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-extrabold tracking-tight">{site.shortName}</div>
                      <div className="h-2 w-2 rounded-full bg-white/60" aria-hidden="true" />
                    </div>
                    <LiveClock
                      timeZone={site.timeZone}
                      locale={lang === "es" ? "es-CL" : "en-US"}
                      className="text-[10px] uppercase tracking-widest text-white/40 font-mono"
                    />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <LanguageToggle />
                    {site.available && (
                      <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 whitespace-nowrap">
                          {t.available}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Headline (re-animates when the language changes) */}
                <AnimatedHeading
                  key={lang}
                  className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-[2.5rem]"
                  lines={[...t.headline]}
                />

                <p className="mt-4 max-w-[44ch] text-base text-white/60 leading-relaxed">{t.intro}</p>

                {/* CTAs */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button asChild size="lg" className="rounded-full bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.08)]">
                    <a href={`mailto:${site.email}`}>
                      {t.contact}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  <span className="text-xs text-white/30 font-mono">→ {t.projectsCount(projects.length)}</span>
                </div>

                {/* Links */}
                {links.length > 0 && (
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {links.map(({ href, label, icon: Icon }) => (
                      <li key={label}>
                        <a
                          href={href}
                          target={href.startsWith("mailto:") ? undefined : "_blank"}
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:border-white/25 hover:text-white transition-colors"
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Highlights */}
                <dl className="mt-8 grid grid-cols-3 gap-3 border-t border-white/5 pt-6">
                  {t.stats.map(([value, label]) => (
                    <div key={label}>
                      <dt className="text-lg font-black tracking-tight text-white">{value}</dt>
                      <dd className="mt-0.5 text-[11px] leading-snug text-white/40">{label}</dd>
                    </div>
                  ))}
                </dl>

                {/* Stack */}
                <div className="mt-8">
                  <p className="mb-3 text-[10px] font-bold tracking-[0.25em] text-white/30 uppercase">{t.stackTitle}</p>
                  <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {STACK.map((s) => (
                      <li key={s} className="text-sm font-semibold text-white/35">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer row */}
              <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">{site.location}</span>
                <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
                  © {new Date().getFullYear()} {site.name}
                </span>
              </div>
            </RevealOnView>
          </aside>

          {/* RIGHT: scrollable projects list */}
          <div className="space-y-4">
            {projects.map((p, idx) => (
              <ProjectCard
                key={p.href}
                project={p}
                index={idx}
                total={projects.length}
                imageContainerClassName="lg:h-full"
                containerClassName="lg:h-[calc(100svh-2rem)]"
                revealDelay={idx * 0.06}
                onOpen={setSelectedIndex}
              />
            ))}
            <AboutCard />
          </div>
        </div>
      </section>

      {/* Global Dialog for Case Studies */}
      <Dialog open={selectedProject !== null} onOpenChange={(open) => !open && setSelectedIndex(null)}>
        <DialogContent
          className="fixed !inset-0 !m-0 !p-0 !w-screen !h-screen !max-w-none !max-h-none !border-none !rounded-none bg-neutral-950 text-white z-50 overflow-y-auto outline-none transition-none !translate-x-0 !translate-y-0 !top-0 !left-0 !flex !flex-col shadow-none"
          showCloseButton={false}
        >
          <div className="sr-only">
            <DialogTitle>{selectedProject?.title || t.caseStudy}</DialogTitle>
            <DialogDescription>{selectedProject?.subtitle || ""}</DialogDescription>
          </div>
          {selectedProject && selectedIndex !== null && (
            <CaseStudyContent project={selectedProject} index={selectedIndex} total={projects.length} />
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
