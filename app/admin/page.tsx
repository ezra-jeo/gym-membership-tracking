"use client"

import React from "react"
import { useGym } from "@/lib/gym-context"
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

export default function AdminDashboard() {
  const {
    getCheckedInMembers,
    getTodayVisitCount,
    getActiveCount,
    getExpiredCount,
    getFrozenCount,
    getTodayRevenue,
    getMonthRevenue,
    getAttendanceByDay,
    getRevenueByDay,
    checkOutMember,
    members,
  } = useGym()

  const checkedIn = getCheckedInMembers()
  const todayVisits = getTodayVisitCount()
  const activeCount = getActiveCount()
  const expiredCount = getExpiredCount()
  const frozenCount = getFrozenCount()
  const todayRevenue = getTodayRevenue()
  const monthRevenue = getMonthRevenue()

  const attendanceData = getAttendanceByDay(7).map((d) => ({
    day: new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }),
    visits: d.count,
  }))

  const revenueData = getRevenueByDay(7).map((d) => ({
    day: new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }),
    revenue: d.amount,
  }))

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
      label: "Active Members",
      value: activeCount,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/15",
    },
    {
      label: "Expired",
      value: expiredCount,
      icon: UserX,
      color: "text-red-400",
      bg: "bg-red-500/15",
    },
    {
      label: "Today Revenue",
      value: "P" + todayRevenue.toLocaleString(),
      icon: DollarSign,
      color: "text-emerald-400",
      bg: "bg-emerald-500/15",
    },
    {
      label: "Month Revenue",
      value: "P" + monthRevenue.toLocaleString(),
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
          <Card
            key={stat.label}
            className="border-muted-foreground/10 bg-muted-foreground/5"
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold text-primary-foreground">
                  {stat.value}
                </p>
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
              Live - Who{"'"}s In The Gym
              <Badge variant="outline" className="ml-auto border-emerald-500/30 text-emerald-400">
                {checkedIn.length} checked in
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {checkedIn.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No one currently checked in.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {checkedIn.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-md border border-muted-foreground/10 bg-foreground p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-primary-foreground">
                        {c.member.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {"In since " +
                          new Date(c.checkInTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => checkOutMember(c.memberId)}
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
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.max(20, (activeCount / members.length) * 200)}px` }} />
                  <span className="text-sm font-medium text-primary-foreground">{activeCount}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Expired</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-red-500" style={{ width: `${Math.max(20, (expiredCount / members.length) * 200)}px` }} />
                  <span className="text-sm font-medium text-primary-foreground">{expiredCount}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Frozen</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-yellow-500" style={{ width: `${Math.max(20, (frozenCount / members.length) * 200)}px` }} />
                  <span className="text-sm font-medium text-primary-foreground">{frozenCount}</span>
                </div>
              </div>
              <div className="mt-4 rounded-md border border-muted-foreground/10 bg-foreground p-3">
                <p className="text-xs text-muted-foreground">Total members</p>
                <p className="text-2xl font-bold text-primary-foreground">{members.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
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
                    formatter={(value: number) => ["P" + value.toLocaleString(), "Revenue"]}
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
