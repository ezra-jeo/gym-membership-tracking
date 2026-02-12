"use client"

import React, { useState, useMemo } from "react"
import { useGym } from "@/lib/gym-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import type { MemberStatus } from "@/lib/types"
import { Search, Snowflake, Play, AlertTriangle } from "lucide-react"

export default function MembersPage() {
  const { members, plans, updateMemberStatus, payments } = useGym()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = [...members]
    if (statusFilter !== "all") {
      list = list.filter((m) => m.status === statusFilter)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) || m.contactNumber.includes(q)
      )
    }
    return list.sort((a, b) => a.name.localeCompare(b.name))
  }, [members, statusFilter, search])

  const selectedMember = members.find((m) => m.id === selectedMemberId)
  const selectedPayments = selectedMemberId
    ? payments
        .filter((p) => p.memberId === selectedMemberId)
        .sort((a, b) => b.date.localeCompare(a.date))
    : []
  const selectedPlan = selectedMember
    ? plans.find((p) => p.id === selectedMember.membershipPlanId)
    : null

  const statusColor = (s: string) => {
    if (s === "active")
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    if (s === "expired")
      return "bg-red-500/20 text-red-400 border-red-500/30"
    return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
  }

  function handleFreeze(memberId: string) {
    updateMemberStatus(memberId, "frozen")
    toast.success("Membership frozen.")
  }

  function handleActivate(memberId: string) {
    updateMemberStatus(memberId, "active")
    toast.success("Membership activated.")
  }

  // Expired members for quick view
  const expiredMembers = members.filter((m) => m.status === "expired")

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
            placeholder="Search by name or contact..."
            className="border-muted-foreground/20 bg-muted-foreground/5 pl-10 text-primary-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 border-muted-foreground/20 bg-muted-foreground/5 text-primary-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-muted-foreground/20 bg-foreground text-primary-foreground">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="frozen">Frozen</SelectItem>
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
                const plan = plans.find((p) => p.id === m.membershipPlanId)
                return (
                  <TableRow
                    key={m.id}
                    className="border-muted-foreground/10 hover:bg-muted-foreground/5"
                  >
                    <TableCell className="font-medium text-primary-foreground">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setSelectedMemberId(m.id)}
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
                                    Contact
                                  </p>
                                  <p>{selectedMember.contactNumber}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Plan
                                  </p>
                                  <p>{selectedPlan?.name}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Start
                                  </p>
                                  <p>{selectedMember.startDate}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    End
                                  </p>
                                  <p>{selectedMember.endDate}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Status
                                  </p>
                                  <Badge
                                    variant="outline"
                                    className={statusColor(
                                      selectedMember.status
                                    )}
                                  >
                                    {selectedMember.status}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Member Since
                                  </p>
                                  <p>{selectedMember.createdAt}</p>
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
                                        <span>{p.description}</span>
                                        <span className="flex items-center gap-2">
                                          <Badge
                                            variant="outline"
                                            className="border-muted-foreground/20 text-muted-foreground text-[10px]"
                                          >
                                            {p.method}
                                          </Badge>
                                          <span className="font-medium">
                                            {"P" + p.amount.toLocaleString()}
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
                      {m.contactNumber}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {plan?.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {m.startDate}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {m.endDate}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusColor(m.status)}
                      >
                        {m.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {m.status === "active" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFreeze(m.id)}
                            className="h-7 gap-1 px-2 text-xs text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300"
                          >
                            <Snowflake className="h-3 w-3" />
                            Freeze
                          </Button>
                        )}
                        {(m.status === "frozen" || m.status === "expired") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleActivate(m.id)}
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

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {members.length} members
      </p>
    </div>
  )
}
