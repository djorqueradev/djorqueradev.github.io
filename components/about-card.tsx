"use client"

import { ArrowUpRight, FileText } from "lucide-react"
import RevealOnView from "@/components/reveal-on-view"
import DotGridShader from "@/components/DotGridShader"
import { useLang } from "@/lib/i18n"
import { site } from "@/lib/site"
import { certifications, education, experience, skills, spokenLanguages } from "@/data/profile"

const H = ({ children }: { children: React.ReactNode }) => (
  <h3 className="mb-5 text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">{children}</h3>
)

/** Experience, education and skills — the CV, in the same visual language as the project cards. */
export default function AboutCard() {
  const { lang, t } = useLang()

  return (
    <article id="about" className="relative">
      <RevealOnView
        className="rounded-3xl border border-white/10 p-1 shadow-[0_10px_60px_-10px_rgba(0,0,0,0.6)]"
        style={{ backgroundImage: "linear-gradient(135deg, #1f2937, #525252)" }}
      >
        <div className="relative overflow-hidden rounded-[1.35rem] bg-neutral-950 p-6 sm:p-10">
          <div className="pointer-events-none absolute inset-0 opacity-[0.05]">
            <DotGridShader />
          </div>

          <div className="relative">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/30">CV</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{t.aboutTitle}</h2>
              </div>
              {site.cv && (
                <a
                  href={site.cv}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 self-start rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  {t.downloadCv}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
            </div>

            <div className="mt-10 grid grid-cols-1 gap-12 xl:grid-cols-[1.4fr_1fr]">
              {/* Experience timeline */}
              <section>
                <H>{t.experience}</H>
                <ol className="relative space-y-8 border-l border-white/10 pl-6">
                  {experience.map((e) => (
                    <li key={e.role.en + e.org} className="relative">
                      <span className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full border border-white/40 bg-neutral-950" />
                      <p className="font-mono text-[11px] uppercase tracking-widest text-white/35">{e.period[lang]}</p>
                      <p className="mt-1 text-base font-semibold text-white">{e.role[lang]}</p>
                      <p className="text-sm text-white/50">{e.org}</p>
                      <ul className="mt-3 space-y-1.5">
                        {e.points.map((p) => (
                          <li key={p.en} className="text-sm leading-relaxed text-white/55">
                            {p[lang]}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ol>
              </section>

              <div className="space-y-12">
                <section>
                  <H>{t.education}</H>
                  <ul className="space-y-4">
                    {education.map((ed) => (
                      <li key={ed.title.en}>
                        <p className="text-sm font-semibold text-white">{ed.title[lang]}</p>
                        <p className="text-sm text-white/50">
                          {ed.org}
                          {ed.period[lang] && <span className="font-mono text-xs text-white/30"> · {ed.period[lang]}</span>}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <H>{t.skills}</H>
                  <div className="space-y-4">
                    {skills.map((g) => (
                      <div key={g.group.en}>
                        <p className="mb-2 text-xs text-white/40">{g.group[lang]}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {g.items.map((s) => (
                            <span key={s} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-white/70">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-1">
                  <div>
                    <H>{t.languages}</H>
                    <ul className="space-y-1.5">
                      {spokenLanguages.map((l) => (
                        <li key={l.en} className="text-sm text-white/60">{l[lang]}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <H>{t.courses}</H>
                    <ul className="space-y-1.5">
                      {certifications.map((c) => (
                        <li key={c.en} className="text-sm text-white/60">{c[lang]}</li>
                      ))}
                    </ul>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </RevealOnView>
    </article>
  )
}
