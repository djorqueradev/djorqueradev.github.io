"use client"

import { useEffect, useState } from "react"

type Props = {
  timeZone?: string
  locale?: string
  className?: string
}

export default function LiveClock({ timeZone = "UTC", locale = "en-US", className = "" }: Props) {
  const [now, setNow] = useState<string | null>(null)

  useEffect(() => {
    const updateTime = () => {
      setNow(
        new Date().toLocaleString(locale, {
          timeZone,
          weekday: "long",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: locale.startsWith("en"),
          timeZoneName: "short",
        })
      )
    }

    updateTime()
    const id = setInterval(updateTime, 1000)
    return () => clearInterval(id)
  }, [timeZone, locale])

  if (!now) return null // Or a placeholder with the same structure to avoid layout shift

  return <div className={className}>{now}</div>
}
