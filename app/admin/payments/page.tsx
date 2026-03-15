"use client"

import React, { useState, useMemo, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { Search, Plus, DollarSign } from "lucide-react"

interface PaymentRow {
  id: string
  member_name: string
  member_id: string
  plan_name: string
  amount_paid: number
  payment_method: "cash" | "gcash"
  created_at: string
}

interface MemberOption {
  id: string
  name: string
}

interface PlanOption {
  id: string
  name: string
  price: number
  duration_days: number
}

export default function PaymentsPage() {
  const supabase = createClient()
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [memberOptions, setMemberOptions] = useState<MemberOption[]>([])
  const [planOptions, setPlanOptions] = useState<PlanOption[]>([])
  const [methodFilter, setMethodFilter] = useState<string>("all")
  const [search, setSearch] = useState("")

  // Manual payment form
  const [dialogOpen, setDialogOpen] = useState(false)
  const [payMemberId, setPayMemberId] = useState("")
  const [payPlanId, setPayPlanId] = useState("")
  const [payMethod, setPayMethod] = useState<"cash" | "gcash">("cash")

  const fetchData = useCallback(async () => {
    // Fetch memberships as payments
    const { data } = await supabase
      .from("memberships")
      .select("id, member_id, amount_paid, payment_method, created_at, profiles!memberships_member_id_fkey(name), membership_plans!memberships_plan_id_fkey(name)")
      .order("created_at", { ascending: false })

    setPayments(
      (data ?? []).map((p) => ({
        id: p.id,
        member_name: (p.profiles as unknown as { name: string })?.name ?? "Unknown",
        member_id: p.member_id ?? "",
        plan_name: (p.membership_plans as unknown as { name: string })?.name ?? "Unknown",
        amount_paid: p.amount_paid,
        payment_method: p.payment_method,
        created_at: p.created_at ?? new Date().toISOString(),
      }))
    )

    // Fetch member options for the dialog
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name")
      .order("name")
    setMemberOptions((profiles ?? []).map((p) => ({ id: p.id, name: p.name })))

    // Fetch plan options
    const { data: plans } = await supabase
      .from("membership_plans")
      .select("id, name, price, duration_days")
    setPlanOptions(plans ?? [])
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filtered = useMemo(() => {
    let list = payments
    if (methodFilter !== "all") {
      list = list.filter((p) => p.payment_method === methodFilter)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.member_name.toLowerCase().includes(q) ||
          p.plan_name.toLowerCase().includes(q)
      )
    }
    return list
  }, [payments, methodFilter, search])

  const totalFiltered = filtered.reduce((sum, p) => sum + p.amount_paid, 0)

  async function handleRecordPayment() {
    if (!payMemberId || !payPlanId) {
      toast.error("Please select a member and plan.")
      return
    }
    const plan = planOptions.find((p) => p.id === payPlanId)
    if (!plan) return

    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + plan.duration_days)

    const { error } = await supabase.from("memberships").insert({
      member_id: payMemberId,
      plan_id: payPlanId,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      status: "active",
      payment_method: payMethod,
      amount_paid: plan.price,
    })

    if (error) {
      toast.error("Failed to record payment: " + error.message)
      return
    }
    toast.success("Payment recorded!")
    setDialogOpen(false)
    setPayMemberId("")
    setPayPlanId("")
    setPayMethod("cash")
    fetchData()
  }

  return (
    <div className="space-y-6">
      {/* Filters + add */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by member or description..."
            className="border-muted-foreground/20 bg-muted-foreground/5 pl-10 text-primary-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger className="w-36 border-muted-foreground/20 bg-muted-foreground/5 text-primary-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-muted-foreground/20 bg-foreground text-primary-foreground">
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="gcash">GCash</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="border-muted-foreground/20 bg-foreground text-primary-foreground sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-primary-foreground">
                Record Manual Payment
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-primary-foreground">Member</Label>
                <Select value={payMemberId} onValueChange={setPayMemberId}>
                  <SelectTrigger className="border-muted-foreground/20 bg-muted-foreground/5 text-primary-foreground">
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent className="border-muted-foreground/20 bg-foreground text-primary-foreground max-h-48">
                    {memberOptions.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-primary-foreground">Plan</Label>
                <Select value={payPlanId} onValueChange={setPayPlanId}>
                  <SelectTrigger className="border-muted-foreground/20 bg-muted-foreground/5 text-primary-foreground">
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent className="border-muted-foreground/20 bg-foreground text-primary-foreground">
                    {planOptions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} - P{p.price.toLocaleString()} ({p.duration_days} days)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-primary-foreground">
                  Payment Method
                </Label>
                <RadioGroup
                  value={payMethod}
                  onValueChange={(v) => setPayMethod(v as "cash" | "gcash")}
                  className="grid grid-cols-2 gap-3"
                >
                  <label
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-3 transition-colors ${
                      payMethod === "cash"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40"
                    }`}
                  >
                    <RadioGroupItem value="cash" className="sr-only" />
                    <span className="text-sm font-medium">Cash</span>
                  </label>
                  <label
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-3 transition-colors ${
                      payMethod === "gcash"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40"
                    }`}
                  >
                    <RadioGroupItem value="gcash" className="sr-only" />
                    <span className="text-sm font-medium">GCash</span>
                  </label>
                </RadioGroup>
              </div>
              <Button
                onClick={handleRecordPayment}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Record Payment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-3 rounded-lg border border-muted-foreground/10 bg-muted-foreground/5 p-4">
        <DollarSign className="h-5 w-5 text-primary" />
        <div>
          <p className="text-xs text-muted-foreground">
            Filtered total ({filtered.length} payments)
          </p>
          <p className="text-lg font-bold text-primary-foreground">
            {"P" + totalFiltered.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-muted-foreground/10 bg-muted-foreground/5 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-muted-foreground/10 hover:bg-transparent">
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-muted-foreground">Member</TableHead>
              <TableHead className="text-muted-foreground">
                Description
              </TableHead>
              <TableHead className="text-muted-foreground">Method</TableHead>
              <TableHead className="text-right text-muted-foreground">
                Amount
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  No payments found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow
                  key={p.id}
                  className="border-muted-foreground/10 hover:bg-muted-foreground/5"
                >
                  <TableCell className="text-muted-foreground">
                    {p.created_at.split("T")[0]}
                  </TableCell>
                  <TableCell className="font-medium text-primary-foreground">
                    {p.member_name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.plan_name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        p.payment_method === "gcash"
                          ? "border-blue-500/30 text-blue-400"
                          : "border-emerald-500/30 text-emerald-400"
                      }
                    >
                      {p.payment_method}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-primary-foreground">
                    {"P" + p.amount_paid.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
