"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase"
import { A, ACard, Avatar, EmptyState, LoadingSkeleton, PageHeader } from "@/lib/admin-ui"
import {
  Users,
  UserCheck,
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
  const supabase = useMemo(() => createClient(), [])

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

  const fetchData = useCallback(async () => {
    const { data, error } = await supabase.rpc('admin_dashboard_stats')
    if (error || !data) return

    setCheckedIn(data.currently_in)
    setTodayVisits(data.today_visits)
    setTotalMembers(data.total_members)
    setPendingCount(data.pending_count)
    setActiveCount(data.active_plans)
    setExpiredCount(data.expired_plans)
    setFrozenCount(data.frozen_plans)
    setTodayRevenue(data.today_revenue)
    setMonthRevenue(data.month_revenue)
    setAttendanceData(data.attendance_7d)
    setRevenueData(data.revenue_7d)
  }, [supabase])

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
      iconColor: "#16A34A",
      bg: "#ECFDF3",
    },
    {
      label: "Visits Today",
      value: todayVisits,
      icon: UserCheck,
      iconColor: "#2563EB",
      bg: "#EFF6FF",
    },
    {
      label: "Total Members",
      value: totalMembers,
      icon: Users,
      iconColor: "var(--color-primary)",
      bg: "var(--color-primary-glow)",
    },
    {
      label: "Pending Approval",
      value: pendingCount,
      icon: UserPlus,
      iconColor: "#D97706",
      bg: "#FFFBEB",
    },
    {
      label: "Today Revenue",
      value: "₱" + todayRevenue.toLocaleString(),
      icon: DollarSign,
      iconColor: "#16A34A",
      bg: "#ECFDF3",
    },
    {
      label: "Month Revenue",
      value: "₱" + monthRevenue.toLocaleString(),
      icon: TrendingUp,
      iconColor: "var(--color-primary)",
      bg: "var(--color-primary-glow)",
    },
  ]

  const breakdownRows = [
    { label: "Active plans", count: activeCount, color: "#16A34A" },
    { label: "Expired plans", count: expiredCount, color: "#DC2626" },
    { label: "Frozen plans", count: frozenCount, color: "#D97706" },
  ]

  if (attendanceData.length === 0 && revenueData.length === 0 && checkedIn.length === 0 && totalMembers === 0) {
    return <LoadingSkeleton rows={6} h={72} />
  }

  return (
    <div className="space-y-6" style={{ backgroundColor: A.bg }}>
      <PageHeader
        title="Dashboard"
        subtitle="Live operations, member status, and performance snapshots"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <ACard key={stat.label} className="p-4">
            <div className="flex items-center gap-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: stat.bg }}
              >
                <stat.icon className="h-5 w-5" style={{ color: stat.iconColor }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: A.text2 }}>{stat.label}</p>
                <p className="text-xl font-bold" style={{ color: A.text }}>{stat.value}</p>
              </div>
            </div>
          </ACard>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ACard className="p-4">
          <div className="flex items-center justify-between pb-3" style={{ borderBottom: `1px solid ${A.border}` }}>
            <p className="flex items-center gap-2 text-base font-semibold" style={{ color: A.text }}>
              <Clock className="h-4 w-4" style={{ color: A.primary }} />
              Live - Who&apos;s In The Gym
            </p>
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: "#ECFDF3", color: "#16A34A", border: "1px solid #BBF7D0" }}
            >
              {checkedIn.length} checked in
            </span>
          </div>
          <div className="pt-3">
            {checkedIn.length === 0 ? (
              <EmptyState
                icon={<Clock size={28} />}
                title="No one currently checked in"
                subtitle="Members who scan in will appear here in real-time"
              />
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {checkedIn.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-lg p-3"
                    style={{ backgroundColor: A.surface2, border: `1px solid ${A.border}` }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={c.name} size={9} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: A.text }}>{c.name}</p>
                        <p className="text-xs" style={{ color: A.muted }}>
                        In since{" "}
                        {new Date(c.check_in).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCheckOut(c.id)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors"
                      style={{ backgroundColor: "var(--admin-expired-bg)", color: "var(--admin-expired-text)", border: "1px solid var(--admin-expired-border)" }}
                    >
                      <LogOut className="h-3 w-3" />
                      Out
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ACard>

        <ACard className="p-4">
          <div className="flex items-center gap-2 pb-3" style={{ borderBottom: `1px solid ${A.border}` }}>
            <Users className="h-4 w-4" style={{ color: A.primary }} />
            <p className="text-base font-semibold" style={{ color: A.text }}>
              Membership Breakdown
            </p>
          </div>
          <div className="space-y-4 pt-3">
            {breakdownRows.map(({ label, count, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: A.text2 }}>{label}</span>
                  <div className="flex items-center gap-2">
                    <div style={{ width: 180, backgroundColor: "#F1EFEB", borderRadius: 9999, overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${Math.min(100, (count / Math.max(1, totalMembers)) * 100)}%`,
                          minWidth: count > 0 ? 10 : 0,
                          height: 8,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-6 text-right" style={{ color: A.text }}>{count}</span>
                  </div>
                </div>
            ))}
            <div className="mt-4 rounded-lg p-3" style={{ backgroundColor: A.surface2, border: `1px solid ${A.border}` }}>
              <p className="text-xs" style={{ color: A.muted }}>Total registered members</p>
              <p className="text-2xl font-bold" style={{ color: A.text }}>{totalMembers}</p>
              {pendingCount > 0 && (
                <p className="text-xs mt-1" style={{ color: "#D97706" }}>
                  {pendingCount} pending approval
                </p>
              )}
            </div>
          </div>
        </ACard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ACard className="p-4">
          <div className="pb-3" style={{ borderBottom: `1px solid ${A.border}` }}>
            <p className="text-base font-semibold" style={{ color: A.text }}>
              Daily Attendance (Last 7 Days)
            </p>
          </div>
          <div className="h-48 pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                  <XAxis dataKey="day" tick={{ fill: "var(--admin-text-muted)", fontSize: 12 }} />
                  <YAxis tick={{ fill: "var(--admin-text-muted)", fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid var(--admin-border)",
                      borderRadius: "8px",
                      color: "var(--admin-text)",
                    }}
                  />
                  <Bar dataKey="visits" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
          </div>
        </ACard>

        <ACard className="p-4">
          <div className="pb-3" style={{ borderBottom: `1px solid ${A.border}` }}>
            <p className="text-base font-semibold" style={{ color: A.text }}>
              Daily Revenue (Last 7 Days)
            </p>
          </div>
          <div className="h-48 pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                  <XAxis dataKey="day" tick={{ fill: "var(--admin-text-muted)", fontSize: 12 }} />
                  <YAxis tick={{ fill: "var(--admin-text-muted)", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid var(--admin-border)",
                      borderRadius: "8px",
                      color: "var(--admin-text)",
                    }}
                    formatter={(value: number) => ["₱" + value.toLocaleString(), "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="#16A34A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
          </div>
        </ACard>
      </div>
    </div>
  )
}