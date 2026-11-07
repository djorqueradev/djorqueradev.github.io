import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js"

/**
 * The public site is a static export for GitHub Pages (https://djorqueradev.github.io).
 * The admin panel, its API routes and the auth middleware use the `.dev.tsx` / `.dev.ts`
 * extension, so they only exist while running `npm run dev` on your computer.
 */
export default function nextConfig(phase) {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER
  return {
    output: isDev ? undefined : "export",
    pageExtensions: isDev ? ["dev.tsx", "dev.ts", "tsx", "ts"] : ["tsx", "ts"],
    trailingSlash: true,
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: false },
    images: { unoptimized: true },
  }
}
