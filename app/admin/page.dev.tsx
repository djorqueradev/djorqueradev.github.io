"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  ChevronUp, ChevronDown, Plus, Trash2, Save,
  LogOut, ExternalLink, Upload, X, CheckCircle,
  AlertCircle, Loader2, ImageIcon, Globe, Eye, EyeOff,
} from "lucide-react"
import type { Project, ProjectImage } from "@/lib/data"

// ─── Helpers ───────────────────────────────────────────────────────────────

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

const EMPTY_PROJECT: Project = {
  title: "New Project",
  subtitle: "Project subtitle",
  caseStudy: {
    description: "",
    details: [],
    execution: "",
    outcome: "",
    year: new Date().getFullYear().toString(),
  },
  tags: [],
  href: "#new-project",
  priority: false,
  gradientFrom: "#0f172a",
  gradientTo: "#6d28d9",
}

// ─── Chip component ─────────────────────────────────────────────────────────

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="text-white/30 hover:text-white transition-colors"
        aria-label={`Remove ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}

// ─── Section heading ─────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 pb-2 mb-4 border-b border-white/5">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">{children}</h3>
    </div>
  )
}

// ─── Field component ─────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/30">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-white/25 focus:outline-none transition-colors"

const textareaCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-white/25 focus:outline-none transition-colors resize-none leading-relaxed"

// ─── Toast ───────────────────────────────────────────────────────────────────

type ToastType = { message: string; kind: "success" | "error" } | null

// ─── Main component ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedIdx, setSelectedIdx] = useState<number>(0)
  const [draft, setDraft] = useState<Project | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [toast, setToast] = useState<ToastType>(null)
  const [newTag, setNewTag] = useState("")
  const [newDetail, setNewDetail] = useState("")
  const [newImgUrl, setNewImgUrl] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const heroFileInputRef = useRef<HTMLInputElement>(null)

  // Load projects on mount
  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data: Project[]) => {
        setProjects(data)
        setDraft(deepClone(data[0] ?? null))
        setSelectedIdx(0)
      })
  }, [])

  const showToast = (message: string, kind: "success" | "error") => {
    setToast({ message, kind })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Select project ──────────────────────────────────────────────────────

  const selectProject = (idx: number) => {
    setSelectedIdx(idx)
    setDraft(deepClone(projects[idx]))
    setNewTag("")
    setNewDetail("")
    setNewImgUrl("")
  }

  // ── Reorder ─────────────────────────────────────────────────────────────

  const moveProject = (idx: number, dir: -1 | 1) => {
    const next = [...projects]
    const target = idx + dir
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]]
    setProjects(next)
    setSelectedIdx(target)
    setDraft(deepClone(next[target]))
  }

  // ── Add / delete project ─────────────────────────────────────────────────

  const addProject = () => {
    const newP = deepClone(EMPTY_PROJECT)
    const next = [...projects, newP]
    setProjects(next)
    setSelectedIdx(next.length - 1)
    setDraft(deepClone(newP))
  }

  const deleteProject = (idx: number) => {
    if (!confirm("¿Eliminar este proyecto? Esta acción no se puede deshacer.")) return
    const next = projects.filter((_, i) => i !== idx)
    setProjects(next)
    const newIdx = Math.min(idx, next.length - 1)
    setSelectedIdx(newIdx)
    setDraft(next.length > 0 ? deepClone(next[newIdx]) : null)
  }

  // ── Draft helpers ────────────────────────────────────────────────────────

  const setField = (field: keyof Project, value: any) => {
    setDraft((d) => d ? { ...d, [field]: value } : d)
  }

  const setCaseStudyField = (field: string, value: any) => {
    setDraft((d) => d ? { ...d, caseStudy: { ...d.caseStudy, [field]: value } } : d)
  }

  const setEsField = (field: "title" | "subtitle" | "tags", value: any) => {
    setDraft((d) => d ? { ...d, es: { ...(d.es ?? {}), [field]: value } } : d)
  }

  const setEsCaseStudyField = (field: string, value: any) => {
    setDraft((d) => d ? { ...d, es: { ...(d.es ?? {}), caseStudy: { ...(d.es?.caseStudy ?? {}), [field]: value } } } : d)
  }

  const splitList = (v: string) => v.split(",").map((x) => x.trim()).filter(Boolean)

  const addTag = () => {
    const t = newTag.trim()
    if (!t || !draft) return
    setField("tags", [...(draft.tags ?? []), t])
    setNewTag("")
  }

  const removeTag = (i: number) => {
    if (!draft) return
    setField("tags", draft.tags.filter((_, idx) => idx !== i))
  }

  const addDetail = () => {
    const t = newDetail.trim()
    if (!t || !draft) return
    setCaseStudyField("details", [...(draft.caseStudy?.details ?? []), t])
    setNewDetail("")
  }

  const removeDetail = (i: number) => {
    if (!draft) return
    setCaseStudyField("details", draft.caseStudy.details.filter((_, idx) => idx !== i))
  }

  const addImageUrl = () => {
    const url = newImgUrl.trim()
    if (!url || !draft) return
    const img: ProjectImage = { src: url }
    setDraft((d) => d ? { ...d, images: [...(d.images ?? []), img] } : d)
    setNewImgUrl("")
  }

  const removeImage = (i: number) => {
    if (!draft) return
    setDraft((d) => d ? { ...d, images: (d.images ?? []).filter((_, idx) => idx !== i) } : d)
  }

  const toggleImage = (i: number) => {
    if (!draft) return
    setDraft((d) => {
      if (!d) return d
      const imgs = [...(d.images ?? [])]
      imgs[i] = { ...imgs[i], disabled: !imgs[i].disabled }
      return { ...d, images: imgs }
    })
  }

  const moveImage = (i: number, dir: -1 | 1) => {
    if (!draft) return
    const imgs = [...(draft.images ?? [])]
    const target = i + dir
    if (target < 0 || target >= imgs.length) return
    ;[imgs[i], imgs[target]] = [imgs[target], imgs[i]]
    setDraft((d) => d ? { ...d, images: imgs } : d)
  }

  // ── Image upload ─────────────────────────────────────────────────────────

  const uploadFile = async (file: File, isHero = false) => {
    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (isHero) {
        setField("imageSrc", data.url)
      } else {
        const img: ProjectImage = { src: data.url }
        setDraft((d) => d ? { ...d, images: [...(d.images ?? []), img] } : d)
      }
      showToast("Imagen subida correctamente", "success")
    } catch (e: any) {
      showToast(e.message ?? "Error al subir imagen", "error")
    } finally {
      setIsUploading(false)
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, isHero = false) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file, isHero)
    e.target.value = ""
  }

  // ── Save ─────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!draft) return
    setIsSaving(true)

    // Apply draft to projects array
    const updated = projects.map((p, i) => (i === selectedIdx ? draft : p))

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      })
      if (!res.ok) throw new Error("Save failed")
      setProjects(updated)
      showToast("Guardado correctamente ✓", "success")
    } catch {
      showToast("Error al guardar. Intenta de nuevo.", "error")
    } finally {
      setIsSaving(false)
    }
  }

  // Bulk save (for reorder)
  const handleSaveAll = async (list: Project[]) => {
    try {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(list),
      })
      showToast("Orden guardado", "success")
    } catch {
      showToast("Error al guardar orden", "error")
    }
  }

  // ── Logout ────────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/admin/login")
  }

  // ─────────────────────────────── Render ──────────────────────────────────

  return (
    <div className="flex h-screen flex-col bg-neutral-950 text-white overflow-hidden">

      {/* ── Header ── */}
      <header className="flex-none flex items-center justify-between px-6 py-3 border-b border-white/5 bg-neutral-900/80 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-lg bg-white flex items-center justify-center">
            <span className="text-[11px] font-black text-black">d</span>
          </div>
          <div>
            <span className="text-sm font-semibold text-white">Admin Panel</span>
            <span className="ml-2 text-xs text-white/30">· portafolio</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Ver sitio
          </a>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut className="h-3 w-3" />
            Salir
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Left sidebar: Project list ── */}
        <aside className="w-64 flex-none flex flex-col border-r border-white/5 bg-neutral-900/40">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
              Proyectos ({projects.length})
            </span>
            <button
              onClick={addProject}
              title="Agregar proyecto"
              className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10 text-white/40 hover:text-white hover:border-white/20 hover:bg-white/5 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-1">
            {projects.map((p, idx) => (
              <div
                key={idx}
                onClick={() => selectProject(idx)}
                className={`group flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors ${
                  idx === selectedIdx
                    ? "bg-white/10 border-r-2 border-white"
                    : "hover:bg-white/5"
                }`}
              >
                {/* Gradient preview */}
                <div
                  className="h-5 w-5 flex-none rounded-md"
                  style={{ background: `linear-gradient(135deg, ${p.gradientFrom}, ${p.gradientTo})` }}
                />

                <span className="flex-1 truncate text-xs font-medium text-white/70 group-hover:text-white transition-colors">
                  {p.title.split("—")[0].trim()}
                </span>

                {/* Reorder buttons */}
                <div className="flex-none flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); const next = [...projects]; const t = idx - 1; if (t < 0) return; [next[idx], next[t]] = [next[t], next[idx]]; setProjects(next); setSelectedIdx(t); setDraft(deepClone(next[t])); handleSaveAll(next) }}
                    className="text-white/30 hover:text-white transition-colors"
                    aria-label="Subir"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); const next = [...projects]; const t = idx + 1; if (t >= next.length) return; [next[idx], next[t]] = [next[t], next[idx]]; setProjects(next); setSelectedIdx(t); setDraft(deepClone(next[t])); handleSaveAll(next) }}
                    className="text-white/30 hover:text-white transition-colors"
                    aria-label="Bajar"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>

                {/* Delete */}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteProject(idx) }}
                  className="flex-none opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-colors"
                  aria-label="Eliminar"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Right: Editor ── */}
        {draft ? (
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-8 py-8 space-y-10 pb-32">

              {/* ── Basic info ── */}
              <div>
                <SectionTitle>Información básica</SectionTitle>
                <div className="grid grid-cols-1 gap-4">
                  <Field label="Título">
                    <input
                      className={inputCls}
                      value={draft.title}
                      onChange={(e) => setField("title", e.target.value)}
                      placeholder="Proyecto — Subtítulo corto"
                    />
                  </Field>
                  <Field label="Subtítulo">
                    <input
                      className={inputCls}
                      value={draft.subtitle}
                      onChange={(e) => setField("subtitle", e.target.value)}
                      placeholder="Descripción breve del proyecto"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Año">
                      <input
                        className={inputCls}
                        value={draft.caseStudy?.year ?? ""}
                        onChange={(e) => setCaseStudyField("year", e.target.value)}
                        placeholder="2024"
                      />
                    </Field>
                    <Field label="Href (ancla)">
                      <input
                        className={inputCls}
                        value={draft.href}
                        onChange={(e) => setField("href", e.target.value)}
                        placeholder="#mi-proyecto"
                      />
                    </Field>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5">
                    <input
                      type="checkbox"
                      id="priority"
                      checked={!!draft.priority}
                      onChange={(e) => setField("priority", e.target.checked)}
                      className="h-4 w-4 rounded accent-white"
                    />
                    <label htmlFor="priority" className="text-sm text-white/60 cursor-pointer select-none">
                      Imagen prioritaria (carga inmediata — solo para el primer proyecto)
                    </label>
                  </div>
                </div>
              </div>

              {/* ── Tags ── */}
              <div>
                <SectionTitle>Tags</SectionTitle>
                <div className="flex flex-wrap gap-2 mb-3">
                  {draft.tags.map((t, i) => (
                    <Chip key={i} label={t} onRemove={() => removeTag(i)} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className={inputCls}
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    placeholder="Nuevo tag..."
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="flex-none rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* ── Gradient ── */}
              <div>
                <SectionTitle>Gradiente de la card</SectionTitle>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <Field label="Color inicial">
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={draft.gradientFrom}
                        onChange={(e) => setField("gradientFrom", e.target.value)}
                        className="h-10 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent p-0.5"
                      />
                      <input
                        className={inputCls}
                        value={draft.gradientFrom}
                        onChange={(e) => setField("gradientFrom", e.target.value)}
                        placeholder="#0f172a"
                      />
                    </div>
                  </Field>
                  <Field label="Color final">
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={draft.gradientTo}
                        onChange={(e) => setField("gradientTo", e.target.value)}
                        className="h-10 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent p-0.5"
                      />
                      <input
                        className={inputCls}
                        value={draft.gradientTo}
                        onChange={(e) => setField("gradientTo", e.target.value)}
                        placeholder="#6d28d9"
                      />
                    </div>
                  </Field>
                </div>
                {/* Preview */}
                <div
                  className="h-12 w-full rounded-xl border border-white/10"
                  style={{ background: `linear-gradient(135deg, ${draft.gradientFrom}, ${draft.gradientTo})` }}
                />
              </div>

              {/* ── Case Study ── */}
              <div>
                <SectionTitle>Case Study</SectionTitle>
                <div className="space-y-4">
                  <Field label="Challenge / descripción principal">
                    <textarea
                      className={textareaCls}
                      rows={3}
                      value={draft.caseStudy?.description ?? ""}
                      onChange={(e) => setCaseStudyField("description", e.target.value)}
                      placeholder="Descripción del desafío principal del proyecto..."
                    />
                  </Field>
                  <Field label="Execution">
                    <textarea
                      className={textareaCls}
                      rows={4}
                      value={draft.caseStudy?.execution ?? ""}
                      onChange={(e) => setCaseStudyField("execution", e.target.value)}
                      placeholder="¿Cómo lo construiste? Proceso técnico y de diseño..."
                    />
                  </Field>
                  <Field label="Outcome">
                    <textarea
                      className={textareaCls}
                      rows={4}
                      value={draft.caseStudy?.outcome ?? ""}
                      onChange={(e) => setCaseStudyField("outcome", e.target.value)}
                      placeholder="¿Cuál fue el resultado? Métricas, impacto, logros..."
                    />
                  </Field>

                  {/* Key Capabilities */}
                  <Field label="Key Capabilities">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(draft.caseStudy?.details ?? []).map((d, i) => (
                        <Chip key={i} label={d} onRemove={() => removeDetail(i)} />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        className={inputCls}
                        value={newDetail}
                        onChange={(e) => setNewDetail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDetail())}
                        placeholder="Nueva capacidad..."
                      />
                      <button
                        type="button"
                        onClick={addDetail}
                        className="flex-none rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </Field>

                  <Field label="Mi rol">
                    <input
                      className={inputCls}
                      value={draft.caseStudy?.role ?? ""}
                      onChange={(e) => setCaseStudyField("role", e.target.value)}
                      placeholder="Design and development"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Link al sitio (botón Visit site)">
                      <input
                        className={inputCls}
                        value={draft.liveUrl ?? ""}
                        onChange={(e) => setField("liveUrl", e.target.value || undefined)}
                        placeholder="https://tu-proyecto.com"
                      />
                    </Field>
                    <Field label="Link al repositorio (botón View code)">
                      <input
                        className={inputCls}
                        value={draft.repoUrl ?? ""}
                        onChange={(e) => setField("repoUrl", e.target.value || undefined)}
                        placeholder="https://github.com/..."
                      />
                    </Field>
                  </div>
                </div>
              </div>

              {/* ── Español ── */}
              <div>
                <SectionTitle>Español (ES)</SectionTitle>
                <p className="mb-4 text-xs text-white/40">Lo que dejes vacío se muestra en inglés.</p>
                <div className="space-y-4">
                  <Field label="Título (ES)">
                    <input className={inputCls} value={draft.es?.title ?? ""} onChange={(e) => setEsField("title", e.target.value)} />
                  </Field>
                  <Field label="Subtítulo (ES)">
                    <input className={inputCls} value={draft.es?.subtitle ?? ""} onChange={(e) => setEsField("subtitle", e.target.value)} />
                  </Field>
                  <Field label="Tags (ES, separados por coma)">
                    <input
                      className={inputCls}
                      defaultValue={(draft.es?.tags ?? []).join(", ")}
                      key={`es-tags-${selectedIdx}`}
                      onBlur={(e) => setEsField("tags", splitList(e.target.value))}
                    />
                  </Field>
                  <Field label="El desafío (ES)">
                    <textarea className={textareaCls} rows={3} value={draft.es?.caseStudy?.description ?? ""} onChange={(e) => setEsCaseStudyField("description", e.target.value)} />
                  </Field>
                  <Field label="Qué construí (ES)">
                    <textarea className={textareaCls} rows={4} value={draft.es?.caseStudy?.execution ?? ""} onChange={(e) => setEsCaseStudyField("execution", e.target.value)} />
                  </Field>
                  <Field label="Estado y resultado (ES)">
                    <textarea className={textareaCls} rows={3} value={draft.es?.caseStudy?.outcome ?? ""} onChange={(e) => setEsCaseStudyField("outcome", e.target.value)} />
                  </Field>
                  <Field label="Mi rol (ES)">
                    <input className={inputCls} value={draft.es?.caseStudy?.role ?? ""} onChange={(e) => setEsCaseStudyField("role", e.target.value)} />
                  </Field>
                  <Field label="Stack y alcance (ES, separados por coma)">
                    <input
                      className={inputCls}
                      defaultValue={(draft.es?.caseStudy?.details ?? []).join(", ")}
                      key={`es-details-${selectedIdx}`}
                      onBlur={(e) => setEsCaseStudyField("details", splitList(e.target.value))}
                    />
                  </Field>
                </div>
              </div>

              {/* ── Images ── */}
              <div>
                <SectionTitle>Imágenes</SectionTitle>

                {/* Hero image (imageSrc) */}
                <div className="mb-6">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-3">Imagen principal (imageSrc)</p>
                  {draft.imageSrc && (
                    <div className="flex items-center gap-3 mb-3 p-3 rounded-xl border border-white/10 bg-white/5">
                      <div className="relative h-10 w-16 rounded overflow-hidden flex-none bg-white/5">
                        <Image src={draft.imageSrc} alt="hero" fill className="object-cover" />
                      </div>
                      <span className="flex-1 truncate text-xs text-white/50 font-mono">{draft.imageSrc}</span>
                      <button
                        onClick={() => setField("imageSrc", undefined)}
                        className="text-white/20 hover:text-red-400 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => heroFileInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-3 text-sm text-white/40 hover:text-white hover:border-white/30 hover:bg-white/[0.07] transition-colors"
                    >
                      {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      Subir archivo
                    </button>
                    <div className="flex gap-2">
                      <input
                        className={inputCls}
                        placeholder="URL manual..."
                        value={draft.imageSrc ?? ""}
                        onChange={(e) => setField("imageSrc", e.target.value || undefined)}
                      />
                    </div>
                  </div>
                  <input ref={heroFileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFileChange(e, true)} />
                </div>

                {/* Carousel images */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-3">Carousel (images[])</p>

                  {(draft.images ?? []).map((img, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 mb-2 p-3 rounded-xl border transition-colors ${
                        img.disabled
                          ? "border-white/5 bg-white/[0.02] opacity-50"
                          : "border-white/10 bg-white/5"
                      }`}
                    >
                      {/* Thumbnail or icon */}
                      <div className="relative h-10 w-16 rounded overflow-hidden flex-none bg-white/5 flex items-center justify-center">
                        {img.url ? (
                          <Globe className="h-5 w-5 text-emerald-400/60" />
                        ) : img.src ? (
                          <Image src={img.src} alt={`Slide ${i + 1}`} fill className="object-cover" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-white/20" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`block truncate text-xs font-mono ${
                          img.disabled ? "text-white/20 line-through" : "text-white/50"
                        }`}>
                          {img.url ?? img.src}
                        </span>
                        <span className={`text-[10px] font-semibold uppercase tracking-widest ${
                          img.url ? "text-emerald-400/70" : "text-white/20"
                        }`}>
                          {img.url ? "🌐 Website" : "🖼 Imagen"}
                          {img.disabled && " · oculto"}
                        </span>
                      </div>
                      {/* Reorder ↑↓ */}
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => moveImage(i, -1)}
                          disabled={i === 0}
                          title="Subir slide"
                          className="text-white/30 hover:text-white disabled:opacity-0 transition-colors"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => moveImage(i, 1)}
                          disabled={i === (draft.images ?? []).length - 1}
                          title="Bajar slide"
                          className="text-white/30 hover:text-white disabled:opacity-0 transition-colors"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {/* Toggle on/off */}
                      <button
                        onClick={() => toggleImage(i)}
                        title={img.disabled ? "Activar slide" : "Ocultar slide"}
                        className={`transition-colors ${
                          img.disabled
                            ? "text-white/20 hover:text-white"
                            : "text-white/50 hover:text-white"
                        }`}
                      >
                        {img.disabled
                          ? <EyeOff className="h-4 w-4" />
                          : <Eye className="h-4 w-4" />
                        }
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => removeImage(i)}
                        className="text-white/20 hover:text-red-400 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {/* Upload area */}
                  <div
                    className="mb-3 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-6 cursor-pointer hover:border-white/25 hover:bg-white/[0.05] transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      const file = e.dataTransfer.files[0]
                      if (file) uploadFile(file)
                    }}
                  >
                    {isUploading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-white/30" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-white/20" />
                    )}
                    <p className="text-xs text-white/30">
                      {isUploading ? "Subiendo..." : "Drop image here or click to upload"}
                    </p>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFileChange(e, false)} />
                  </div>

                  {/* Add image by URL */}
                  <div className="flex gap-2 mb-2">
                    <input
                      className={inputCls}
                      value={newImgUrl}
                      onChange={(e) => setNewImgUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImageUrl())}
                      placeholder="URL de imagen (https://...)"
                    />
                    <button
                      type="button"
                      onClick={addImageUrl}
                      title="Agregar imagen"
                      className="flex-none rounded-xl border border-white/10 bg-white/5 px-3 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </button>
                  </div>

                </div>
              </div>

            </div>

            {/* ── Sticky save bar ── */}
            <div className="fixed bottom-0 right-0 left-64 px-8 py-4 border-t border-white/5 bg-neutral-950/90 backdrop-blur-xl flex items-center justify-between z-10">
              <div className="text-xs text-white/30 font-mono">
                Editando: <span className="text-white/50">{draft.title.split("—")[0].trim()}</span>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </main>
        ) : (
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-white/20 mx-auto mb-4" />
              <p className="text-sm text-white/30">Cargando proyectos...</p>
            </div>
          </main>
        )}
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed bottom-20 right-6 z-50 flex items-center gap-3 rounded-2xl border px-5 py-3 text-sm font-medium shadow-xl backdrop-blur-xl transition-all ${
            toast.kind === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {toast.kind === "success" ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  )
}
