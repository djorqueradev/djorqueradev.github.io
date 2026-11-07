"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

/**
 * Interactive 3D model of the HGV Data Logger enclosure (v8, 142 × 133 × 47 mm).
 * Pure Canvas 2D (no WebGL / no dependencies): boxes and cylinders projected with
 * perspective and drawn back-to-front. Component sizes are the measured ones.
 */

type Vec3 = [number, number, number]
type Group = "base" | "f2" | "lid"
type Part = {
  kind: "box" | "cyl"
  group: Group
  color: string
  alpha?: number // < 1 → translucent "x-ray" surface, no back-face culling
  key?: LegendKey
  // box: min corner + size ; cyl: center xy, radius, z range
  x: number
  y: number
  z: number
  w: number
  d: number
  h: number
  openTop?: boolean
}

export type LegendKey = "esp32" | "ups" | "gps" | "can" | "buck" | "sd" | "oled" | "buttons"

export const ENCLOSURE_LEGEND: { key: LegendKey; color: string; en: string; es: string }[] = [
  { key: "esp32", color: "#14b8a6", en: "ESP32-S3 board with screw terminals", es: "Placa ESP32-S3 con bornes" },
  { key: "ups", color: "#f59e0b", en: "UPS · 18650 battery", es: "UPS · batería 18650" },
  { key: "gps", color: "#22c55e", en: "GPS + antenna", es: "GPS + antena" },
  { key: "can", color: "#3b82f6", en: "CAN transceiver", es: "Transceptor CAN" },
  { key: "buck", color: "#ef4444", en: "LM2596HVS buck converter", es: "Convertidor buck LM2596HVS" },
  { key: "sd", color: "#a855f7", en: "microSD reader", es: "Lector microSD" },
  { key: "oled", color: "#38bdf8", en: "OLED display", es: "Pantalla OLED" },
  { key: "buttons", color: "#e5e5e5", en: "3 panel-mount buttons", es: "3 botones de panel" },
]

const C = Object.fromEntries(ENCLOSURE_LEGEND.map((l) => [l.key, l.color])) as Record<LegendKey, string>

const L = 142 // X — length
const W = 133 // Y — width (Y = 0 is the front face)
const H = 47 // Z — height
const WALL = 2.5
const SHELF_Z = 19.5 // floor 2 shelf bottom
const SHELF_T = 2
const F2 = SHELF_Z + SHELF_T // floor 2 component base
const LID_Z = H - WALL

function box(group: Group, color: string, x: number, y: number, z: number, w: number, d: number, h: number, extra: Partial<Part> = {}): Part {
  return { kind: "box", group, color, x, y, z, w, d, h, ...extra }
}
function cyl(group: Group, color: string, cx: number, cy: number, r: number, z0: number, z1: number, extra: Partial<Part> = {}): Part {
  return { kind: "cyl", group, color, x: cx, y: cy, z: z0, w: r, d: r, h: z1 - z0, ...extra }
}

const PARTS: Part[] = [
  // ── Shell (x-ray) ──
  box("base", "#ffffff", 0, 0, 0, L, W, LID_Z, { alpha: 0.05, openTop: true }),
  // corner posts
  ...[
    [3, 3],
    [L - 10, 3],
    [3, W - 10],
    [L - 10, W - 10],
  ].map(([x, y]) => cyl("base", "#a3a3a3", x + 3.5, y + 3.5, 3.5, WALL, LID_Z)),

  // ── Floor 1: ESP32-S3 board with screw terminals ──
  box("base", "#0f766e", 6, 20, WALL + 3, 130, 90, 1.6, { key: "esp32" }),
  box("base", C.esp32, 8, 21, WALL + 4.6, 126, 8, 8.4, { key: "esp32" }),
  box("base", C.esp32, 8, 101, WALL + 4.6, 126, 8, 8.4, { key: "esp32" }),
  box("base", "#d4d4d4", 58, 54, WALL + 4.6, 25, 18, 3.2, { key: "esp32" }),

  // ── Floor 2 ──
  box("f2", "#525252", 6, 12, SHELF_Z, 130, 118, SHELF_T, { alpha: 0.35 }),
  box("f2", C.sd, 48.5, 14, F2, 45, 23, 3, { key: "sd" }),
  box("f2", C.oled, 58, 40, F2, 26, 24, 10, { key: "oled" }),
  box("f2", C.can, 10, 77, F2, 34, 10, 15, { key: "can" }),
  box("f2", C.gps, 52, 67, F2, 35, 31, 10, { key: "gps" }),
  box("f2", "#15803d", 57, 70, F2 + 10, 25, 25, 8, { key: "gps" }),
  box("f2", C.buck, 93, 72, F2, 43, 20, 12, { key: "buck" }),
  box("f2", C.ups, 18.5, 101, F2, 105, 27, 20, { key: "ups" }),

  // ── Lid with display window and buttons ──
  box("lid", "#ffffff", 0, 0, LID_Z, L, W, WALL, { alpha: 0.07 }),
  box("lid", "#0a0a0a", 60, 42, H, 22, 20, 0.2, { alpha: 0.9 }),
  ...[51, 71, 91].flatMap((x) => [
    cyl("lid", C.buttons, x, 25.5, 7.5, LID_Z - 20 + 2.5, LID_Z, { key: "buttons", alpha: 0.55 }),
    cyl("lid", "#fafafa", x, 25.5, 6, H, H + 3, { key: "buttons" }),
  ]),
]
// second cable gland (floor 2 height) — drawn as a ring on the front face
const GLANDS = [
  { x: 24, z: 11 },
  { x: 24, z: 32 },
]

type Face = { pts: Vec3[]; color: string; alpha: number; normal: Vec3; cull: boolean; edge: boolean }

function partFaces(p: Part, dz: number): Face[] {
  const a = p.alpha ?? 1
  const cull = a >= 1
  const faces: Face[] = []
  if (p.kind === "box") {
    const x0 = p.x, x1 = p.x + p.w, y0 = p.y, y1 = p.y + p.d, z0 = p.z + dz, z1 = p.z + p.h + dz
    const v = (x: number, y: number, z: number): Vec3 => [x, y, z]
    const quads: [Vec3[], Vec3][] = [
      [[v(x0, y0, z0), v(x1, y0, z0), v(x1, y0, z1), v(x0, y0, z1)], [0, -1, 0]],
      [[v(x1, y1, z0), v(x0, y1, z0), v(x0, y1, z1), v(x1, y1, z1)], [0, 1, 0]],
      [[v(x0, y1, z0), v(x0, y0, z0), v(x0, y0, z1), v(x0, y1, z1)], [-1, 0, 0]],
      [[v(x1, y0, z0), v(x1, y1, z0), v(x1, y1, z1), v(x1, y0, z1)], [1, 0, 0]],
      [[v(x0, y1, z0), v(x1, y1, z0), v(x1, y0, z0), v(x0, y0, z0)], [0, 0, -1]],
    ]
    if (!p.openTop) quads.push([[v(x0, y0, z1), v(x1, y0, z1), v(x1, y1, z1), v(x0, y1, z1)], [0, 0, 1]])
    for (const [pts, n] of quads) faces.push({ pts, color: p.color, alpha: a, normal: n, cull, edge: true })
  } else {
    const n = 14
    const z0 = p.z + dz, z1 = p.z + p.h + dz
    const ring = (z: number) =>
      Array.from({ length: n }, (_, i) => {
        const t = (i / n) * Math.PI * 2
        return [p.x + Math.cos(t) * p.w, p.y + Math.sin(t) * p.w, z] as Vec3
      })
    const bot = ring(z0), top = ring(z1)
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n
      const t = ((i + 0.5) / n) * Math.PI * 2
      faces.push({ pts: [bot[i], bot[j], top[j], top[i]], color: p.color, alpha: a, normal: [Math.cos(t), Math.sin(t), 0], cull, edge: false })
    }
    if (p.h > 0) faces.push({ pts: top, color: p.color, alpha: a, normal: [0, 0, 1], cull, edge: true })
  }
  return faces
}

function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.min(255, ((n >> 16) & 255) * k)
  const g = Math.min(255, ((n >> 8) & 255) * k)
  const b = Math.min(255, (n & 255) * k)
  return `rgb(${r | 0},${g | 0},${b | 0})`
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

interface Props {
  className?: string
  /** Card mode: auto-rotates and cycles assembled ↔ exploded */
  autoplay?: boolean
  /** Controlled exploded state (case study toggle). Ignored when autoplay is on. */
  exploded?: boolean
  highlight?: LegendKey | null
  /** Drag to rotate. Off in cards so touch scrolling still works. */
  interactive?: boolean
}

export default function EnclosureViewer({ className, autoplay = true, exploded = false, highlight = null, interactive = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const state = useRef({ yaw: -0.7, pitch: 0.62, dragging: false, lastX: 0, lastY: 0, idleSince: 0, explode: 0 })
  const props = useRef({ autoplay, exploded, highlight })
  props.current = { autoplay, exploded, highlight }
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap || !visible) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let raf = 0
    let w = 0, h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const r = wrap.getBoundingClientRect()
      w = r.width
      h = r.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    const s = state.current
    const start = performance.now()

    const draw = (now: number) => {
      const { autoplay: auto, exploded: exp, highlight: hl } = props.current
      const t = (now - start) / 1000
      if (!s.dragging && !reduce && now - s.idleSince > 1200) s.yaw += 0.0035

      // explode amount
      let target = exp ? 1 : 0
      if (auto && !reduce) {
        const cycle = t % 8
        target = cycle < 3 ? 0 : cycle < 4 ? ease(cycle - 3) : cycle < 7 ? 1 : 1 - ease(cycle - 7)
        s.explode = target
      } else {
        s.explode += (target - s.explode) * 0.08
      }
      const ex = s.explode
      const dz: Record<Group, number> = { base: 0, f2: 34 * ex, lid: 78 * ex }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      // camera
      const cy = Math.cos(s.yaw), sy = Math.sin(s.yaw), cp = Math.cos(s.pitch), sp = Math.sin(s.pitch)
      const center: Vec3 = [L / 2, W / 2, H / 2 + 20 * ex]
      const camDist = 520
      const span = 230 + 60 * ex
      const scale = (Math.min(w, h * 1.15) / span) * 1.0
      const view = (p: Vec3): Vec3 => {
        const x = p[0] - center[0], y = p[1] - center[1], z = p[2] - center[2]
        // yaw around Z, then pitch around X (camera looks along +Y in view space)
        const x1 = x * cy - y * sy
        const y1 = x * sy + y * cy
        const y2 = y1 * cp - z * sp
        const z2 = y1 * sp + z * cp
        return [x1, y2, z2] // depth = y2 (bigger = farther)
      }
      const project = (v: Vec3): [number, number] => {
        const f = camDist / (camDist + v[1])
        return [w / 2 + v[0] * f * scale, h / 2 - v[2] * f * scale]
      }
      const rot = (n: Vec3): Vec3 => {
        const x1 = n[0] * cy - n[1] * sy
        const y1 = n[0] * sy + n[1] * cy
        return [x1, y1 * cp - n[2] * sp, y1 * sp + n[2] * cp]
      }

      // ground grid
      ctx.lineWidth = 1
      for (let gx = -40; gx <= L + 40; gx += 20) {
        for (let gy = -40; gy <= W + 40; gy += 20) {
          const [px, py] = project(view([gx, gy, -6]))
          ctx.fillStyle = "rgba(255,255,255,0.08)"
          ctx.fillRect(px - 0.75, py - 0.75, 1.5, 1.5)
        }
      }

      // faces
      const faces: { pts2: [number, number][]; depth: number; fill: string; alpha: number; edge: boolean; dim: boolean }[] = []
      const light: Vec3 = [-0.35, -0.55, 0.76]
      for (const p of PARTS) {
        const dim = !!hl && p.key !== hl && (p.alpha ?? 1) >= 0.5
        for (const f of partFaces(p, dz[p.group])) {
          const nv = rot(f.normal)
          if (f.cull && nv[1] > 0.02) continue // facing away from the camera
          const vs = f.pts.map(view)
          const depth = vs.reduce((acc, v) => acc + v[1], 0) / vs.length
          const lum = 0.5 + 0.55 * Math.max(0, f.normal[0] * light[0] + f.normal[1] * light[1] + f.normal[2] * light[2])
          faces.push({ pts2: vs.map(project), depth, fill: shade(f.color, lum), alpha: f.alpha, edge: f.edge, dim })
        }
      }
      faces.sort((a, b) => b.depth - a.depth)
      for (const f of faces) {
        ctx.beginPath()
        f.pts2.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
        ctx.closePath()
        ctx.globalAlpha = f.dim ? f.alpha * 0.18 : f.alpha
        ctx.fillStyle = f.fill
        ctx.fill()
        if (f.edge) {
          ctx.globalAlpha = f.dim ? 0.08 : f.alpha < 1 ? 0.45 : 0.35
          ctx.strokeStyle = f.alpha < 1 ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.6)"
          ctx.lineWidth = f.alpha < 1 ? 0.8 : 0.6
          ctx.stroke()
        }
      }
      ctx.globalAlpha = 1

      // cable glands on the front face
      for (const g of GLANDS) {
        ctx.beginPath()
        for (let i = 0; i <= 20; i++) {
          const a = (i / 20) * Math.PI * 2
          const [px, py] = project(view([g.x + Math.cos(a) * 5, 0, g.z + Math.sin(a) * 5]))
          i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)
        }
        ctx.strokeStyle = "rgba(245,158,11,0.8)"
        ctx.lineWidth = 1.2
        ctx.stroke()
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [visible])

  const onPointerDown = (e: React.PointerEvent) => {
    const s = state.current
    s.dragging = true
    s.lastX = e.clientX
    s.lastY = e.clientY
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const s = state.current
    if (!s.dragging) return
    s.yaw += (e.clientX - s.lastX) * 0.01
    s.pitch = Math.max(0.15, Math.min(1.35, s.pitch + (e.clientY - s.lastY) * 0.008))
    s.lastX = e.clientX
    s.lastY = e.clientY
  }
  const onPointerUp = () => {
    state.current.dragging = false
    state.current.idleSince = performance.now()
  }

  return (
    <div
      ref={wrapRef}
      className={cn("absolute inset-0", interactive && "cursor-grab active:cursor-grabbing touch-none", className)}
      onPointerDown={interactive ? onPointerDown : undefined}
      onPointerMove={interactive ? onPointerMove : undefined}
      onPointerUp={interactive ? onPointerUp : undefined}
      onPointerCancel={interactive ? onPointerUp : undefined}
    >
      <canvas ref={canvasRef} className="block" aria-label="3D model of the data logger enclosure" role="img" />
    </div>
  )
}
