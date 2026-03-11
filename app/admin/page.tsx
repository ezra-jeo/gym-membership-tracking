"use client"

import React, { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  UserCheck,
  UserX,
  DollarSign,
  Activity,
  Clock,
  LogOut,
  TrendingUp,
  UserPlus,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import { toast } from "sonner"

export default function AdminDashboard() {
  const supabase = createClient()

  const [checkedIn, setCheckedIn] = useState<
    { id: string; member_id: string; check_in: string; name: string }[]
  >([])
  const [todayVisits, setTodayVisits]     = useState(0)
  const [totalMembers, setTotalMembers]   = useState(0)  // from profiles
  const [pendingCount, setPendingCount]   = useState(0)  // awaiting approval
  const [activeCount, setActiveCount]     = useState(0)  // active memberships
  const [expiredCount, setExpiredCount]   = useState(0)
  const [frozenCount, setFrozenCount]     = useState(0)
  const [todayRevenue, setTodayRevenue]   = useState(0)
  const [monthRevenue, setMonthRevenue]   = useState(0)
  const [attendanceData, setAttendanceData] = useState<{ day: string; visits: number }[]>([])
  const [revenueData, setRevenueData]     = useState<{ day: string; revenue: number }[]>([])

  const today = new Date().toISOString().split("T")[0]
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0]

  const fetchData = useCallback(async () => {
    // Currently checked in
    const { data: checkedInData } = await supabase
      .from("attendance")
      .select("id, member_id, check_in, profiles!attendance_member_id_fkey(name)")
      .is("check_out", null)
    setCheckedIn(
      (checkedInData ?? []).map((c) => ({
        id: c.id,
        member_id: c.member_id,
        check_in: c.check_in,
        name: (c.profiles as unknown as { name: string })?.name ?? "Unknown",
      }))
    )

    // Today visits
    const { count: todayCount } = await supabase
      .from("attendance")
      .select("id", { count: "exact", head: true })
      .gte("check_in", today + "T00:00:00")
      .lt("check_in", today + "T23:59:59.999")
    setTodayVisits(todayCount ?? 0)

    // ── Total members from profiles (not memberships) ──────────────
    // This ensures members who signed up but have no plan still count
    const { data: allMembers } = await supabase
      .from("profiles")
      .select("id, status")
      .eq("role", "member")

    const members = allMembers ?? []
    setTotalMembers(members.length)
    setPendingCount(members.filter((m) => m.status === "pending").length)

    // Membership plan statuses (separate — for plan breakdown widget)
    const { data: mships } = await supabase
      .from("memberships")
      .select("status")
    const statuses = mships ?? []
    setActiveCount(statuses.filter((m) => m.status === "active").length)
    setExpiredCount(statuses.filter((m) => m.status === "expired").length)
    setFrozenCount(statuses.filter((m) => m.status === "frozen").length)

    // Today revenue
    const { data: todayPayments } = await supabase
      .from("memberships")
      .select("amount_paid")
      .gte("created_at", today + "T00:00:00")
      .lt("created_at", today + "T23:59:59.999")
    setTodayRevenue((todayPayments ?? []).reduce((sum, p) => sum + (p.amount_paid ?? 0), 0))

    // Month revenue
    const { data: monthPayments } = await supabase
      .from("memberships")
      .select("amount_paid")
      .gte("created_at", monthStart + "T00:00:00")
    setMonthRevenue((monthPayments ?? []).reduce((sum, p) => sum + (p.amount_paid ?? 0), 0))

    // Attendance last 7 days
    const attData: { day: string; visits: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const ds = d.toISOString().split("T")[0]
      const { count } = await supabase
        .from("attendance")
        .select("id", { count: "exact", head: true })
        .gte("check_in", ds + "T00:00:00")
        .lt("check_in", ds + "T23:59:59.999")
      attData.push({
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        visits: count ?? 0,
      })
    }
    setAttendanceData(attData)

    // Revenue last 7 days
    const revData: { day: string; revenue: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const ds = d.toISOString().split("T")[0]
      const { data: dayPayments } = await supabase
        .from("memberships")
        .select("amount_paid")
        .gte("created_at", ds + "T00:00:00")
        .lt("created_at", ds + "T23:59:59.999")
      revData.push({
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        revenue: (dayPayments ?? []).reduce((sum, p) => sum + (p.amount_paid ?? 0), 0),
      })
    }
    setRevenueData(revData)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleCheckOut(attendanceId: string) {
    const { error } = await supabase
      .from("attendance")
      .update({ check_out: new Date().toISOString() })
      .eq("id", attendanceId)
    if (error) {
      toast.error("Failed to check out")
      return
    }
    toast.success("Checked out!")
    fetchData()
  }

  const stats = [
    {
      label: "Currently In Gym",
      value: checkedIn.length,
      icon: Activity,
      color: "text-emerald-400",
      bg: "bg-emerald-500/15",
    },
    {
      label: "Visits Today",
      value: todayVisits,
      icon: UserCheck,
      color: "text-blue-400",
      bg: "bg-blue-500/15",
    },
    {
      label: "Total Members",
      value: totalMembers,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/15",
    },
    {
      label: "Pending Approval",
      value: pendingCount,
      icon: UserPlus,
      color: "text-yellow-400",
      bg: "bg-yellow-500/15",
    },
    {
      label: "Today Revenue",
      value: "₱" + todayRevenue.toLocaleString(),
      icon: DollarSign,
      color: "text-emerald-400",
      bg: "bg-emerald-500/15",
    },
    {
      label: "Month Revenue",
      value: "₱" + monthRevenue.toLocaleString(),
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-primary/15",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-muted-foreground/10 bg-muted-foreground/5">
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold text-primary-foreground">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Currently checked in */}
        <Card className="border-muted-foreground/10 bg-muted-foreground/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-primary-foreground">
              <Clock className="h-4 w-4 text-primary" />
              Live — Who&apos;s In The Gym
              <Badge variant="outline" className="ml-auto border-emerald-500/30 text-emerald-400">
                {checkedIn.length} checked in
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {checkedIn.length === 0 ? (
              <p className="text-sm text-muted-foreground">No one currently checked in.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {checkedIn.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-md border border-muted-foreground/10 bg-foreground p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-primary-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        In since{" "}
                        {new Date(c.check_in).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCheckOut(c.id)}
                      className="gap-1 border-red-500/30 bg-transparent text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                      <LogOut className="h-3 w-3" />
                      Out
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Membership breakdown */}
        <Card className="border-muted-foreground/10 bg-muted-foreground/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-primary-foreground">
              <Users className="h-4 w-4 text-primary" />
              Membership Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "Active plans",  count: activeCount,  color: "bg-emerald-500" },
                { label: "Expired plans", count: expiredCount, color: "bg-red-500" },
                { label: "Frozen plans",  count: frozenCount,  color: "bg-yellow-500" },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 rounded-full ${color}`}
                      style={{
                        width: `${Math.max(20, (count / (totalMembers || 1)) * 200)}px`,
                      }}
                    />
                    <span className="text-sm font-medium text-primary-foreground w-6 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
              <div className="mt-4 rounded-md border border-muted-foreground/10 bg-foreground p-3">
                <p className="text-xs text-muted-foreground">Total registered members</p>
                <p className="text-2xl font-bold text-primary-foreground">{totalMembers}</p>
                {pendingCount > 0 && (
                  <p className="text-xs text-yellow-400 mt-1">
                    {pendingCount} pending approval
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-muted-foreground/10 bg-muted-foreground/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-primary-foreground">
              Daily Attendance (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 25%)" />
                  <XAxis dataKey="day" tick={{ fill: "hsl(0 0% 60%)", fontSize: 12 }} />
                  <YAxis tick={{ fill: "hsl(0 0% 60%)", fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0 0% 12%)",
                      border: "1px solid hsl(0 0% 20%)",
                      borderRadius: "8px",
                      color: "hsl(0 0% 90%)",
                    }}
                  />
                  <Bar dataKey="visits" fill="hsl(22 100% 55%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted-foreground/10 bg-muted-foreground/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-primary-foreground">
              Daily Revenue (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 25%)" />
                  <XAxis dataKey="day" tick={{ fill: "hsl(0 0% 60%)", fontSize: 12 }} />
                  <YAxis tick={{ fill: "hsl(0 0% 60%)", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0 0% 12%)",
                      border: "1px solid hsl(0 0% 20%)",
                      borderRadius: "8px",
                      color: "hsl(0 0% 90%)",
                    }}
                    formatter={(value: number) => ["₱" + value.toLocaleString(), "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="hsl(173 58% 39%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}