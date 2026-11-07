import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { cookies } from "next/headers"
import { ADMIN_COOKIE, isValidSession } from "@/lib/auth"
import path from "path"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  if (!(await isValidSession(cookieStore.get(ADMIN_COOKIE)?.value))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
      return NextResponse.json({ error: "Only PNG, JPG, WEBP or GIF images are allowed" }, { status: 400 })
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "Image too large (max 8 MB)" }, { status: 400 })
    }

    // Sanitize filename
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const filename = `${Date.now()}-${safeName}`
    const uploadDir = path.join(process.cwd(), "public", "images", "uploads")

    await mkdir(uploadDir, { recursive: true })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(path.join(uploadDir, filename), buffer)

    return NextResponse.json({ url: `/images/uploads/${filename}` })
  } catch (e) {
    console.error("[upload] Error:", e)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
