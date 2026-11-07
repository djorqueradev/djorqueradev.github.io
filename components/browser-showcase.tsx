"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Lock } from "lucide-react"
import DotGridShader from "@/components/DotGridShader"
import { cn } from "@/lib/utils"

interface Props {
  images: string[]
  url?: string
  from: string
  to: string
  /** Card mode leaves room for tags (top) and title (bottom) */
  inCard?: boolean
  className?: string
}

/** Screenshots presented inside a browser window, cross-fading every few seconds. */
export default function BrowserShowcase({ images, url, from, to, inCard = false, className }: Props) {
  const [i, setI] = useState(0)
  const host = url?.replace(/^https?:\/\//, "").replace(/\/$/, "")

  useEffect(() => {
    if (images.length < 2) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = setInterval(() => setI((n) => (n + 1) % images.length), 4200)
    return () => clearInterval(id)
  }, [images.length])

  return (
    <div
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={{ background: `radial-gradient(110% 80% at 80% 0%, ${to}66 0%, transparent 60%), linear-gradient(160deg, ${from} 20%, #050505 100%)` }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
        <DotGridShader />
      </div>

      <div
        className={cn(
          "absolute inset-x-0 flex items-center justify-center px-5 sm:px-10",
          inCard ? "top-24 bottom-44 sm:top-14 sm:bottom-24 lg:top-20 lg:bottom-32" : "inset-y-0 py-6 sm:py-10"
        )}
      >
        <div className="relative w-full max-w-[1100px] [perspective:1600px]">
          <div
            className="relative w-full overflow-hidden rounded-xl border border-white/15 bg-neutral-900 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] transition-transform duration-700 ease-out group-hover:[transform:rotateX(0deg)]"
            style={{ transform: inCard ? "rotateX(4deg)" : undefined, transformOrigin: "50% 100%" }}
          >
            {/* window chrome */}
            <div className="flex items-center gap-3 border-b border-white/10 bg-neutral-900/95 px-3 py-2">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              </div>
              {host && (
                <div className="mx-auto flex min-w-0 max-w-[60%] items-center gap-1.5 rounded-md bg-white/[0.06] px-3 py-0.5 font-mono text-[10px] text-white/50">
                  <Lock className="h-2.5 w-2.5 flex-none" />
                  <span className="truncate">{host}</span>
                </div>
              )}
              <div className="w-[42px]" />
            </div>

            {/* screenshots */}
            <div className="relative aspect-video w-full bg-black">
              {images.map((src, n) => (
                <Image
                  key={src}
                  src={src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 60vw, 90vw"
                  className={cn("object-cover object-top transition-opacity duration-1000", n === i ? "opacity-100" : "opacity-0")}
                  priority={n === 0 && !inCard}
                />
              ))}
            </div>
          </div>

          {images.length > 1 && (
            <div className={cn("mt-3 justify-center gap-1.5", inCard ? "hidden sm:flex" : "flex")}>
              {images.map((src, n) => (
                <button
                  key={src}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setI(n)
                  }}
                  aria-label={`Screenshot ${n + 1}`}
                  className={cn("h-1.5 rounded-full transition-all cursor-pointer", n === i ? "w-4 bg-white/80" : "w-1.5 bg-white/25")}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
