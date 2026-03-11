"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { handleScan, type CheckInResult } from "@/lib/engagement-hooks"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { Html5Qrcode as Html5QrcodeType } from "html5-qrcode"
import {
  LogIn,
  LogOut,
  Search,
  User,
  Phone,
  Calendar,
  Clock,
  Camera,
  Flame,
  Award,
  Loader2,
  AlertCircle,
} from "lucide-react"

const SCANNER_ELEMENT_ID = "kiosk-qr-reader"

type KioskMode = "qr" | "search"

interface CheckedInEntry {
  attendanceId: string
  memberId: string
  memberName: string
  checkIn: string
}

export default function KioskPage() {
  const [mode, setMode] = useState<KioskMode>("qr")
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<
    {
      id: string
      name: string
      email: string
      contactNumber: string | null
      membershipStatus: string
      planName: string
      endDate: string
    }[]
  >([])
  const [searched, setSearched] = useState(false)
  const [checkedIn, setCheckedIn] = useState<CheckedInEntry[]>([])
  const [scanResult, setScanResult] = useState<(CheckInResult & { memberName: string }) | null>(null)
  const [scanStatus, setScanStatus] = useState<"initializing" | "scanning" | "processing" | "error">("initializing")
  const scannerRef = useRef<Html5QrcodeType | null>(null)
  const isProcessingRef = useRef(false)

  useEffect(() => {
    loadCheckedIn()
    const interval = setInterval(loadCheckedIn, 30000)
    return () => clearInterval(interval)
  }, [])

  async function loadCheckedIn() {
    const supabase = createClient()
    const { data } = await supabase
      .from("attendance")
      .select("id, member_id, check_in, profiles!attendance_member_id_fkey(name)")
      .is("check_out", null)
      .order("check_in", { ascending: false })

    if (data) {
      setCheckedIn(
        data.map((d) => {
          const p = d.profiles as unknown as { name: string } | null
          return {
            attendanceId: d.id,
            memberId: d.member_id,
            memberName: p?.name ?? "Unknown",
            checkIn: d.check_in,
          }
        })
      )
    }
  }

  const startScanner = useCallback(async () => {
    setScanStatus("initializing")
    console.log("[Kiosk] Initializing QR scanner...")

    // Clean up any existing scanner
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
      } catch { /* already stopped */ }
      scannerRef.current = null
    }

    try {
      const { Html5Qrcode } = await import("html5-qrcode")
      const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID, { verbose: false })
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 },
        async (decodedText) => {
          if (isProcessingRef.current) return
          isProcessingRef.current = true
          setScanStatus("processing")
          console.log("[Kiosk] QR scanned:", decodedText)

          try {
            await handleQrScan(decodedText)
          } finally {
            // 3-second cooldown to prevent duplicate scans
            setTimeout(() => {
              isProcessingRef.current = false
              setScanStatus("scanning")
            }, 3000)
          }
        },
        () => { /* ignore non-QR frames */ }
      )

      setScanStatus("scanning")
      console.log("[Kiosk] Scanner active — waiting for QR codes")
    } catch (err) {
      console.error("[Kiosk] Scanner failed to start:", err)
      setScanStatus("error")
      toast.error("Could not access camera. Use manual search instead.")
    }
  }, [])

  async function stopScanner() {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        console.log("[Kiosk] Scanner stopped")
      } catch { /* already stopped */ }
      scannerRef.current = null
    }
  }

  useEffect(() => {
    if (mode === "qr") {
      // Small delay so the container div is rendered before html5-qrcode attaches
      const timer = setTimeout(() => startScanner(), 100)
      return () => {
        clearTimeout(timer)
        stopScanner()
      }
    } else {
      stopScanner()
    }
    return () => { stopScanner() }
  }, [mode, startScanner])

  async function handleQrScan(qrCode: string) {
    console.log("[Kiosk] Processing QR:", qrCode)
    const supabase = createClient()

    let memberId: string | null = null

    // Format: stren://checkin/{gym_id}/{member_id}
    const match = qrCode.match(/^stren:\/\/checkin\/([^/]+)\/([^/]+)$/)
    if (match) {
      memberId = match[2]
    } else {
      // Fallback: look up by qr_code column value
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("qr_code", qrCode)
        .single()
      memberId = profile?.id ?? null
    }

    if (!memberId) {
      console.warn("[Kiosk] Unknown QR code:", qrCode)
      toast.error("Unknown QR code.")
      return
    }

    const { data: memberProfile } = await supabase
      .from("profiles")
      .select("id, name, status")
      .eq("id", memberId)
      .single()

    if (!memberProfile) {
      toast.error("Member not found.")
      return
    }

    // Allow pending + active — only block rejected
    if (memberProfile.status === "rejected") {
      toast.error("Cannot check in — account has been rejected.")
      return
    }

    try {
      const result = await handleScan(memberProfile.id)
      setScanResult({ ...result, memberName: memberProfile.name })

      if (result.status === "checked_in") {
        toast.success(`${memberProfile.name} checked in!`)
        if (result.streak && result.streak.currentStreak > 1) {
          toast(`🔥 ${result.streak.currentStreak}-day streak!`)
        }
        result.newBadges.forEach((b) => toast(`🏅 New badge: ${b.name}!`))
      } else {
        toast.success(`${memberProfile.name} checked out! (${result.durationMin} min)`)
      }

      loadCheckedIn()
      setTimeout(() => setScanResult(null), 5000)
    } catch (err) {
      toast.error("Check-in failed. Please try again.")
      console.error(err)
    }
  }

  async function handleManualCheckIn(memberId: string) {
    const supabase = createClient()
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", memberId)
      .single()

    try {
      const result = await handleScan(memberId)
      setScanResult({ ...result, memberName: profile?.name ?? "Member" })

      if (result.status === "checked_in") {
        toast.success(`${profile?.name} checked in!`)
      } else {
        toast.success(`${profile?.name} checked out! (${result.durationMin} min)`)
      }

      loadCheckedIn()
      setQuery("")
      setResults([])
      setSearched(false)
      setTimeout(() => setScanResult(null), 5000)
    } catch {
      toast.error("Check-in failed.")
    }
  }

  async function handleManualCheckOut(memberId: string) {
    try {
      const result = await handleScan(memberId)
      toast.success(`Checked out! (${result.durationMin} min)`)
      loadCheckedIn()
    } catch {
      toast.error("Check-out failed.")
    }
  }

  async function handleSearch() {
    const q = query.trim()
    if (!q) return
    const supabase = createClient()

    // Left-join memberships so members with no plan still appear
    const { data } = await supabase
      .from("profiles")
      .select("id, name, email, contact_number, memberships(status, end_date, membership_plans(name))")
      .or(`name.ilike.%${q}%,contact_number.ilike.%${q}%`)
      .eq("role", "member")
      .order("name")
      .limit(10)

    if (data) {
      setResults(
        data.map((p) => {
          const memberships = p.memberships as unknown as {
            status: string
            end_date: string
            membership_plans: { name: string } | null
          }[] | null
          // Pick the most recent active membership, or just the first one
          const active = memberships?.find((m) => m.status === "active")
          const latest = active ?? memberships?.[0]
          return {
            id: p.id,
            name: p.name,
            email: p.email,
            contactNumber: p.contact_number,
            membershipStatus: latest?.status ?? "none",
            planName: latest?.membership_plans?.name ?? "No plan",
            endDate: latest?.end_date ?? "—",
          }
        })
      )
    }
    setSearched(true)
  }

  const isCurrentlyCheckedIn = (memberId: string) =>
    checkedIn.some((c) => c.memberId === memberId)

  const membershipBadgeClass = (status: string) => {
    if (status === "active") return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    if (status === "none" || status === "pending") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    return "bg-red-500/20 text-red-400 border-red-500/30"
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-10 px-6 py-12">

      {/* Scan result banner */}
      {scanResult && (
        <div
          className="w-full max-w-lg rounded-xl p-5 text-center animate-in fade-in slide-in-from-top-2"
          style={{
            background:
              scanResult.status === "checked_in"
                ? "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)"
                : "linear-gradient(135deg, #4A5568 0%, #2D3748 100%)",
            color: "white",
          }}
        >
          <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            {scanResult.status === "checked_in" ? "Welcome!" : "See you next time!"}
          </p>
          <p className="text-lg opacity-90 mt-1">{scanResult.memberName}</p>
          {scanResult.streak && scanResult.streak.currentStreak > 1 && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <Flame size={20} />
              <span className="font-semibold">{scanResult.streak.currentStreak}-day streak</span>
              {scanResult.streak.isNewBest && (
                <span className="text-sm opacity-80">(New record!)</span>
              )}
            </div>
          )}
          {scanResult.newBadges.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <Award size={20} />
              {scanResult.newBadges.map((b) => (
                <span key={b.id} className="text-sm">
                  {b.icon} {b.name}
                </span>
              ))}
            </div>
          )}
          {scanResult.durationMin != null && (
            <p className="mt-2 text-sm opacity-80">Session: {scanResult.durationMin} min</p>
          )}
        </div>
      )}

      {/* Mode toggle */}
      <div
        className="flex items-center gap-2 p-1 rounded-full"
        style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
      >
        {(["qr", "search"] as KioskMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: mode === m ? "var(--color-primary)" : "transparent",
              color: mode === m ? "white" : "rgba(255,255,255,0.7)",
            }}
          >
            {m === "qr" ? <Camera size={16} /> : <Search size={16} />}
            {m === "qr" ? "QR Scan" : "Search"}
          </button>
        ))}
      </div>

      {/* QR Scanner */}
      {mode === "qr" && (
        <div className="w-full max-w-lg text-center">
          <h1 className="mb-2 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            Scan QR Code
          </h1>
          <p className="mb-6 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
            Hold your QR code up to the camera
          </p>
          <div
            className="relative max-w-sm mx-auto rounded-2xl overflow-hidden border-2"
            style={{ borderColor: "var(--color-primary)" }}
          >
            <div id={SCANNER_ELEMENT_ID} className="w-full" />
          </div>
          {/* Scan status indicator */}
          <div className="mt-4 flex items-center justify-center gap-2 text-sm">
            {scanStatus === "initializing" && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" style={{ color: "var(--color-primary)" }} />
                <span style={{ color: "rgba(255,255,255,0.6)" }}>Initializing camera...</span>
              </>
            )}
            {scanStatus === "scanning" && (
              <>
                <Camera className="h-4 w-4" style={{ color: "var(--color-primary)" }} />
                <span style={{ color: "rgba(255,255,255,0.6)" }}>Scanning... point camera at QR code</span>
              </>
            )}
            {scanStatus === "processing" && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" style={{ color: "#48bb78" }} />
                <span style={{ color: "#48bb78" }}>QR detected! Processing...</span>
              </>
            )}
            {scanStatus === "error" && (
              <>
                <AlertCircle className="h-4 w-4" style={{ color: "#fc8181" }} />
                <span style={{ color: "#fc8181" }}>Camera unavailable</span>
                <Button onClick={startScanner} size="sm" variant="outline" className="ml-2">
                  Retry
                </Button>
              </>
            )}
          </div>
          <p className="mt-3 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            No QR code?{" "}
            <button
              onClick={() => setMode("search")}
              className="underline"
              style={{ color: "var(--color-primary)" }}
            >
              Manual Search
            </button>
          </p>
        </div>
      )}

      {/* Search */}
      {mode === "search" && (
        <div className="w-full max-w-lg">
          <h1
            className="mb-2 text-3xl font-bold text-center"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Member Check-In / Out
          </h1>
          <p className="mb-6 text-sm text-center" style={{ color: "rgba(255,255,255,0.6)" }}>
            Search by name or contact number
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); handleSearch() }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                style={{ color: "rgba(255,255,255,0.4)" }}
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Marco or 09171234567"
                className="pl-10"
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderColor: "rgba(255,255,255,0.2)",
                  color: "white",
                }}
              />
            </div>
            <Button type="submit" style={{ backgroundColor: "var(--color-primary)", color: "white" }}>
              Search
            </Button>
          </form>

          {searched && (
            <div className="mt-4 space-y-2">
              {results.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: "rgba(255,255,255,0.5)" }}>
                  No members found.
                </p>
              ) : (
                results.map((m) => {
                  const inGym = isCurrentlyCheckedIn(m.id)
                  const canCheckIn = m.membershipStatus === "active" || m.membershipStatus === "none" || m.membershipStatus === "pending"
                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between rounded-lg p-4"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" style={{ color: "var(--color-primary)" }} />
                          <span className="font-medium">{m.name}</span>
                          <Badge variant="outline" className={membershipBadgeClass(m.membershipStatus)}>
                            {m.membershipStatus}
                          </Badge>
                        </div>
                        <div
                          className="flex items-center gap-4 text-xs"
                          style={{ color: "rgba(255,255,255,0.5)" }}
                        >
                          {m.contactNumber && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {m.contactNumber}
                            </span>
                          )}
                          {m.planName !== "No plan" && <span>{m.planName}</span>}
                          {m.endDate !== "—" && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Exp: {m.endDate}
                            </span>
                          )}
                        </div>
                      </div>
                      {inGym ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManualCheckOut(m.id)}
                          className="gap-1.5 border-red-500/40 bg-transparent text-red-400 hover:bg-red-500/20 hover:text-red-300"
                        >
                          <LogOut className="h-4 w-4" />
                          Check Out
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleManualCheckIn(m.id)}
                          className="gap-1.5"
                          style={{ backgroundColor: "var(--color-primary)", color: "white" }}
                        >
                          <LogIn className="h-4 w-4" />
                          Check In
                        </Button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* Currently in gym */}
      <div className="w-full max-w-2xl">
        <h2
          className="mb-4 flex items-center gap-2 text-xl font-semibold"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <Clock className="h-5 w-5" style={{ color: "var(--color-primary)" }} />
          Currently in the Gym
          <Badge
            variant="outline"
            className="ml-1"
            style={{ borderColor: "rgba(212,149,106,0.4)", color: "var(--color-primary)" }}
          >
            {checkedIn.length}
          </Badge>
        </h2>
        {checkedIn.length === 0 ? (
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            No one is currently checked in.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {checkedIn.map((c) => (
              <div
                key={c.attendanceId}
                className="flex items-center justify-between rounded-lg p-3"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div>
                  <p className="font-medium">{c.memberName}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Since{" "}
                    {new Date(c.checkIn).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleManualCheckOut(c.memberId)}
                  className="gap-1.5 border-red-500/40 bg-transparent text-red-400 hover:bg-red-500/20 hover:text-red-300"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Out
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}