import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"  

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
    return supabaseResponse
  }

  if (isAuthRoute) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return supabaseResponse

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status, gym_id")
      .eq("id", user.id)
      .maybeSingle()

    if (!profile || profile.status === "pending" || profile.status === "rejected") {
      return supabaseResponse
    }

    const redirectTo = profile.role === "member" ? "/member" : "/admin"
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // All other routes require auth
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Role-based access control
  // Use maybeSingle — avoids 406 if profile row doesn't exist yet
  const { data: profile } = await  supabase
    .from("profiles")
    .select("role, status, gym_id")
    .eq("id", user.id)
    .maybeSingle()

  // No profile yet (trigger delay) or pending/rejected — send to login
  if (!profile || profile.status === "pending" || profile.status === "rejected") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Admin routes — only admin/staff/owner
  if (pathname.startsWith("/admin")) {
    if (profile.role !== "admin" && profile.role !== "staff" && profile.role !== "owner") {
      return NextResponse.redirect(new URL("/member", request.url))
    }
  }

  // Redirect stale /dashboard URLs to /admin
  if (pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  if (profile.gym_id) supabaseResponse.headers.set("x-gym-id", profile.gym_id)
  supabaseResponse.headers.set("x-user-role", profile.role)

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)',
  ],
}