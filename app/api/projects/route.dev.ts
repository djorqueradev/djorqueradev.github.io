import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { ADMIN_COOKIE, isValidSession } from "@/lib/auth"
import { readProjectsFile, writeProjectsFile } from "@/lib/projects"

export async function GET() {
  const projects = readProjectsFile()
  return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  if (!(await isValidSession(cookieStore.get(ADMIN_COOKIE)?.value))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const projects = await req.json()
    writeProjectsFile(projects)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: "Failed to save projects" }, { status: 500 })
  }
}
