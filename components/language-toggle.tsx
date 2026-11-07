"use client"

import { cn } from "@/lib/utils"
import { useLang } from "@/lib/i18n"
import type { Lang } from "@/lib/data"

const options: { value: Lang; label: string; name: string }[] = [
  { value: "en", label: "EN", name: "English" },
  { value: "es", label: "ES", name: "Español" },
]

export default function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useLang()

  return (
    <div
      role="radiogroup"
      aria-label={t.langLabel}
      className={cn("inline-flex items-center rounded-full border border-white/10 bg-white/5 p-0.5", className)}
    >
      {options.map((o) => {
        const active = lang === o.value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={o.name}
            onClick={() => setLang(o.value)}
            className={cn(
              "rounded-full px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest transition-colors cursor-pointer",
              active ? "bg-white text-black" : "text-white/40 hover:text-white/80"
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
