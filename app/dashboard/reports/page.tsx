'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Download } from 'lucide-react';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('month');

  // Attendance data
  const attendanceData = [
    { date: 'Mon', checkins: 145, checkouts: 138 },
    { date: 'Tue', checkins: 168, checkouts: 162 },
    { date: 'Wed', checkins: 192, checkouts: 187 },
    { date: 'Thu', checkins: 175, checkouts: 169 },
    { date: 'Fri', checkins: 210, checkouts: 205 },
    { date: 'Sat', checkins: 128, checkouts: 125 },
    { date: 'Sun', checkins: 95, checkouts: 93 },
  ];

  // Revenue data
  const revenueData = [
    { month: 'January', revenue: 12450, target: 15000 },
    { month: 'February', revenue: 13200, target: 15000 },
    { month: 'March', revenue: 14500, target: 15000 },
    { month: 'April', revenue: 15800, target: 15000 },
    { month: 'May', revenue: 16200, target: 15000 },
    { month: 'June', revenue: 14900, target: 15000 },
  ];

  // Membership distribution
  const membershipData = [
    { name: 'Basic', value: 45, color: '#8884d8' },
    { name: 'Standard', value: 120, color: '#82ca9d' },
    { name: 'Premium', value: 83, color: '#ffc658' },
  ];

  // Peak hours
  const peakHoursData = [
    { hour: '6 AM', members: 45 },
    { hour: '7 AM', members: 120 },
    { hour: '8 AM', members: 95 },
    { hour: '12 PM', members: 160 },
    { hour: '1 PM', members: 140 },
    { hour: '5 PM', members: 210 },
    { hour: '6 PM', members: 240 },
    { hour: '7 PM', members: 180 },
  ];

  // Member status
  const memberStatusData = [
    { name: 'Active', value: 248, color: '#10b981' },
    { name: 'Inactive', value: 42, color: '#ef4444' },
    { name: 'Paused', value: 15, color: '#f59e0b' },
  ];

  const stats = [
    { label: 'Total Revenue (YTD)', value: '$91,050', change: '+12%' },
    { label: 'Avg Attendance Rate', value: '87.4%', change: '+3.2%' },
    { label: 'Member Retention', value: '94.2%', change: '+1.1%' },
    { label: 'New Members', value: '24', change: '+8' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p 
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: 'var(--color-primary)' }}
          >
            Analytics
          </p>
          <h1 
            className="text-5xl font-bold mt-2"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
            }}
          >
            Reports
          </h1>
          <p 
            className="text-lg mt-3"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Gym analytics and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download size={20} />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">{stat.change}</p>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="membership">Membership</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        {/* Attendance Tab */}
        <TabsContent value="attendance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Attendance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="checkins" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="checkouts" fill="var(--secondary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Peak Hours</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={peakHoursData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip />
                  <Line type="monotone" dataKey="members" stroke="var(--primary)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Revenue vs Target</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="target" fill="var(--muted)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        {/* Membership Tab */}
        <TabsContent value="membership">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Members by Plan</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={membershipData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {membershipData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Membership Details</h3>
              {membershipData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold text-foreground">
                    {membershipData.reduce((sum, item) => sum + item.value, 0)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Member Status Distribution</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={memberStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip />
                <Bar dataKey="value" fill="var(--primary)" radius={[8, 8, 0, 0]}>
                  {memberStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
