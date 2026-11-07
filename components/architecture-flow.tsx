"use client"

import { Fragment } from "react"
import { ArrowDown, ArrowRight } from "lucide-react"

export interface ArchitectureNode {
  label: string
  detail?: string
}

/** Horizontal (desktop) / vertical (mobile) flow of the system's building blocks. */
export default function ArchitectureFlow({ nodes, accent }: { nodes: ArchitectureNode[]; accent: string }) {
  return (
    <div className="flex flex-col items-stretch gap-2 lg:flex-row lg:items-stretch">
      {nodes.map((n, i) => (
        <Fragment key={n.label}>
          <div className="relative flex-1 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
            <span className="font-mono text-[10px] tabular-nums text-white/25">{String(i + 1).padStart(2, "0")}</span>
            <p className="mt-2 text-sm font-semibold text-white">{n.label}</p>
            {n.detail && <p className="mt-1 text-xs leading-relaxed text-white/45">{n.detail}</p>}
          </div>
          {i < nodes.length - 1 && (
            <div className="flex items-center justify-center text-white/25" aria-hidden>
              <ArrowDown className="h-4 w-4 lg:hidden" />
              <ArrowRight className="hidden h-4 w-4 lg:block" />
            </div>
          )}
        </Fragment>
      ))}
    </div>
  )
}
