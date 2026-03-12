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

  // Demo mode — bypass Supabase auth for debug access
  const demoRole = request.cookies.get("demo-role")?.value
  if (demoRole === "admin" || demoRole === "member" || demoRole === "owner") {
    if (pathname === "/login" || pathname === "/signup") {
      const redirectTo = demoRole === "member" ? "/member" : "/admin"
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }
    if (pathname.startsWith("/admin")) {
      if (demoRole === "member") {
        return NextResponse.redirect(new URL("/member", request.url))
      }
    }
    // Redirect stale /dashboard URLs to /admin
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
    return supabaseResponse
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Public routes — no auth needed
  const publicRoutes = ["/", "/landing", "/login", "/signup", "/signup/member", "/signup/admin"]
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    if (user && (pathname === "/login" || pathname === "/signup")) {
      // Use maybeSingle — profile may not exist yet if trigger hasn't fired
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
    return supabaseResponse
  }

  // Kiosk is accessible without auth (used at the gym front desk)
  if (pathname.startsWith("/kiosk")) {
    return supabaseResponse
  }

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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}