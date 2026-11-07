import projectsJson from "@/data/projects.json"

export type Lang = "en" | "es"

export interface ProjectImage {
  src: string
  from?: string
  to?: string
  caption?: string
  /** @deprecated Live iframes rendered blank on several sites. Use Project.liveUrl instead. */
  url?: string
  disabled?: boolean // Hidden from portfolio but preserved in data
}

export interface CaseStudy {
  description: string
  details: string[]
  execution?: string
  outcome?: string
  role?: string
  year?: string
}

/** Spanish overrides. Any field left empty falls back to the English one. */
export interface ArchitectureStep {
  label: string
  detail?: string
}

/** Visual used for the card and case-study hero */
export type ProjectCoverType = "enclosure3d" | "quakes" | "browser"

export interface ProjectTranslation {
  title?: string
  subtitle?: string
  tags?: string[]
  caseStudy?: Partial<Omit<CaseStudy, "year">>
  architecture?: ArchitectureStep[]
}

export interface Project {
  title: string
  subtitle: string
  imageSrc?: string
  images?: ProjectImage[]
  /** Public link to the live product, shown as a "Visit site" button */
  liveUrl?: string
  /** Source code link, shown as a "View code" button */
  repoUrl?: string
  caseStudy: CaseStudy
  /** Special visual; falls back to screenshots or a generated cover */
  cover?: ProjectCoverType
  /** "How it fits together" diagram in the case study */
  architecture?: ArchitectureStep[]
  tags: string[]
  href: string
  priority: boolean
  gradientFrom: string
  gradientTo: string
  es?: ProjectTranslation
}

/** Returns the project with its text in the requested language (English is the base). */
export function localizeProject(project: Project, lang: Lang): Project {
  if (lang === "en" || !project.es) return project
  const es = project.es
  const pick = (v: string | undefined, fallback: string | undefined) => (v && v.trim() ? v : fallback)
  return {
    ...project,
    title: pick(es.title, project.title)!,
    subtitle: pick(es.subtitle, project.subtitle)!,
    tags: es.tags && es.tags.length ? es.tags : project.tags,
    architecture: es.architecture && es.architecture.length ? es.architecture : project.architecture,
    caseStudy: {
      ...project.caseStudy,
      description: pick(es.caseStudy?.description, project.caseStudy.description)!,
      execution: pick(es.caseStudy?.execution, project.caseStudy.execution),
      outcome: pick(es.caseStudy?.outcome, project.caseStudy.outcome),
      role: pick(es.caseStudy?.role, project.caseStudy.role),
      details: es.caseStudy?.details && es.caseStudy.details.length ? es.caseStudy.details : project.caseStudy.details,
    },
  }
}

/** Fallback used when data/projects.json can't be read. */
export const projects: Project[] = projectsJson as Project[]
