import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { ADMIN_COOKIE, SESSION_SECONDS, checkPassword, createSessionToken } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()

    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "ADMIN_PASSWORD not configured" }, { status: 500 })
    }

    if (!(await checkPassword(password))) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    const cookieStore = await cookies()
    cookieStore.set({
      name: ADMIN_COOKIE,
      value: await createSessionToken(),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SESSION_SECONDS,
      path: "/",
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 })
  }
}
