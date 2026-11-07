import { NextRequest, NextResponse } from "next/server"
import { ADMIN_COOKIE, isValidSession } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isLoginPage = pathname === "/admin/login"
  const isAuthenticated = await isValidSession(request.cookies.get(ADMIN_COOKIE)?.value)

  // Redirect unauthenticated users to login
  if (!isLoginPage && !isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = "/admin/login"
    return NextResponse.redirect(url)
  }

  // Redirect already-authenticated users away from login
  if (isLoginPage && isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = "/admin"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
