import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", requestUrl.origin))
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin))
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL("/login?error=no_user", requestUrl.origin))
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile || profile.status === "rejected") {
    return NextResponse.redirect(new URL("/login?error=profile_unavailable", requestUrl.origin))
  }

  if (profile.status === "pending") {
    return NextResponse.redirect(new URL("/login?error=pending_approval", requestUrl.origin))
  }

  if (profile.role === "owner" || profile.role === "admin" || profile.role === "staff") {
    return NextResponse.redirect(new URL("/admin", requestUrl.origin))
  }

  return NextResponse.redirect(new URL("/member", requestUrl.origin))
}
