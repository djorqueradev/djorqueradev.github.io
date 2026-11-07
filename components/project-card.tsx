"use client"

import { ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import ProjectVisual from "@/components/project-visual"
import RevealOnView from "@/components/reveal-on-view"
import { Project } from "@/lib/data"
import { useLang } from "@/lib/i18n"

interface ProjectCardProps {
  project: Project
  index?: number
  total?: number
  revealDelay?: number
  imageContainerClassName?: string
  containerClassName?: string
  onOpen: (index: number) => void
}

export function hasScreenshots(project: Project) {
  return !!project.imageSrc || !!project.images?.some((img) => img.src && !img.disabled)
}

export default function ProjectCard({
  project,
  index = 0,
  total = 0,
  revealDelay = 0,
  imageContainerClassName,
  containerClassName,
  onOpen,
}: ProjectCardProps) {
  const { t } = useLang()
  const { title, subtitle, tags, gradientFrom, gradientTo, caseStudy } = project
  const num = String(index + 1).padStart(2, "0")

  return (
    <article id={project.href.replace("#", "")} className={cn("group relative", containerClassName)}>
      <RevealOnView
        delay={revealDelay}
        className="rounded-3xl border border-white/10 p-1 shadow-[0_10px_60px_-10px_rgba(0,0,0,0.6)] lg:h-full transition-transform duration-500 ease-out group-hover:scale-[1.008]"
        style={{
          backgroundImage: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
        }}
      >
        <div className="relative overflow-hidden rounded-[1.35rem] bg-black lg:h-full">
          {/* Image content */}
          <div
            className={cn(
              "relative z-0 w-full aspect-[4/5] sm:aspect-[16/10] lg:aspect-auto lg:h-full",
              imageContainerClassName
            )}
          >
            <ProjectVisual project={project} inCard />
          </div>

          {/* Top row: tags left, number + year right */}
          <div className="pointer-events-none absolute inset-x-4 top-4 z-10 flex items-start justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="pointer-events-auto bg-black/50 text-white border-white/20 backdrop-blur-sm"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            {total > 0 && (
              <div className="flex-none rounded-full bg-black/40 px-2.5 py-1 font-mono text-[10px] text-white/50 tabular-nums backdrop-blur-sm">
                {num} / {String(total).padStart(2, "0")}
                {caseStudy?.year && <span className="ml-2 text-white/30">· {caseStudy.year}</span>}
              </div>
            )}
          </div>

          {/* Bottom content */}
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-30 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold sm:text-xl text-white">{title}</h3>
                <p className="text-sm text-white/60">{subtitle}</p>
              </div>
              <button
                onClick={() => onOpen(index)}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg transition-all duration-200 hover:bg-white/90 hover:gap-3 self-start sm:self-auto cursor-pointer"
                aria-label={t.openCaseStudy(title)}
              >
                {t.caseStudy}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </RevealOnView>
    </article>
  )
}
