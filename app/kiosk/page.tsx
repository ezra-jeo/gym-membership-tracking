"use client"

import React, { useState } from "react"
import { useGym } from "@/lib/gym-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  LogIn,
  LogOut,
  Search,
  User,
  Phone,
  Calendar,
  Clock,
} from "lucide-react"

export default function KioskPage() {
  const {
    members,
    findMemberByContact,
    isCheckedIn,
    checkInMember,
    checkOutMember,
    getCheckedInMembers,
    plans,
  } = useGym()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<typeof members>([])
  const [searched, setSearched] = useState(false)

  const checkedIn = getCheckedInMembers()

  function handleSearch() {
    const q = query.trim().toLowerCase()
    if (!q) return
    const found = members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) || m.contactNumber.includes(q)
    )
    setResults(found)
    setSearched(true)
  }

  function handleCheckIn(memberId: string) {
    const member = members.find((m) => m.id === memberId)
    if (!member) return
    if (member.status !== "active") {
      toast.error("Cannot check in. Membership is " + member.status + ".")
      return
    }
    checkInMember(memberId)
    toast.success(member.name + " checked in!")
    setQuery("")
    setResults([])
    setSearched(false)
  }

  function handleCheckOut(memberId: string) {
    const member = members.find((m) => m.id === memberId)
    checkOutMember(memberId)
    toast.success((member?.name ?? "Member") + " checked out!")
  }

  const statusColor = (s: string) => {
    if (s === "active")
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    if (s === "expired")
      return "bg-red-500/20 text-red-400 border-red-500/30"
    return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-10 px-6 py-12">
      {/* Search */}
      <div className="w-full max-w-lg text-center">
        <h1 className="mb-2 font-display text-3xl font-bold text-primary-foreground">
          Member Check-In / Check-Out
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Search by name or contact number
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
              placeholder="e.g. Marco or 09171234567"
              className="border-muted-foreground/30 bg-muted-foreground/10 pl-10 text-primary-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Search
          </Button>
        </form>

        {/* Search results */}
        {searched && (
          <div className="mt-4 space-y-2">
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No members found. Try a different search or{" "}
                <a href="/kiosk/signup" className="text-primary underline">
                  sign up a new member
                </a>
                .
              </p>
            ) : (
              results.map((m) => {
                const plan = plans.find((p) => p.id === m.membershipPlanId)
                const checkedInNow = isCheckedIn(m.id)
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-lg border border-muted-foreground/20 bg-muted-foreground/5 p-4"
                  >
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="font-medium">{m.name}</span>
                        <Badge
                          variant="outline"
                          className={statusColor(m.status)}
                        >
                          {m.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {m.contactNumber}
                        </span>
                        <span>{plan?.name}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {"Exp: " + m.endDate}
                        </span>
                      </div>
                    </div>
                    {checkedInNow ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCheckOut(m.id)}
                        className="gap-1.5 border-red-500/40 bg-transparent text-red-400 hover:bg-red-500/20 hover:text-red-300"
                      >
                        <LogOut className="h-4 w-4" />
                        Check Out
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleCheckIn(m.id)}
                        disabled={m.status !== "active"}
                        className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
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

      {/* Currently Checked In */}
      <div className="w-full max-w-2xl">
        <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-primary-foreground">
          <Clock className="h-5 w-5 text-primary" />
          Currently in the Gym
          <Badge variant="outline" className="ml-1 border-primary/40 text-primary">
            {checkedIn.length}
          </Badge>
        </h2>
        {checkedIn.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No one is currently checked in.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {checkedIn.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-lg border border-muted-foreground/20 bg-muted-foreground/5 p-3"
              >
                <div>
                  <p className="font-medium">{c.member.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {"Since " +
                      new Date(c.checkInTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCheckOut(c.memberId)}
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
