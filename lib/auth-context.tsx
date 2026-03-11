"use client"

import React, { createContext, useContext, useEffect, useState, useMemo } from "react"
import { createClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/lib/types"

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, name: string, role?: "member" | "admin") => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  demoSignIn: (role: "admin" | "member" | "owner") => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Stable client — not recreated on every render
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        fetchProfile(user.id)
      } else {
        setIsLoading(false)
      }
    })

    // Keep state in sync with Supabase session changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          await fetchProfile(currentUser.id)
        } else {
          setProfile(null)
          setIsLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (data) {
      setProfile({
        id: data.id,
        email: data.email,
        name: data.name,
        contactNumber: data.contact_number,
        role: data.role,
        status: data.status ?? "active",
        gymId: data.gym_id ?? null,
        avatarUrl: data.avatar_url,
        qrCode: data.qr_code,
        createdAt: data.created_at,
      })
    }
    setIsLoading(false)
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  async function signUp(
    email: string,
    password: string,
    name: string,
    role: "member" | "admin" = "member"
  ) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    })
    return { error: error?.message ?? null }
  }

  function demoSignIn(role: "admin" | "member" | "owner") {
    const demoId = `demo-${role}`
    const demoProfile: Profile = {
      id: demoId,
      email: `${role}@demo.stren`,
      name: role === "owner" ? "Demo Owner" : role === "admin" ? "Demo Admin" : "Demo Member",
      contactNumber: null,
      role,
      status: "active",
      gymId: "demo-gym",
      avatarUrl: null,
      qrCode: `stren://checkin/demo-gym/${demoId}`,
      createdAt: new Date().toISOString(),
    }
    document.cookie = `demo-role=${role}; path=/; max-age=86400; SameSite=Lax`
    setUser({ id: demoId } as User)
    setProfile(demoProfile)
    setIsLoading(false)
  }

  async function signOut() {
    // Clear demo cookie first so middleware doesn't see a stale role
    document.cookie = "demo-role=; path=/; max-age=0"
    // Clear local state immediately so UI reacts before the redirect
    setUser(null)
    setProfile(null)
    // Sign out from Supabase — clears the session cookie
    // onAuthStateChange will fire but state is already null so it's a no-op
    await supabase.auth.signOut()
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.id)
  }

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, signIn, signUp, signOut, demoSignIn, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}