"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { type CheckInResult } from "@/lib/engagement-hooks"
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
    // Use the kiosk_checked_in RPC to bypass RLS — kiosk has no auth session
    const { data, error } = await supabase.rpc("kiosk_get_checked_in")
    if (data && !error) {
      setCheckedIn(
        (data as { attendance_id: string; member_id: string; member_name: string; check_in: string }[]).map((d) => ({
          attendanceId: d.attendance_id,
          memberId: d.member_id,
          memberName: d.member_name,
          checkIn: d.check_in,
        }))
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
          } catch (err) {
            // handleQrScan throws on DB/scan failures — show error and reset
            toast.error("Check-in failed. Please try again.")
            console.error("[Kiosk] scan error:", err)
            setScanResult(null)
          } finally {
            // Always reset after 3s cooldown — prevents duplicate scans
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

    // Resolve the QR code to a raw value the RPC can use.
    // Format may be: stren://checkin/{gym_id}/{member_id}  (old — extract member QR code)
    // OR the qr_code column value directly (new format, UUID string)
    let rawQr = qrCode
    const match = qrCode.match(/^stren:\/\/checkin\/([^/]+)\/([^/]+)$/)
    if (match) {
      // Old deep-link format — reconstruct the stored qr_code value
      rawQr = qrCode // the RPC looks up by qr_code column; old rows stored this full string
    }

    const { data, error } = await supabase.rpc("kiosk_checkin", { p_qr_code: rawQr })

    if (error) {
      console.error("[Kiosk] RPC error:", error)
      throw new Error(error.message)
    }

    if (data && "error" in data) {
      // Business-logic errors returned as typed union variant
      if (data.error === "unknown_qr") {
        toast.error("Unknown QR code.")
      } else if (data.error === "rejected") {
        toast.error(`Cannot check in — ${data.member_name}'s account has been rejected.`)
      } else {
        toast.error(data.message ?? "Check-in failed.")
      }
      return
    }

    const result = data as {
      action: "checked_in" | "checked_out"
      attendance_id: string
      member_id: string
      member_name: string
      member_status: string
      duration_min?: number
    }

    // Build a CheckInResult-compatible object for the banner
    const checkInResult: CheckInResult & { memberName: string } = {
      status: result.action === "checked_in" ? "checked_in" : "checked_out",
      attendanceId: result.attendance_id,
      memberName: result.member_name,
      streak: null,   // streak data lives server-side now; fetch separately if needed
      durationMin: result.duration_min ?? null,
    }

    setScanResult(checkInResult)

    if (result.action === "checked_in") {
      toast.success(`${result.member_name} checked in!`)
    } else {
      toast.success(`${result.member_name} checked out! (${result.duration_min} min)`)
    }

    loadCheckedIn()
    setTimeout(() => setScanResult(null), 5000)
  }

  async function handleManualCheckIn(memberId: string, memberName: string) {
    const supabase = createClient()
    try {
      const { data, error } = await supabase.rpc("kiosk_checkin_by_member", { p_member_id: memberId })
      if (error) throw error
      if (data && "error" in data) { toast.error(data.message ?? "Check-in failed."); return }

      const result = data as { action: string; attendance_id: string; duration_min?: number }
      setScanResult({
        status: result.action === "checked_in" ? "checked_in" : "checked_out",
        attendanceId: result.attendance_id,
        memberName,
        streak: null,
        durationMin: result.duration_min ?? null,
      })

      if (result.action === "checked_in") {
        toast.success(`${memberName} checked in!`)
      } else {
        toast.success(`${memberName} checked out! (${result.duration_min} min)`)
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
    const supabase = createClient()
    // Find the open attendance row for this member
    const { data: openRow } = await supabase.rpc("kiosk_get_checked_in")
    const entry = (openRow as { attendance_id: string; member_id: string; member_name: string; check_in: string }[] | null)
      ?.find((r) => r.member_id === memberId)

    if (!entry) {
      toast.error("No open session found.")
      return
    }

    try {
      const { data, error } = await supabase.rpc("kiosk_checkout", { p_attendance_id: entry.attendance_id })
      if (error) throw error
      if (data && "error" in data) { toast.error("Session not found."); return }
      toast.success(`Checked out! (${data.duration_min} min)`)
      loadCheckedIn()
    } catch {
      toast.error("Check-out failed.")
    }
  }

  async function handleSearch() {
    const q = query.trim()
    if (!q) return
    const supabase = createClient()

    const { data, error } = await supabase.rpc("kiosk_search_members", { p_query: q })
    if (error) { toast.error("Search failed."); return }

    setResults(
      ((data ?? []) as {
        id: string; name: string; email: string; contact_number: string | null;
        membership_status: string | null; plan_name: string | null; end_date: string | null;
      }[]).map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        contactNumber: p.contact_number,
        membershipStatus: p.membership_status ?? "none",
        planName: p.plan_name ?? "No plan",
        endDate: p.end_date ?? "—",
      }))
    )
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
                          onClick={() => handleManualCheckIn(m.id, m.name)}
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