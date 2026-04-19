"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { withTimeout } from "@/lib/async-guard"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/lib/types"

const SIGN_OUT_TIMEOUT_MS = 10000
const NAVIGATION_FAILSAFE_MS = 2000
const PROFILE_FETCH_TIMEOUT_MS = 7000
const PROFILE_HYDRATION_DEDUPE_MS = 2500
const LOGIN_ORIGIN_STORAGE_KEY = "stren.auth.loginOriginPath"

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isSigningOut: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null; user: User | null; profile: Profile | null }>
  signUp: (email: string, password: string, name: string, role?: "member" | "admin") => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const FALLBACK_AUTH_CONTEXT: AuthContextValue = {
  user: null,
  profile: null,
  isLoading: false,
  isSigningOut: false,
  signIn: async () => ({ error: "Authentication unavailable.", user: null, profile: null }),
  signUp: async () => ({ error: "Authentication unavailable." }),
  signOut: async () => {},
  refreshProfile: async () => {},
}

function getStoredLoginOriginPath(): string | null {
  if (typeof window === "undefined") return null

  let candidate: string | null = null
  try {
    candidate = window.localStorage.getItem(LOGIN_ORIGIN_STORAGE_KEY)
  } catch {
    return null
  }

  if (!candidate) return null

  if (candidate === "/login") return candidate
  if (/^\/gym\/[^/]+\/login$/.test(candidate)) return candidate

  return null
}

function resolveLoginOriginPath(pathname?: string | null): string {
  const storedPath = getStoredLoginOriginPath()
  if (storedPath) return storedPath

  if (pathname?.startsWith("/member")) return "/gym-select"

  return "/login"
}

async function getMemberSignOutRedirectPath(
  client: ReturnType<typeof createClient>,
  gymId: string | null | undefined,
): Promise<string> {
  if (!gymId) return "/gym-select"

  const { data } = await client
    .from("gyms")
    .select("code")
    .eq("id", gymId)
    .maybeSingle()

  const gymCode = data?.code
  if (!gymCode) return "/gym-select"

  return `/gym/${encodeURIComponent(gymCode)}/login`
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

function isBenignLockAbortError(error: unknown): boolean {
  if (!error) return false

  const message = typeof error === "string"
    ? error
    : error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message?: unknown }).message ?? "")
        : ""

  const normalized = message.toLowerCase()
  return (
    normalized.includes("lock broken by another request") &&
    normalized.includes("steal")
  )
}

async function retryOnBenignLock<T>(operation: () => Promise<T>, retries = 1): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (!isBenignLockAbortError(error) || attempt === retries) {
        throw error
      }
      await new Promise((resolve) => window.setTimeout(resolve, 180))
    }
  }

  throw lastError ?? new Error("Unknown lock error")
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const isRecoveringAuthRef = useRef(false)
  const recentProfileHydrationRef = useRef<{ userId: string; at: number } | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  const shouldSkipAuthBootstrap = useMemo(() => {
    if (!pathname) return false

    if (pathname === "/") return true

    return (
      pathname.startsWith("/landing") ||
      pathname.startsWith("/gym") ||
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
      router.replace(resolveLoginOriginPath(pathname))
      router.refresh()
    }
  }, [pathname, router, supabase])

  useEffect(() => {
    if (shouldSkipAuthBootstrap || !supabase) {
      // Keep any existing auth/profile state when navigating through public routes
      // (e.g. /gym previews) to avoid teardown/re-hydration races when returning to /admin.
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
        const recentHydration = recentProfileHydrationRef.current
        const now = Date.now()
        if (
          recentHydration &&
          recentHydration.userId === currentUser.id &&
          now - recentHydration.at < PROFILE_HYDRATION_DEDUPE_MS
        ) {
          setIsLoading(false)
          return
        }

        await fetchProfile(currentUser.id, supabase)
      } else {
        setProfile(null)
        setIsLoading(false)
      }
    })

    const bootstrapUser = async () => {
      try {
        const { data, error } = await retryOnBenignLock(() => supabase.auth.getUser(), 1)

        if (!isActive || hasResolved) return

        if (error) {
          if (isInvalidRefreshTokenError(error)) {
            await recoverFromInvalidRefreshToken(supabase)
            return
          }

          setUser(null)
          setProfile(null)
          setIsLoading(false)
          return
        }

        hasResolved = true
        const currentUser = data.user ?? null
        setUser(currentUser)

        if (currentUser) {
          await fetchProfile(currentUser.id, supabase)
        } else {
          setProfile(null)
          setIsLoading(false)
        }
      } catch {
        if (!isActive || hasResolved) return
        setUser(null)
        setProfile(null)
        setIsLoading(false)
      }
    }

    void bootstrapUser()

    return () => {
      isActive = false
      clearTimeout(bootstrapTimeout)
      subscription.unsubscribe()
    }
  }, [shouldSkipAuthBootstrap, supabase])

  useEffect(() => {
    if (shouldSkipAuthBootstrap || !supabase) return

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isBenignLockAbortError(event.reason)) {
        // Supabase may steal a lock across tabs during auth refresh; this abort is expected.
        event.preventDefault()
        return
      }

      if (!isInvalidRefreshTokenError(event.reason)) return

      event.preventDefault()
      void recoverFromInvalidRefreshToken(supabase)
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection)
    return () => window.removeEventListener("unhandledrejection", handleUnhandledRejection)
  }, [recoverFromInvalidRefreshToken, shouldSkipAuthBootstrap, supabase])

  async function fetchProfile(userId: string, client = getClient()): Promise<Profile | null> {
    let built: Profile | null = null
    try {
      const { data, error } = await retryOnBenignLock(
        () => withTimeout(
          client
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle(),
          PROFILE_FETCH_TIMEOUT_MS,
          "Profile lookup timed out.",
        ),
        2,
      )

      if (error) {
        if (isInvalidRefreshTokenError(error)) {
          await recoverFromInvalidRefreshToken(client)
          return null
        }

        setProfile(null)
        return null
      }

      if (data) {
        recentProfileHydrationRef.current = { userId, at: Date.now() }
        built = {
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
        }
        setProfile(built)
      } else {
        setProfile(null)
      }
    } catch {
      setProfile(null)
    } finally {
      setIsLoading(false)
    }
    return built
  }

  async function signIn(email: string, password: string) {
    const client = getClient()
    const { data, error } = await client.auth.signInWithPassword({ email, password })

    let fetchedProfile: Profile | null = null
    if (data.user) {
      setIsLoading(true)
      setUser(data.user)
      fetchedProfile = await fetchProfile(data.user.id, client)
    }

    return { error: error?.message ?? null, user: data.user ?? null, profile: fetchedProfile }
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
    const storedLoginOriginPath = getStoredLoginOriginPath()
    const targetLoginPath = storedLoginOriginPath
      ?? (profile?.role === "member"
        ? await getMemberSignOutRedirectPath(client, profile?.gymId)
        : "/login")
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
      router.replace(targetLoginPath)
      router.refresh()
      window.setTimeout(() => {
        if (window.location.pathname !== targetLoginPath) {
          window.location.assign(targetLoginPath)
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
  return ctx ?? FALLBACK_AUTH_CONTEXT
}
