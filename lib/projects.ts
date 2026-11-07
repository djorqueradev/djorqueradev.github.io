import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"
import path from "path"
import { projects as defaultProjects, Project } from "./data"

const DATA_FILE = path.join(process.cwd(), "data", "projects.json")

/** Read projects from the JSON file. Falls back to static data.ts if not found. */
export function readProjectsFile(): Project[] {
  try {
    if (existsSync(DATA_FILE)) {
      const raw = readFileSync(DATA_FILE, "utf-8")
      return JSON.parse(raw) as Project[]
    }
  } catch (e) {
    console.error("[projects] Failed to read projects.json, using defaults:", e)
  }
  return defaultProjects
}

/** Write projects to the JSON file, creating the directory if needed. */
export function writeProjectsFile(data: Project[]): void {
  const dir = path.dirname(DATA_FILE)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8")
}
