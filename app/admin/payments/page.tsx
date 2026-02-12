"use client"

import React, { useState, useMemo } from "react"
import { useGym } from "@/lib/gym-context"
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
import type { PaymentMethod } from "@/lib/types"
import { Search, Plus, DollarSign } from "lucide-react"

export default function PaymentsPage() {
  const { payments, members, recordPayment } = useGym()
  const [methodFilter, setMethodFilter] = useState<string>("all")
  const [search, setSearch] = useState("")

  // Manual payment form
  const [dialogOpen, setDialogOpen] = useState(false)
  const [payMemberId, setPayMemberId] = useState("")
  const [payAmount, setPayAmount] = useState("")
  const [payMethod, setPayMethod] = useState<PaymentMethod>("cash")
  const [payDescription, setPayDescription] = useState("")

  const enriched = useMemo(() => {
    return payments
      .map((p) => ({
        ...p,
        member: members.find((m) => m.id === p.memberId),
      }))
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [payments, members])

  const filtered = useMemo(() => {
    let list = enriched
    if (methodFilter !== "all") {
      list = list.filter((p) => p.method === methodFilter)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.member?.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
    }
    return list
  }, [enriched, methodFilter, search])

  const totalFiltered = filtered.reduce((sum, p) => sum + p.amount, 0)

  function handleRecordPayment() {
    if (!payMemberId || !payAmount || !payDescription) {
      toast.error("Please fill all fields.")
      return
    }
    const amount = Number.parseFloat(payAmount)
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount.")
      return
    }
    recordPayment({
      memberId: payMemberId,
      amount,
      method: payMethod,
      description: payDescription,
    })
    toast.success("Payment recorded!")
    setDialogOpen(false)
    setPayMemberId("")
    setPayAmount("")
    setPayMethod("cash")
    setPayDescription("")
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
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-primary-foreground">Amount</Label>
                <Input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="e.g. 1500"
                  className="border-muted-foreground/20 bg-muted-foreground/5 text-primary-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-primary-foreground">Description</Label>
                <Input
                  value={payDescription}
                  onChange={(e) => setPayDescription(e.target.value)}
                  placeholder="e.g. Monthly renewal"
                  className="border-muted-foreground/20 bg-muted-foreground/5 text-primary-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-primary-foreground">
                  Payment Method
                </Label>
                <RadioGroup
                  value={payMethod}
                  onValueChange={(v) => setPayMethod(v as PaymentMethod)}
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
                    {p.date}
                  </TableCell>
                  <TableCell className="font-medium text-primary-foreground">
                    {p.member?.name ?? "Unknown"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.description}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        p.method === "gcash"
                          ? "border-blue-500/30 text-blue-400"
                          : "border-emerald-500/30 text-emerald-400"
                      }
                    >
                      {p.method}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-primary-foreground">
                    {"P" + p.amount.toLocaleString()}
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
