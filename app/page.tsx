import { readProjectsFile } from "@/lib/projects"
import PageClient from "./page-client"

// Static at build time (GitHub Pages). In `npm run dev` it re-reads data/projects.json on every refresh.
export const dynamic = "force-static"

export default function Page() {
  const projects = readProjectsFile()
  return <PageClient projects={projects} />
}
