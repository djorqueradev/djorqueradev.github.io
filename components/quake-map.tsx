"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

/**
 * Time-lapse of real earthquakes in Chile (USGS significant events, M5.5+, 1965–2016).
 * Data: public/data/chile-quakes.json → { events: [lon, lat, mag, yearFraction][], land: { [country]: [lon, lat][][] } }
 */

type QuakeData = { events: [number, number, number, number][]; land: Record<string, [number, number][][]> }

let cache: Promise<QuakeData> | null = null
const load = () => (cache ??= fetch("/data/chile-quakes.json").then((r) => r.json()))

interface Props {
  className?: string
  labels: { events: string; source: string }
  /** Seconds the time-lapse takes from 1965 to 2017 */
  duration?: number
  compact?: boolean
}

const LON0 = -80, LON1 = -62, LAT0 = -17, LAT1 = -56
const Y0 = 1965, Y1 = 2017

export default function QuakeMap({ className, labels, duration = 20, compact = false }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [data, setData] = useState<QuakeData | null>(null)
  const [visible, setVisible] = useState(false)
  const labelsRef = useRef(labels)
  labelsRef.current = labels

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (visible && !data) load().then(setData).catch(() => {})
  }, [visible, data])

  useEffect(() => {
    const wrap = wrapRef.current, canvas = canvasRef.current
    if (!wrap || !canvas || !data || !visible) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const mono = getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim() || "ui-monospace, monospace"
    let w = 0, h = 0, raf = 0, dirty = true

    const resize = () => {
      const r = wrap.getBoundingClientRect()
      w = r.width
      h = r.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      dirty = true
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    const kx = Math.cos((36 * Math.PI) / 180)
    const total = duration + 4 // hold the final frame for 4 s
    const start = performance.now()

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw)
      if (reduce && !dirty) return // static frame: redraw only after a resize
      dirty = false
      const elapsed = reduce ? total : ((now - start) / 1000) % total
      const year = Y0 + Math.min(1, elapsed / duration) * (Y1 - Y0)

      const narrow = w < 520
      const padTop = compact ? (narrow ? 88 : 56) : 24
      const padBottom = compact ? (narrow ? 170 : 110) : 24
      const k = (h - padTop - padBottom) / (LAT0 - LAT1)
      const mapW = (LON1 - LON0) * kx * k
      const cx = w > h * 0.9 ? w * 0.62 : w * 0.66
      const ox = cx - mapW / 2
      const P = (lon: number, lat: number): [number, number] => [ox + (lon - LON0) * kx * k, padTop + (LAT0 - lat) * k]

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      // land
      for (const [country, rings] of Object.entries(data.land)) {
        const chile = country === "Chile"
        ctx.fillStyle = chile ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.025)"
        ctx.strokeStyle = chile ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.1)"
        ctx.lineWidth = chile ? 1 : 0.7
        for (const ring of rings) {
          ctx.beginPath()
          ring.forEach(([lon, lat], i) => {
            const [x, y] = P(lon, lat)
            i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
          })
          ctx.closePath()
          ctx.fill()
          ctx.stroke()
        }
      }

      // latitude ticks
      ctx.font = `10px ${mono}`
      ctx.fillStyle = "rgba(255,255,255,0.25)"
      ctx.textAlign = "right"
      for (let lat = -20; lat >= -55; lat -= 10) {
        const [, y] = P(LON0, lat)
        ctx.fillText(`${Math.abs(lat)}°S`, ox - 8, y + 3)
        ctx.fillRect(ox - 4, y, 4, 1)
      }

      // events
      let count = 0
      const big: { x: number; y: number; m: number; yr: number }[] = []
      for (const [lon, lat, m, yr] of data.events) {
        if (yr > year) break
        count++
        const [x, y] = P(lon, lat)
        const r = 1.2 + Math.pow(Math.max(0, m - 5.3), 1.7) * 1.6
        const age = (year - yr) * (duration / (Y1 - Y0)) // seconds since it appeared
        if (age < 1.4 && !reduce) {
          const t = age / 1.4
          ctx.beginPath()
          ctx.arc(x, y, r + t * (8 + r * 3), 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(248,113,113,${0.7 * (1 - t)})`
          ctx.lineWidth = 1.2
          ctx.stroke()
        }
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fillStyle = age < 1.4 && !reduce ? "rgba(254,202,202,0.95)" : `rgba(239,68,68,${m >= 7 ? 0.75 : 0.45})`
        ctx.fill()
        if (m >= 8) big.push({ x, y, m, yr })
      }

      // labels for M8+
      ctx.font = `600 10px ${mono}`
      ctx.textAlign = "left"
      for (const b of narrow ? [] : big) {
        ctx.strokeStyle = "rgba(255,255,255,0.35)"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(b.x + 6, b.y)
        ctx.lineTo(b.x + 34, b.y)
        ctx.stroke()
        ctx.fillStyle = "rgba(255,255,255,0.8)"
        ctx.fillText(`M${b.m.toFixed(1)} · ${Math.floor(b.yr)}`, b.x + 38, b.y + 3)
      }

      // year counter + count
      const tx = compact ? 20 : 28
      const ty = compact ? (narrow ? padTop + 40 : h * 0.42) : h * 0.4
      ctx.textAlign = "left"
      ctx.fillStyle = "rgba(255,255,255,0.92)"
      ctx.font = `700 ${Math.round(Math.min(64, w * 0.09))}px ${mono}`
      ctx.fillText(String(Math.min(Y1 - 1, Math.floor(year))), tx, ty)
      ctx.font = `11px ${mono}`
      ctx.fillStyle = "rgba(255,255,255,0.45)"
      ctx.fillText(`${count} ${labelsRef.current.events}`, tx + 2, ty + 22)
      // progress bar
      const bw = Math.min(160, w * 0.3)
      ctx.fillStyle = "rgba(255,255,255,0.1)"
      ctx.fillRect(tx + 2, ty + 34, bw, 2)
      ctx.fillStyle = "rgba(239,68,68,0.9)"
      ctx.fillRect(tx + 2, ty + 34, bw * ((year - Y0) / (Y1 - Y0)), 2)
      ctx.font = `9px ${mono}`
      ctx.fillStyle = "rgba(255,255,255,0.25)"
      ctx.fillText(labelsRef.current.source, tx + 2, ty + 54)

    }
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [data, visible, duration, compact])

  return (
    <div ref={wrapRef} className={cn("absolute inset-0", className)}>
      <canvas ref={canvasRef} className="block" role="img" aria-label="Time-lapse map of earthquakes in Chile, 1965–2016" />
    </div>
  )
}
