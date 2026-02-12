"use client"

import React, { useMemo } from "react"
import { useGym } from "@/lib/gym-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  TrendingUp,
  DollarSign,
  ArrowUp,
  ArrowDown,
} from "lucide-react"

export default function ReportsPage() {
  const {
    members,
    payments,
    checkIns,
    getActiveCount,
    getExpiredCount,
    getMonthRevenue,
    getAttendanceByDay,
    getRevenueByDay,
  } = useGym()

  const activeCount = getActiveCount()
  const expiredCount = getExpiredCount()
  const monthRevenue = getMonthRevenue()

  const attendanceData = getAttendanceByDay(14).map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    visits: d.count,
  }))

  const revenueData = getRevenueByDay(14).map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    revenue: d.amount,
  }))

  // Revenue by day of month (best days)
  const revenueByDayOfMonth = useMemo(() => {
    const dayMap: Record<number, number> = {}
    for (const p of payments) {
      const day = new Date(p.date).getDate()
      dayMap[day] = (dayMap[day] || 0) + p.amount
    }
    return Object.entries(dayMap)
      .map(([day, amount]) => ({ day: Number(day), amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
  }, [payments])

  // Peak hours (from check-ins)
  const peakHours = useMemo(() => {
    const hourMap: Record<number, number> = {}
    for (const c of checkIns) {
      const hour = new Date(c.checkInTime).getHours()
      hourMap[hour] = (hourMap[hour] || 0) + 1
    }
    return Object.entries(hourMap)
      .map(([hour, count]) => ({
        hour: Number(hour),
        label: `${Number(hour) % 12 || 12}${Number(hour) < 12 ? "AM" : "PM"}`,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [checkIns])

  // Payment method breakdown
  const methodBreakdown = useMemo(() => {
    const cash = payments.filter((p) => p.method === "cash")
    const gcash = payments.filter((p) => p.method === "gcash")
    return {
      cashTotal: cash.reduce((s, p) => s + p.amount, 0),
      cashCount: cash.length,
      gcashTotal: gcash.reduce((s, p) => s + p.amount, 0),
      gcashCount: gcash.length,
    }
  }, [payments])

  // Average daily visits
  const avgDailyVisits = useMemo(() => {
    const data = getAttendanceByDay(14)
    const total = data.reduce((s, d) => s + d.count, 0)
    return (total / data.length).toFixed(1)
  }, [getAttendanceByDay])

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
