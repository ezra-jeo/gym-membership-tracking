"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { withTimeout } from "@/lib/async-guard"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/lib/types"

const SIGN_OUT_TIMEOUT_MS = 10000
const NAVIGATION_FAILSAFE_MS = 2000

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isSigningOut: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null; user: User | null }>
  signUp: (email: string, password: string, name: string, role?: "member" | "admin") => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

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
  return normalized.includes("invalid refresh token") || normalized.includes("refresh token not found")
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const isRecoveringAuthRef = useRef(false)
  const router = useRouter()
  const pathname = usePathname()

  const shouldSkipAuthBootstrap = useMemo(() => {
    if (!pathname) return false

    if (pathname === "/") return true

    return (
      pathname.startsWith("/landing") ||
      pathname.startsWith("/gym") ||
      pathname.startsWith("/kiosk") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/signup")
    )
  }, [pathname])

  // On public routes, avoid creating an auth client unless an auth action is triggered.
  const supabase = useMemo(() => {
    if (shouldSkipAuthBootstrap) return null
    return createClient()
  }, [shouldSkipAuthBootstrap])

  const getClient = () => supabase ?? createClient()

  const recoverFromInvalidRefreshToken = useCallback(async (client = supabase ?? createClient()) => {
    if (isRecoveringAuthRef.current) return
    isRecoveringAuthRef.current = true

    try {
      await client.auth.signOut({ scope: "local" })
    } catch {
      // Ignore local cleanup failures and still clear app state.
    } finally {
      setUser(null)
      setProfile(null)
      setIsLoading(false)
      isRecoveringAuthRef.current = false
    }

    const isAuthRoute = pathname === "/login" || pathname === "/signup" || pathname?.startsWith("/signup/")
    if (!isAuthRoute) {
      router.replace("/login")
      router.refresh()
    }
  }, [pathname, router, supabase])

  useEffect(() => {
    if (shouldSkipAuthBootstrap || !supabase) {
      setUser(null)
      setProfile(null)
      setIsLoading(false)
      return
    }

    // Set loading=true immediately so layouts don't see the transient
    // user=null state and incorrectly redirect to /login before
    // onAuthStateChange has a chance to fire with the existing session.
    setIsLoading(true)

    let isActive = true
    let hasResolved = false

    const bootstrapTimeout = setTimeout(() => {
      if (!isActive || hasResolved) return
      setUser(null)
      setProfile(null)
      setIsLoading(false)
    }, 5000) // reduced from 8000ms — if it hasn't resolved in 5s, something is wrong

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isActive) return

      hasResolved = true

      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        await fetchProfile(currentUser.id, supabase)
      } else {
        setProfile(null)
        setIsLoading(false)
      }
    })

    return () => {
      isActive = false
      clearTimeout(bootstrapTimeout)
      subscription.unsubscribe()
    }
  }, [shouldSkipAuthBootstrap, supabase])

  useEffect(() => {
    if (shouldSkipAuthBootstrap || !supabase) return

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (!isInvalidRefreshTokenError(event.reason)) return

      event.preventDefault()
      void recoverFromInvalidRefreshToken(supabase)
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection)
    return () => window.removeEventListener("unhandledrejection", handleUnhandledRejection)
  }, [recoverFromInvalidRefreshToken, shouldSkipAuthBootstrap, supabase])

  async function fetchProfile(userId: string, client = getClient()) {
    try {
      const { data, error } = await client
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle()

      if (error) {
        if (isInvalidRefreshTokenError(error)) {
          await recoverFromInvalidRefreshToken(client)
          return
        }

        setProfile(null)
        return
      }

      if (data) {
        setProfile({
          id: data.id,
          email: data.email,
          name: data.name,
          contactNumber: data.contact_number,
          role: data.role ?? "member",
          status: data.status ?? "active",
          gymId: data.gym_id ?? null,
          avatarUrl: data.avatar_url,
          qrCode: data.qr_code ?? "",
          createdAt: data.created_at ?? new Date().toISOString(),
        })
      } else {
        setProfile(null)
      }
    } catch {
      setProfile(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function signIn(email: string, password: string) {
    const client = getClient()
    const { data, error } = await client.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null, user: data.user ?? null }
  }

  async function signUp(
    email: string,
    password: string,
    name: string,
    role: "member" | "admin" = "member",
  ) {
    const client = getClient()
    const { error } = await client.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    })

    return { error: error?.message ?? null }
  }

  async function signOut() {
    if (isSigningOut) return

    setIsSigningOut(true)
    const client = getClient()
    try {
      const { error } = await withTimeout(
        client.auth.signOut(),
        SIGN_OUT_TIMEOUT_MS,
        "Sign-out request timed out.",
      )
      if (error) throw error
    } catch {
      // Fallback: clear local session state even if remote signout fails.
      await withTimeout(
        client.auth.signOut({ scope: "local" }),
        SIGN_OUT_TIMEOUT_MS,
        "Local sign-out timed out.",
      )
    } finally {
      setUser(null)
      setProfile(null)
      setIsLoading(false)
      setIsSigningOut(false)
      router.replace("/login")
      router.refresh()
      window.setTimeout(() => {
        if (window.location.pathname !== "/login") {
          window.location.assign("/login")
        }
      }, NAVIGATION_FAILSAFE_MS)
    }
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.id, getClient())
  }

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, isSigningOut, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
