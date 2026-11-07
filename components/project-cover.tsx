"use client"

import DotGridShader from "@/components/DotGridShader"

interface ProjectCoverProps {
  title: string
  details: string[]
  from: string
  to: string
  note?: string
  /** In cards the title overlays the bottom, so the stack list is hidden on phones */
  inCard?: boolean
}

/** Designed cover for projects that don't have screenshots yet. */
export default function ProjectCover({ title, details, from, to, note, inCard = false }: ProjectCoverProps) {
  const name = title.split("—")[0].trim()

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: `radial-gradient(120% 90% at 85% 10%, ${to}55 0%, transparent 55%), linear-gradient(160deg, ${from} 30%, #050505 100%)` }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
        <DotGridShader />
      </div>

      {/* Big faint name */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[18vw] font-black leading-none tracking-tighter text-white/[0.04] lg:text-[11vw]"
      >
        {name}
      </div>

      {/* Stack list */}
      <div className={`absolute left-5 top-16 right-5 flex-col gap-2 sm:left-8 sm:top-20 ${inCard ? "hidden sm:flex" : "flex"}`}>
        {details.slice(0, 6).map((d, i) => (
          <div key={d} className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-white/50 sm:text-xs">
            <span className="tabular-nums text-white/20">{String(i + 1).padStart(2, "0")}</span>
            <span className="h-px w-6" style={{ background: to }} />
            <span>{d}</span>
          </div>
        ))}
        {note && <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-white/20">{note}</p>}
      </div>
    </div>
  )
}
