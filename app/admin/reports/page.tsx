"use client"

import React, { useMemo, useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts"
import {
  CalendarDays,
  Users,
  DollarSign,
  ArrowUp,
} from "lucide-react"

export default function ReportsPage() {
  const supabase = createClient()

  const [activeCount, setActiveCount] = useState(0)
  const [expiredCount, setExpiredCount] = useState(0)
  const [monthRevenue, setMonthRevenue] = useState(0)
  const [attendanceData, setAttendanceData] = useState<{ date: string; visits: number }[]>([])
  const [revenueData, setRevenueData] = useState<{ date: string; revenue: number }[]>([])
  const [peakHours, setPeakHours] = useState<{ hour: number; label: string; count: number }[]>([])
  const [revenueByDayOfMonth, setRevenueByDayOfMonth] = useState<{ day: number; amount: number }[]>([])
  const [methodBreakdown, setMethodBreakdown] = useState({ cashTotal: 0, cashCount: 0, gcashTotal: 0, gcashCount: 0 })
  const [avgDailyVisits, setAvgDailyVisits] = useState("0")

  const fetchData = useCallback(async () => {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0]

    // Membership counts
    const { data: mships } = await supabase.from("memberships").select("status")
    const statuses = mships ?? []
    setActiveCount(statuses.filter((m) => m.status === "active").length)
    setExpiredCount(statuses.filter((m) => m.status === "expired").length)

    // Month revenue
    const { data: monthPayments } = await supabase
      .from("memberships")
      .select("amount_paid, created_at")
      .gte("created_at", monthStart + "T00:00:00")
    setMonthRevenue((monthPayments ?? []).reduce((sum, p) => sum + p.amount_paid, 0))

    // Attendance last 14 days
    const attData: { date: string; visits: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const ds = d.toISOString().split("T")[0]
      const { count } = await supabase
        .from("attendance")
        .select("id", { count: "exact", head: true })
        .gte("check_in", ds + "T00:00:00")
        .lt("check_in", ds + "T23:59:59.999")
      attData.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        visits: count ?? 0,
      })
    }
    setAttendanceData(attData)
    const totalVisits = attData.reduce((s, d) => s + d.visits, 0)
    setAvgDailyVisits((totalVisits / attData.length).toFixed(1))

    // Revenue last 14 days
    const revData: { date: string; revenue: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const ds = d.toISOString().split("T")[0]
      const { data: dayPayments } = await supabase
        .from("memberships")
        .select("amount_paid")
        .gte("created_at", ds + "T00:00:00")
        .lt("created_at", ds + "T23:59:59.999")
      revData.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: (dayPayments ?? []).reduce((sum, p) => sum + p.amount_paid, 0),
      })
    }
    setRevenueData(revData)

    // Peak hours
    const { data: allAttendance } = await supabase.from("attendance").select("check_in")
    const hourMap: Record<number, number> = {}
    for (const c of allAttendance ?? []) {
      const hour = new Date(c.check_in).getHours()
      hourMap[hour] = (hourMap[hour] || 0) + 1
    }
    const sortedHours = Object.entries(hourMap)
      .map(([hour, count]) => ({
        hour: Number(hour),
        label: `${Number(hour) % 12 || 12}${Number(hour) < 12 ? "AM" : "PM"}`,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
    setPeakHours(sortedHours)

    // Revenue by day of month
    const { data: allPayments } = await supabase.from("memberships").select("amount_paid, created_at")
    const dayMap: Record<number, number> = {}
    for (const p of allPayments ?? []) {
      const day = new Date(p.created_at).getDate()
      dayMap[day] = (dayMap[day] || 0) + p.amount_paid
    }
    const sortedDays = Object.entries(dayMap)
      .map(([day, amount]) => ({ day: Number(day), amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
    setRevenueByDayOfMonth(sortedDays)

    // Payment method breakdown
    const cash = (allPayments ?? []).filter((p) => (p as { payment_method?: string }).payment_method === "cash")
    const gcash = (allPayments ?? []).filter((p) => (p as { payment_method?: string }).payment_method === "gcash")
    // Need to re-fetch with payment_method
    const { data: allMships } = await supabase.from("memberships").select("amount_paid, payment_method")
    const cashMships = (allMships ?? []).filter((m) => m.payment_method === "cash")
    const gcashMships = (allMships ?? []).filter((m) => m.payment_method === "gcash")
    setMethodBreakdown({
      cashTotal: cashMships.reduce((s, m) => s + m.amount_paid, 0),
      cashCount: cashMships.length,
      gcashTotal: gcashMships.reduce((s, m) => s + m.amount_paid, 0),
      gcashCount: gcashMships.length,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="space-y-6">
      {/* Top-level stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-muted-foreground/10 bg-muted-foreground/5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Members</p>
              <p className="text-xl font-bold text-primary-foreground">
                {activeCount}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-muted-foreground/10 bg-muted-foreground/5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/15">
              <Users className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Expired</p>
              <p className="text-xl font-bold text-primary-foreground">
                {expiredCount}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-muted-foreground/10 bg-muted-foreground/5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15">
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Month Revenue</p>
              <p className="text-xl font-bold text-primary-foreground">
                {"P" + monthRevenue.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-muted-foreground/10 bg-muted-foreground/5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15">
              <CalendarDays className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Daily Visits</p>
              <p className="text-xl font-bold text-primary-foreground">
                {avgDailyVisits}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-muted-foreground/10 bg-muted-foreground/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-primary-foreground">
              Attendance (Last 14 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(0 0% 25%)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "hsl(0 0% 60%)", fontSize: 11 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: "hsl(0 0% 60%)", fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0 0% 12%)",
                      border: "1px solid hsl(0 0% 20%)",
                      borderRadius: "8px",
                      color: "hsl(0 0% 90%)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="visits"
                    stroke="hsl(22 100% 55%)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(22 100% 55%)", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted-foreground/10 bg-muted-foreground/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-primary-foreground">
              Revenue (Last 14 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(0 0% 25%)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "hsl(0 0% 60%)", fontSize: 11 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fill: "hsl(0 0% 60%)", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0 0% 12%)",
                      border: "1px solid hsl(0 0% 20%)",
                      borderRadius: "8px",
                      color: "hsl(0 0% 90%)",
                    }}
                    formatter={(value: number) => [
                      "P" + value.toLocaleString(),
                      "Revenue",
                    ]}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="hsl(173 58% 39%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Peak hours + best days + payment method */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-muted-foreground/10 bg-muted-foreground/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-primary-foreground">
              Peak Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            {peakHours.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Not enough data yet.
              </p>
            ) : (
              <div className="space-y-2">
                {peakHours.map((h, i) => (
                  <div
                    key={h.hour}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {i === 0 && (
                        <ArrowUp className="h-3 w-3 text-primary" />
                      )}
                      <span className="text-sm text-primary-foreground">
                        {h.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{
                          width: `${Math.max(20, (h.count / (peakHours[0]?.count || 1)) * 100)}px`,
                        }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {h.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-muted-foreground/10 bg-muted-foreground/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-primary-foreground">
              Best Revenue Days (of month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {revenueByDayOfMonth.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Not enough data yet.
              </p>
            ) : (
              <div className="space-y-2">
                {revenueByDayOfMonth.map((d, i) => (
                  <div
                    key={d.day}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-primary-foreground">
                      {"Day " + d.day}
                    </span>
                    <span className="text-sm font-medium text-primary">
                      {"P" + d.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-muted-foreground/10 bg-muted-foreground/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-primary-foreground">
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md border border-muted-foreground/10 bg-foreground p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cash</span>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 text-emerald-400"
                  >
                    {methodBreakdown.cashCount} payments
                  </Badge>
                </div>
                <p className="mt-1 text-lg font-bold text-primary-foreground">
                  {"P" + methodBreakdown.cashTotal.toLocaleString()}
                </p>
              </div>
              <div className="rounded-md border border-muted-foreground/10 bg-foreground p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">GCash</span>
                  <Badge
                    variant="outline"
                    className="border-blue-500/30 text-blue-400"
                  >
                    {methodBreakdown.gcashCount} payments
                  </Badge>
                </div>
                <p className="mt-1 text-lg font-bold text-primary-foreground">
                  {"P" + methodBreakdown.gcashTotal.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
