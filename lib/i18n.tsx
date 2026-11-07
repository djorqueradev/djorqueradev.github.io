"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import type { Lang } from "@/lib/data"

const STORAGE_KEY = "portfolio-lang"

export const dictionary = {
  en: {
    available: "Open to work",
    headline: ["I build software", "end to end."],
    intro:
      "5th-year Computer Engineering student at Universidad Andrés Bello and co-founder of Novagy, a software house for CRM and business-management products. I build complete systems — IoT hardware and firmware, backends and data pipelines, iOS and web apps — and research deep learning applied to seismology.",
    contact: "Get in touch",
    projectsCount: (n: number) => `${n} projects`,
    selectedWork: "Selected work",
    stackTitle: "What I work with",
    caseStudy: "Case study",
    openCaseStudy: (title: string) => `Open case study: ${title}`,
    loadingCaseStudy: "Loading case study...",
    back: "Back",
    challenge: "The challenge",
    execution: "What I built",
    outcome: "Status & outcome",
    role: "My role",
    stack: "Stack & scope",
    visitSite: "Visit site",
    viewCode: "View code",
    ctaTitle: "Have a project or a role in mind? Let's talk.",
    ctaButton: "Contact me",
    noPreview: "Screenshots coming soon",
    langLabel: "Language",
    stats: [["3+", "apps in production"], ["Fondecyt", "research project"], ["Novagy", "co-founder"]],
    aboutTitle: "Experience & education",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    languages: "Languages",
    courses: "Certifications & courses",
    downloadCv: "Download CV",
    viewCv: "CV",
    architecture: "How it fits together",
    components: "Components",
    assembled: "Assembled",
    exploded: "Exploded",
    dragToRotate: "Drag to rotate",
    enclosureNote: "Interactive model built from the measured dimensions of the v8 enclosure.",
    quakeEvents: "earthquakes M5.5+",
    quakeSource: "USGS · M5.5+ · 1965–2016",
    quakeNote: "Real USGS catalog of significant earthquakes in Chile — the same kind of data the app ingests.",
  },
  es: {
    available: "Disponible",
    headline: ["Construyo software", "de punta a punta."],
    intro:
      "Estudiante de 5.º año de Ingeniería Civil en Informática en la Universidad Andrés Bello y cofundador de Novagy, software house de soluciones CRM y gestión empresarial. Construyo sistemas completos — hardware y firmware IoT, backends y pipelines de datos, apps iOS y web — e investigo deep learning aplicado a la sismología.",
    contact: "Contáctame",
    projectsCount: (n: number) => `${n} proyectos`,
    selectedWork: "Trabajo destacado",
    stackTitle: "Con qué trabajo",
    caseStudy: "Ver proyecto",
    openCaseStudy: (title: string) => `Abrir proyecto: ${title}`,
    loadingCaseStudy: "Cargando proyecto...",
    back: "Volver",
    challenge: "El desafío",
    execution: "Qué construí",
    outcome: "Estado y resultado",
    role: "Mi rol",
    stack: "Stack y alcance",
    visitSite: "Visitar sitio",
    viewCode: "Ver código",
    ctaTitle: "¿Tienes un proyecto o un puesto en mente? Conversemos.",
    ctaButton: "Escríbeme",
    noPreview: "Capturas próximamente",
    langLabel: "Idioma",
    stats: [["3+", "apps en producción"], ["Fondecyt", "proyecto de investigación"], ["Novagy", "cofundador"]],
    aboutTitle: "Experiencia y formación",
    experience: "Experiencia",
    education: "Formación",
    skills: "Habilidades",
    languages: "Idiomas",
    courses: "Certificaciones y cursos",
    downloadCv: "Descargar CV",
    viewCv: "CV",
    architecture: "Cómo se conecta",
    components: "Componentes",
    assembled: "Armado",
    exploded: "Explotado",
    dragToRotate: "Arrastra para rotar",
    enclosureNote: "Modelo interactivo construido con las medidas reales de la carcasa v8.",
    quakeEvents: "sismos M5.5+",
    quakeSource: "USGS · M5.5+ · 1965–2016",
    quakeNote: "Catálogo real del USGS de sismos significativos en Chile — el mismo tipo de datos que ingiere la app.",
  },
} as const

export type Dictionary = (typeof dictionary)[Lang]

type LangContextValue = { lang: Lang; setLang: (l: Lang) => void; t: Dictionary }

const LangContext = createContext<LangContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // English by default; a saved choice is restored after mount.
  const [lang, setLangState] = useState<Lang>("en")

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved === "en" || saved === "es") setLangState(saved)
    } catch {
      /* storage unavailable — keep default */
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      window.localStorage.setItem(STORAGE_KEY, l)
    } catch {
      /* ignore */
    }
  }, [])

  return <LangContext.Provider value={{ lang, setLang, t: dictionary[lang] }}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error("useLang must be used inside <LanguageProvider>")
  return ctx
}
