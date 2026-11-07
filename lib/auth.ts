/**
 * Admin session token: "<expiresAt>.<hmac>" signed with ADMIN_PASSWORD.
 * Uses Web Crypto so it works both in middleware (edge) and API routes (node).
 * A forged cookie (e.g. admin_auth=1) no longer passes.
 */
export const ADMIN_COOKIE = "admin_auth"
export const SESSION_SECONDS = 60 * 60 * 24 * 7 // 7 days

const encoder = new TextEncoder()

async function hmac(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function createSessionToken(): Promise<string> {
  const secret = process.env.ADMIN_PASSWORD
  if (!secret) throw new Error("ADMIN_PASSWORD not configured")
  const expires = String(Date.now() + SESSION_SECONDS * 1000)
  return `${expires}.${await hmac(`admin:${expires}`, secret)}`
}

export async function isValidSession(token: string | undefined): Promise<boolean> {
  const secret = process.env.ADMIN_PASSWORD
  if (!secret || !token) return false
  const [expires, sig] = token.split(".")
  if (!expires || !sig || Number(expires) < Date.now()) return false
  return safeEqual(sig, await hmac(`admin:${expires}`, secret))
}

/** Constant-time password check. */
export async function checkPassword(input: unknown): Promise<boolean> {
  const secret = process.env.ADMIN_PASSWORD
  if (!secret || typeof input !== "string") return false
  return safeEqual(await hmac(input, secret), await hmac(secret, secret))
}
