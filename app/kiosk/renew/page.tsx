"use client"

import React, { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { Search, RefreshCw, CheckCircle2, User } from "lucide-react"

interface PlanOption {
  id: string
  name: string
  price: number
  duration_days: number
}

interface MemberResult {
  profile_id: string
  name: string
  contact_number: string | null
  status: "active" | "expired" | "frozen"
  end_date: string
  plan_name: string
}

export default function RenewPage() {
  const supabase = createClient()
  const [plans, setPlans] = useState<PlanOption[]>([])
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<MemberResult[]>([])
  const [searched, setSearched] = useState(false)
  const [selectedMember, setSelectedMember] = useState<MemberResult | null>(null)
  const [planId, setPlanId] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "gcash">("cash")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadPlans() {
      const { data } = await supabase
        .from("membership_plans")
        .select("id, name, price, duration_days")
        .order("price")
      if (data && data.length > 0) {
        setPlans(data)
        setPlanId(data[0].id)
      }
    }
    loadPlans()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSearch() {
    const q = query.trim().toLowerCase()
    if (!q) return

    const { data } = await supabase
      .from("memberships")
      .select("member_id, status, end_date, profiles!memberships_member_id_fkey(name, contact_number), membership_plans!memberships_plan_id_fkey(name)")
      .order("created_at", { ascending: false })

    const matched = (data ?? [])
      .map((m) => ({
        profile_id: m.member_id,
        name: (m.profiles as unknown as { name: string })?.name ?? "Unknown",
        contact_number: (m.profiles as unknown as { contact_number: string | null })?.contact_number,
        status: m.status,
        end_date: m.end_date,
        plan_name: (m.membership_plans as unknown as { name: string })?.name ?? "Unknown",
      }))
      .filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.contact_number && m.contact_number.includes(q))
      )

    setResults(matched)
    setSearched(true)
  }

  async function handleRenew() {
    if (!selectedMember) return
    const plan = plans.find((p) => p.id === planId)
    if (!plan) return

    setLoading(true)

    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + plan.duration_days)

    // Create new membership record
    const { error } = await supabase.from("memberships").insert({
      member_id: selectedMember.profile_id,
      plan_id: planId,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      status: "active",
      payment_method: paymentMethod,
      amount_paid: plan.price,
    })

    if (error) {
      toast.error("Failed to renew: " + error.message)
      setLoading(false)
      return
    }

    // Update old memberships to expired (if any active ones exist)
    await supabase
      .from("memberships")
      .update({ status: "expired" })
      .eq("member_id", selectedMember.profile_id)
      .eq("status", "active")
      .neq("start_date", startDate.toISOString().split("T")[0])

    toast.success(selectedMember.name + " renewed successfully!")
    setSuccess(true)
    setLoading(false)
  }

  function handleReset() {
    setQuery("")
    setResults([])
    setSearched(false)
    setSelectedMember(null)
    setPlanId(plans[0]?.id ?? "")
    setPaymentMethod("cash")
    setSuccess(false)
  }

  const statusColor = (s: string) => {
    if (s === "active")
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    if (s === "expired")
      return "bg-red-500/20 text-red-400 border-red-500/30"
    return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
  }

  if (success && selectedMember) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="font-display text-2xl font-bold text-primary-foreground">
            {selectedMember.name} is renewed!
          </h2>
          <p className="text-muted-foreground">
            Membership is now active again.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-muted-foreground/30 bg-transparent text-primary-foreground hover:bg-muted-foreground/10"
            >
              Renew Another
            </Button>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <a href="/kiosk">Go to Check-In</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (selectedMember) {
    return (
      <div className="flex flex-1 flex-col items-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
              <RefreshCw className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold text-primary-foreground">
              Renew Membership
            </h1>
          </div>

          <div className="mb-6 rounded-lg border border-muted-foreground/20 bg-muted-foreground/5 p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span className="font-medium text-primary-foreground">
                {selectedMember.name}
              </span>
              <Badge
                variant="outline"
                className={statusColor(selectedMember.status)}
              >
                {selectedMember.status}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {selectedMember.contact_number ?? "N/A"} | Previous plan: {selectedMember.plan_name} |
              Expired: {selectedMember.end_date}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-primary-foreground">
                New Membership Plan
              </Label>
              <RadioGroup
                value={planId}
                onValueChange={(v) => setPlanId(v)}
                className="grid grid-cols-3 gap-3"
              >
                {plans.map((p) => (
                  <label
                    key={p.id}
                    className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border p-4 text-center transition-colors ${
                      planId === p.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40"
                    }`}
                  >
                    <RadioGroupItem value={p.id} className="sr-only" />
                    <span className="text-sm font-medium">{p.name}</span>
                    <span className="text-lg font-bold">
                      {"P" + p.price.toLocaleString()}
                    </span>
                    <span className="text-xs">
                      {p.duration_days === 1
                        ? "1 day"
                        : p.duration_days + " days"}
                    </span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-primary-foreground">Payment Method</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as "cash" | "gcash")}
                className="grid grid-cols-2 gap-3"
              >
                <label
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-3 transition-colors ${
                    paymentMethod === "cash"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40"
                  }`}
                >
                  <RadioGroupItem value="cash" className="sr-only" />
                  <span className="text-sm font-medium">Cash</span>
                </label>
                <label
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-3 transition-colors ${
                    paymentMethod === "gcash"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40"
                  }`}
                >
                  <RadioGroupItem value="gcash" className="sr-only" />
                  <span className="text-sm font-medium">GCash</span>
                </label>
              </RadioGroup>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedMember(null)}
                className="flex-1 border-muted-foreground/30 bg-transparent text-primary-foreground hover:bg-muted-foreground/10"
              >
                Back
              </Button>
              <Button
                onClick={handleRenew}
                disabled={loading}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
              >
                {loading ? "Renewing..." : "Renew & Record Payment"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
          <RefreshCw className="h-6 w-6 text-primary" />
        </div>
        <h1 className="mb-2 font-display text-3xl font-bold text-primary-foreground">
          Renew Membership
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Search for the member to renew
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSearch()
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name or contact number"
              className="border-muted-foreground/30 bg-muted-foreground/10 pl-10 text-primary-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Search
          </Button>
        </form>

        {searched && (
          <div className="mt-4 space-y-2 text-left">
            {results.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                No members found.
              </p>
            ) : (
              results.map((m) => (
                <button
                  type="button"
                  key={m.profile_id}
                  onClick={() => setSelectedMember(m)}
                  className="flex w-full items-center justify-between rounded-lg border border-muted-foreground/20 bg-muted-foreground/5 p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="font-medium text-primary-foreground">
                        {m.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={statusColor(m.status)}
                      >
                        {m.status}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {m.contact_number ?? "N/A"} | Exp: {m.end_date}
                    </p>
                  </div>
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
