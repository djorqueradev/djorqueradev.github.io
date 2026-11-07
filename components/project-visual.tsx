"use client"

import dynamic from "next/dynamic"
import Image from "next/image"
import ShowcaseCarousel from "@/components/showcase-carousel"
import ProjectCover from "@/components/project-cover"
import BrowserShowcase from "@/components/browser-showcase"
import type { LegendKey } from "@/components/enclosure-viewer"
import { Project } from "@/lib/data"
import { useLang } from "@/lib/i18n"

// Canvas visuals load only when needed
const EnclosureViewer = dynamic(() => import("@/components/enclosure-viewer"), { ssr: false })
const QuakeMap = dynamic(() => import("@/components/quake-map"), { ssr: false })

interface Props {
  project: Project
  inCard?: boolean
  // enclosure controls (case study)
  exploded?: boolean
  highlight?: LegendKey | null
}

/** Picks the right visual for a project: 3D model, animated map, browser mockup, carousel or generated cover. */
export default function ProjectVisual({ project, inCard = false, exploded, highlight }: Props) {
  const { t } = useLang()
  const { cover, images, imageSrc, title, caseStudy, gradientFrom, gradientTo, liveUrl } = project
  const shots = (images ?? []).filter((img) => img.src && !img.disabled).map((img) => img.src)
  const bg = { background: `radial-gradient(110% 80% at 80% 0%, ${gradientTo}40 0%, transparent 60%), linear-gradient(160deg, ${gradientFrom} 20%, #050505 100%)` }

  if (cover === "enclosure3d") {
    return (
      <div className="absolute inset-0" style={bg}>
        <EnclosureViewer
          autoplay={inCard}
          interactive={!inCard}
          exploded={exploded}
          highlight={highlight}
          className={inCard ? "top-20 bottom-40 sm:top-10 sm:bottom-20" : undefined}
        />
        <span className="pointer-events-none absolute bottom-4 right-5 font-mono text-[10px] uppercase tracking-widest text-white/30 max-sm:hidden">
          142 × 133 × 47 mm
        </span>
      </div>
    )
  }

  if (cover === "quakes") {
    return (
      <div className="absolute inset-0" style={bg}>
        <QuakeMap compact={inCard} labels={{ events: t.quakeEvents, source: t.quakeSource }} />
      </div>
    )
  }

  if (cover === "browser" && shots.length > 0) {
    return <BrowserShowcase images={shots} url={liveUrl} from={gradientFrom} to={gradientTo} inCard={inCard} />
  }

  if (shots.length > 0) return <ShowcaseCarousel images={images} />

  if (imageSrc) {
    return <Image src={imageSrc} alt={title} fill sizes="(min-width: 1024px) 66vw, 100vw" className="object-cover object-top" />
  }

  return <ProjectCover inCard={inCard} title={title} details={caseStudy.details} from={gradientFrom} to={gradientTo} />
}
