"use client"

import React, { useState, useMemo, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Search, Snowflake, Play, AlertTriangle } from "lucide-react"

interface MemberRow {
  profile_id: string
  name: string
  email: string
  contact_number: string | null
  membership_id: string | null
  plan_name: string | null
  start_date: string | null
  end_date: string | null
  membership_status: "active" | "expired" | "frozen" | null
  created_at: string
}

interface PaymentRow {
  id: string
  amount_paid: number
  payment_method: "cash" | "gcash"
  created_at: string
  plan_name: string
}

interface PlanOption {
  id: string
  name: string
  price: number
  duration_days: number
}

export default function MembersPage() {
  const supabase = createClient()
  const [members, setMembers] = useState<MemberRow[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [selectedPayments, setSelectedPayments] = useState<PaymentRow[]>([])
  const [renewOpen, setRenewOpen] = useState(false)
  const [renewMember, setRenewMember] = useState<MemberRow | null>(null)
  const [renewPlans, setRenewPlans] = useState<PlanOption[]>([])
  const [renewPlanId, setRenewPlanId] = useState("")
  const [renewPaymentMethod, setRenewPaymentMethod] = useState<"cash" | "gcash">("cash")
  const [renewLoading, setRenewLoading] = useState(false)

  const fetchMembers = useCallback(async () => {
    // Query profiles as the primary source — RLS filters by gym_id automatically
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, name, email, contact_number, created_at")
      .eq("role", "member")
      .eq("status", "active")
      .order("name")

    // Query memberships separately — RLS filters by gym_id automatically
    const { data: membershipsData } = await supabase
      .from("memberships")
      .select(
        "id, member_id, start_date, end_date, status, amount_paid, payment_method, created_at, membership_plans!memberships_plan_id_fkey(name)"
      )
      .order("created_at", { ascending: false })

    // Build a map of member_id → latest membership
    const membershipMap = new Map<string, (typeof membershipsData extends (infer T)[] | null ? T : never)>()
    for (const m of membershipsData ?? []) {
      // Keep only the latest (first due to ordering) membership per member
      if (!membershipMap.has(m.member_id)) {
        membershipMap.set(m.member_id, m)
      }
    }

    setMembers(
      (profilesData ?? []).map((p) => {
        const m = membershipMap.get(p.id)
        return {
          profile_id: p.id,
          name: p.name,
          email: p.email,
          contact_number: p.contact_number,
          membership_id: m?.id ?? null,
          plan_name: m
            ? ((m.membership_plans as unknown as { name: string })?.name ?? "Unknown")
            : null,
          start_date: m?.start_date ?? null,
          end_date: m?.end_date ?? null,
          membership_status: m?.status ?? null,
          created_at: p.created_at,
        }
      })
    )
  }, [supabase])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  async function fetchPayments(memberId: string) {
    const { data } = await supabase
      .from("memberships")
      .select("id, amount_paid, payment_method, created_at, membership_plans!memberships_plan_id_fkey(name)")
      .eq("member_id", memberId)
      .order("created_at", { ascending: false })

    setSelectedPayments(
      (data ?? []).map((p) => ({
        id: p.id,
        amount_paid: p.amount_paid,
        payment_method: p.payment_method,
        created_at: p.created_at,
        plan_name: (p.membership_plans as unknown as { name: string })?.name ?? "Unknown",
      }))
    )
  }

  const filtered = useMemo(() => {
    let list = [...members]
    if (statusFilter === "no_plan") {
      list = list.filter((m) => m.membership_status === null)
    } else if (statusFilter !== "all") {
      list = list.filter((m) => m.membership_status === statusFilter)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          (m.contact_number && m.contact_number.includes(q))
      )
    }
    return list.sort((a, b) => a.name.localeCompare(b.name))
  }, [members, statusFilter, search])

  const selectedMember = members.find((m) => m.profile_id === selectedMemberId)

  const statusColor = (s: string | null) => {
    if (s === "active")
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    if (s === "expired")
      return "bg-red-500/20 text-red-400 border-red-500/30"
    if (s === "frozen")
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    return "bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30"
  }

  async function handleStatusChange(membershipId: string, status: "active" | "frozen") {
    const { error } = await supabase
      .from("memberships")
      .update({ status })
      .eq("id", membershipId)
    if (error) {
      toast.error("Failed to update status")
      return
    }
    toast.success(status === "frozen" ? "Membership frozen." : "Membership activated.")
    fetchMembers()
  }

  async function loadRenewPlans() {
    const { data, error } = await supabase
      .from("membership_plans")
      .select("id, name, price, duration_days")
      .order("price")

    if (error) {
      toast.error("Failed to load membership plans")
      return
    }

    setRenewPlans(data ?? [])
    setRenewPlanId(data?.[0]?.id ?? "")
  }

  async function openRenewDialog(member: MemberRow) {
    setRenewMember(member)
    setRenewPaymentMethod("cash")
    setRenewPlans([])
    setRenewPlanId("")
    setRenewOpen(true)
    await loadRenewPlans()
  }

  async function handleRenewMembership() {
    if (!renewMember) return
    const plan = renewPlans.find((p) => p.id === renewPlanId)
    if (!plan) {
      toast.error("Please select a membership plan")
      return
    }

    setRenewLoading(true)

    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + plan.duration_days)
    const startDateValue = startDate.toISOString().split("T")[0]

    const { error: insertError } = await supabase.from("memberships").insert({
      member_id: renewMember.profile_id,
      plan_id: plan.id,
      start_date: startDateValue,
      end_date: endDate.toISOString().split("T")[0],
      status: "active",
      payment_method: renewPaymentMethod,
      amount_paid: plan.price,
    })

    if (insertError) {
      toast.error("Failed to renew: " + insertError.message)
      setRenewLoading(false)
      return
    }

    await supabase
      .from("memberships")
      .update({ status: "expired" })
      .eq("member_id", renewMember.profile_id)
      .eq("status", "active")
      .neq("start_date", startDateValue)

    toast.success(renewMember.name + " renewed successfully!")
    setRenewLoading(false)
    setRenewOpen(false)
    setRenewMember(null)
    setRenewPlans([])
    setRenewPlanId("")
    setRenewPaymentMethod("cash")
    fetchMembers()
  }

  const expiredMembers = members.filter((m) => m.membership_status === "expired")

  return (
    <div className="space-y-6">
      {/* Expired alert */}
      {expiredMembers.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-400">
              {expiredMembers.length} expired membership{expiredMembers.length > 1 ? "s" : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              {expiredMembers.map((m) => m.name).join(", ")}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStatusFilter("expired")}
            className="border-red-500/30 bg-transparent text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            View
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or contact..."
            className="border-muted-foreground/20 bg-muted-foreground/5 pl-10 text-primary-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 border-muted-foreground/20 bg-muted-foreground/5 text-primary-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-muted-foreground/20 bg-foreground text-primary-foreground">
            <SelectItem value="all">All Members</SelectItem>
            <SelectItem value="active">Active Plan</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="frozen">Frozen</SelectItem>
            <SelectItem value="no_plan">No Plan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-muted-foreground/10 bg-muted-foreground/5 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-muted-foreground/10 hover:bg-transparent">
              <TableHead className="text-muted-foreground">Name</TableHead>
              <TableHead className="text-muted-foreground">Contact</TableHead>
              <TableHead className="text-muted-foreground">Plan</TableHead>
              <TableHead className="text-muted-foreground">Start</TableHead>
              <TableHead className="text-muted-foreground">End</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-right text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-muted-foreground"
                >
                  No members found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((m) => {
                return (
                  <TableRow
                    key={m.profile_id}
                    className="border-muted-foreground/10 hover:bg-muted-foreground/5"
                  >
                    <TableCell className="font-medium text-primary-foreground">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMemberId(m.profile_id)
                              fetchPayments(m.profile_id)
                            }}
                            className="text-left hover:text-primary hover:underline"
                          >
                            {m.name}
                          </button>
                        </DialogTrigger>
                        <DialogContent className="border-muted-foreground/20 bg-foreground text-primary-foreground sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-primary-foreground">
                              {selectedMember?.name}
                            </DialogTitle>
                          </DialogHeader>
                          {selectedMember && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Email
                                  </p>
                                  <p>{selectedMember.email}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Contact
                                  </p>
                                  <p>{selectedMember.contact_number ?? "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Plan
                                  </p>
                                  <p>{selectedMember.plan_name ?? "No plan"}</p>
                                </div>
                                {selectedMember.membership_id && (
                                  <>
                                    <div>
                                      <p className="text-xs text-muted-foreground">
                                        Status
                                      </p>
                                      <Badge
                                        variant="outline"
                                        className={statusColor(
                                          selectedMember.membership_status
                                        )}
                                      >
                                        {selectedMember.membership_status}
                                      </Badge>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">
                                        Start
                                      </p>
                                      <p>{selectedMember.start_date}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">
                                        End
                                      </p>
                                      <p>{selectedMember.end_date}</p>
                                    </div>
                                  </>
                                )}
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Member Since
                                  </p>
                                  <p>{selectedMember.created_at.split("T")[0]}</p>
                                </div>
                              </div>
                              <div>
                                <p className="mb-2 text-xs font-medium text-muted-foreground">
                                  Payment History
                                </p>
                                {selectedPayments.length === 0 ? (
                                  <p className="text-xs text-muted-foreground">
                                    No payments recorded.
                                  </p>
                                ) : (
                                  <div className="max-h-40 space-y-1 overflow-y-auto">
                                    {selectedPayments.map((p) => (
                                      <div
                                        key={p.id}
                                        className="flex items-center justify-between rounded border border-muted-foreground/10 px-3 py-1.5 text-xs"
                                      >
                                        <span>{p.plan_name}</span>
                                        <span className="flex items-center gap-2">
                                          <Badge
                                            variant="outline"
                                            className="border-muted-foreground/20 text-muted-foreground text-[10px]"
                                          >
                                            {p.payment_method}
                                          </Badge>
                                          <span className="font-medium">
                                            {"\u20B1" + p.amount_paid.toLocaleString()}
                                          </span>
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {m.contact_number ?? "N/A"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {m.plan_name ?? <span className="italic">No plan</span>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {m.start_date ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {m.end_date ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusColor(m.membership_status)}
                      >
                        {m.membership_status ?? "no plan"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openRenewDialog(m)}
                          className="h-7 gap-1 px-2 text-xs text-primary hover:bg-primary/10 hover:text-primary"
                        >
                          Renew
                        </Button>
                        {m.membership_id && m.membership_status === "active" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(m.membership_id!, "frozen")}
                            className="h-7 gap-1 px-2 text-xs text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300"
                          >
                            <Snowflake className="h-3 w-3" />
                            Freeze
                          </Button>
                        )}
                        {m.membership_id && (m.membership_status === "frozen" || m.membership_status === "expired") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(m.membership_id!, "active")}
                            className="h-7 gap-1 px-2 text-xs text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                          >
                            <Play className="h-3 w-3" />
                            Activate
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={renewOpen}
        onOpenChange={(open) => {
          setRenewOpen(open)
          if (!open) {
            setRenewLoading(false)
            setRenewMember(null)
          }
        }}
      >
        <DialogContent className="border-muted-foreground/20 bg-foreground text-primary-foreground sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-primary-foreground">Renew Membership</DialogTitle>
          </DialogHeader>

          {renewMember && (
            <div className="space-y-5">
              <div className="rounded-lg border border-muted-foreground/20 bg-muted-foreground/5 p-4">
                <p className="text-sm font-medium text-primary-foreground">{renewMember.name}</p>
                <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Current Plan</p>
                    <p className="text-primary-foreground">{renewMember.plan_name ?? "No plan"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Expiry</p>
                    <p className="text-primary-foreground">{renewMember.end_date ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge variant="outline" className={statusColor(renewMember.membership_status)}>
                      {renewMember.membership_status ?? "no plan"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-primary-foreground">Membership Plan</Label>
                <RadioGroup
                  value={renewPlanId}
                  onValueChange={setRenewPlanId}
                  className="grid grid-cols-1 gap-2"
                >
                  {renewPlans.map((plan) => (
                    <label
                      key={plan.id}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 text-sm transition-colors ${
                        renewPlanId === plan.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40"
                      }`}
                    >
                      <div>
                        <p className="font-medium">{plan.name}</p>
                        <p className="text-xs">{plan.duration_days} days</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{"\u20B1" + plan.price.toLocaleString()}</span>
                        <RadioGroupItem value={plan.id} id={`renew-plan-${plan.id}`} />
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className="text-primary-foreground">Payment Method</Label>
                <RadioGroup
                  value={renewPaymentMethod}
                  onValueChange={(value) => setRenewPaymentMethod(value as "cash" | "gcash")}
                  className="grid grid-cols-2 gap-2"
                >
                  <label
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-3 text-sm transition-colors ${
                      renewPaymentMethod === "cash"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40"
                    }`}
                  >
                    <RadioGroupItem value="cash" id="renew-payment-cash" />
                    Cash
                  </label>
                  <label
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-3 text-sm transition-colors ${
                      renewPaymentMethod === "gcash"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40"
                    }`}
                  >
                    <RadioGroupItem value="gcash" id="renew-payment-gcash" />
                    GCash
                  </label>
                </RadioGroup>
              </div>

              <Button
                onClick={handleRenewMembership}
                disabled={renewLoading || !renewPlanId || renewPlans.length === 0}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {renewLoading ? "Renewing..." : "Renew & Record Payment"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {members.length} members
      </p>
    </div>
  )
}
