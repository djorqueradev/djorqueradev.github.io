"use client"

import Image from "next/image"
import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

type Slide = {
  src: string
  caption?: string
  from?: string
  to?: string
  url?: string  // legacy: live-site slides are no longer rendered as iframes
  disabled?: boolean
}

type Props = {
  images?: Slide[]
  className?: string
}

export default function ShowcaseCarousel({
  images = [],
  className,
}: Props) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const [activeIndex, setActiveIndex] = React.useState(0)

  // Only render slides that have an image and aren't disabled
  const activeImages = images.filter((img) => !img.disabled && img.src)

  // Track which slide is active using IntersectionObserver
  React.useEffect(() => {
    const container = containerRef.current
    if (!container || activeImages.length <= 1) return

    const slides = Array.from(container.querySelectorAll<HTMLElement>("[data-slide]"))

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = slides.indexOf(entry.target as HTMLElement)
            if (idx !== -1) setActiveIndex(idx)
          }
        })
      },
      { root: container, threshold: 0.6 }
    )

    slides.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [activeImages.length])

  const goTo = (idx: number) => {
    const container = containerRef.current
    if (!container) return
    const slides = container.querySelectorAll<HTMLElement>("[data-slide]")
    slides[idx]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
  }

  const prev = () => goTo(Math.max(0, activeIndex - 1))
  const next = () => goTo(Math.min(activeImages.length - 1, activeIndex + 1))

  if (activeImages.length === 0) return null

  return (
    <div className={cn("group/carousel absolute inset-0 w-full h-full", className)}>
      {/* Scroll container */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full overflow-x-auto overflow-y-hidden rounded-[1.35rem] bg-black/40 scroll-smooth snap-x snap-mandatory"
        aria-label="Project showcase"
      >
        <div className="flex h-full w-max min-w-full">
          {activeImages.map((img, i) => (
            <div
              key={i}
              data-slide
              className="relative h-full w-full snap-center flex-shrink-0"
              style={{
                backgroundImage: `linear-gradient(135deg, ${img.from ?? "#0f172a"}, ${img.to ?? "#6d28d9"})`,
              }}
            >
              {/* Media */}
              <div className="relative h-full w-full overflow-hidden">
                {(
                  /* ── Static image ── */
                  <>
                    {img.src && (
                      <Image
                        src={img.src}
                        alt={img.caption || `View ${i + 1}`}
                        fill
                        className="object-cover object-top"
                        sizes="(min-width: 1024px) 66vw, 100vw"
                        priority={i === 0}
                      />
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20" />
                  </>
                )}
              </div>

              {/* Caption */}
              {img.caption ? (
                <div className="pointer-events-none absolute bottom-16 left-5 rounded-full bg-black/40 px-3 py-1 text-xs text-white backdrop-blur z-20">
                  {img.caption}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Controls — only show when more than 1 image */}
      {activeImages.length > 1 && (
        <>
          {/* ← Prev button */}
          <button
            onClick={prev}
            disabled={activeIndex === 0}
            aria-label="Previous slide"
            className={cn(
              "absolute left-3 top-1/2 z-20 -translate-y-1/2",
              "flex h-8 w-8 items-center justify-center rounded-full",
              "bg-black/50 backdrop-blur-sm border border-white/10 text-white",
              "transition-all duration-200 cursor-pointer",
              "opacity-0 group-hover/carousel:opacity-100",
              "hover:bg-black/70 hover:border-white/20 hover:scale-110",
              activeIndex === 0 && "!opacity-0 pointer-events-none"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* → Next button */}
          <button
            onClick={next}
            disabled={activeIndex === activeImages.length - 1}
            aria-label="Next slide"
            className={cn(
              "absolute right-3 top-1/2 z-20 -translate-y-1/2",
              "flex h-8 w-8 items-center justify-center rounded-full",
              "bg-black/50 backdrop-blur-sm border border-white/10 text-white",
              "transition-all duration-200 cursor-pointer",
              "opacity-0 group-hover/carousel:opacity-100",
              "hover:bg-black/70 hover:border-white/20 hover:scale-110",
              activeIndex === activeImages.length - 1 && "!opacity-0 pointer-events-none"
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5">
            {activeImages.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  "rounded-full transition-all duration-300 cursor-pointer",
                  i === activeIndex
                    ? "w-4 h-1.5 bg-white shadow-[0_0_6px_rgba(255,255,255,0.6)]"
                    : "w-1.5 h-1.5 bg-white/30 hover:bg-white/50"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
