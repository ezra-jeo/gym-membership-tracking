import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

function addSecurityHeaders(response: NextResponse, pathname: string): NextResponse {
  // In App Router client-side navigations, document-level policies may persist from
  // the initial page load. Keep camera available to same-origin so /kiosk can start
  // without requiring a hard refresh after navigating from /admin or /landing.
  const cameraPolicy = 'camera=(self)'

  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    `${cameraPolicy}, microphone=(), geolocation=()`,
  )
  return response
}

function isInvalidRefreshTokenError(error: unknown): boolean {
  if (!error) return false

  const reason = typeof error === "string"
    ? error
    : error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message?: unknown }).message ?? "")
        : ""

  const normalized = reason.toLowerCase()
  return (
    normalized.includes("invalid refresh token") ||
    normalized.includes("refresh token not found") ||
    normalized.includes("missing refresh token")
  )
}

function clearSupabaseAuthCookies(request: NextRequest, response: NextResponse) {
  const authCookies = request.cookies
    .getAll()
    .filter((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"))

  authCookies.forEach((cookie) => {
    response.cookies.set(cookie.name, "", {
      path: "/",
      expires: new Date(0),
      maxAge: 0,
    })
  })
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const pathname = request.nextUrl.pathname

  const isGymOrKioskRoute = pathname.startsWith("/kiosk") || pathname.startsWith("/gym")
  const isMarketingRoute = pathname === "/" || pathname.startsWith("/landing")
  const isGymSelectRoute = pathname === "/gym-select" || pathname === "/qr-login"
  const isAuthRoute = pathname === "/login" || pathname === "/signup" || pathname.startsWith("/signup/")

  // Public pages should not pay auth/profile lookup cost.
  if (isGymOrKioskRoute || isMarketingRoute || isGymSelectRoute) {
    return addSecurityHeaders(supabaseResponse, pathname)
  }

  if (isAuthRoute) {
    let user = null
    try {
      const { data } = await supabase.auth.getUser()
      user = data.user
    } catch (error) {
      if (isInvalidRefreshTokenError(error)) {
        clearSupabaseAuthCookies(request, supabaseResponse)
        return addSecurityHeaders(supabaseResponse, pathname)
      }
      throw error
    }

    if (!user) return addSecurityHeaders(supabaseResponse, pathname)

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status, gym_id")
      .eq("id", user.id)
      .maybeSingle()

    if (!profile || profile.status === "rejected") {
      return addSecurityHeaders(supabaseResponse, pathname)
    }

    const redirectTo = profile.role === "member" ? "/member" : "/admin"
    return addSecurityHeaders(NextResponse.redirect(new URL(redirectTo, request.url)), pathname)
  }

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error) {
    if (isInvalidRefreshTokenError(error)) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      const redirect = NextResponse.redirect(url)
      clearSupabaseAuthCookies(request, redirect)
      return addSecurityHeaders(redirect, pathname)
    }
    throw error
  }

  // All other routes require auth
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return addSecurityHeaders(NextResponse.redirect(url), pathname)
  }

  // Role-based access control
  // Use maybeSingle — avoids 406 if profile row doesn't exist yet
  const { data: profile } = await  supabase
    .from("profiles")
    .select("role, status, gym_id")
    .eq("id", user.id)
    .maybeSingle()

  // No profile yet (trigger delay) or rejected — send to login
  if (!profile || profile.status === "rejected") {
    return addSecurityHeaders(NextResponse.redirect(new URL("/login", request.url)), pathname)
  }

  // Admin routes — only admin/staff/owner
  if (pathname.startsWith("/admin")) {
    if (profile.role !== "admin" && profile.role !== "staff" && profile.role !== "owner") {
      return addSecurityHeaders(NextResponse.redirect(new URL("/member", request.url)), pathname)
    }
  }

  // Redirect stale /dashboard URLs to /admin
  if (pathname.startsWith("/dashboard")) {
    return addSecurityHeaders(NextResponse.redirect(new URL("/admin", request.url)), pathname)
  }

  if (profile.gym_id) supabaseResponse.headers.set("x-gym-id", profile.gym_id)
  supabaseResponse.headers.set("x-user-role", profile.role)

  return addSecurityHeaders(supabaseResponse, pathname)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)',
  ],
}