'use client';

import { Card } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, DollarSign, TrendingUp, Calendar } from 'lucide-react';

export default function DashboardPage() {
  // Mock data
  const stats = [
    {
      label: 'Active Members',
      value: '248',
      change: '+12%',
      icon: Users,
      bgColor: 'bg-success/10',
      iconColor: 'text-success',
      color: '#4CAF7D',
    },
    {
      label: 'Revenue (This Month)',
      value: '$12,450',
      change: '+8%',
      icon: DollarSign,
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary',
      color: '#D4956A',
    },
    {
      label: 'Check-ins Today',
      value: '64',
      change: '+23%',
      icon: TrendingUp,
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary',
      color: '#D4956A',
    },
    {
      label: 'Classes Scheduled',
      value: '12',
      change: '+2',
      icon: Calendar,
      bgColor: 'bg-warning/10',
      iconColor: 'text-warning',
      color: '#E8A920',
    },
  ];

  const attendanceData = [
    { month: 'Jan', checkIns: 320, uniqueMembers: 240 },
    { month: 'Feb', checkIns: 380, uniqueMembers: 280 },
    { month: 'Mar', checkIns: 410, uniqueMembers: 300 },
    { month: 'Apr', checkIns: 450, uniqueMembers: 340 },
    { month: 'May', checkIns: 520, uniqueMembers: 390 },
    { month: 'Jun', checkIns: 580, uniqueMembers: 420 },
  ];

  const peakHoursData = [
    { time: '6am', count: 45 },
    { time: '7am', count: 120 },
    { time: '8am', count: 95 },
    { time: '12pm', count: 160 },
    { time: '1pm', count: 140 },
    { time: '5pm', count: 210 },
    { time: '6pm', count: 240 },
    { time: '7pm', count: 180 },
  ];

  const recentActivity = [
    { id: 1, member: 'John Doe', action: 'Checked in', time: '5 minutes ago', type: 'checkin' },
    { id: 2, member: 'Sarah Smith', action: 'Membership renewed', time: '1 hour ago', type: 'renewal' },
    { id: 3, member: 'Mike Johnson', action: 'Checked in', time: '2 hours ago', type: 'checkin' },
    { id: 4, member: 'Emma Wilson', action: 'Payment received', time: '3 hours ago', type: 'payment' },
    { id: 5, member: 'David Brown', action: 'Checked out', time: '4 hours ago', type: 'checkout' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--color-primary)' }}>
          Welcome back
        </p>
        <h1 
          className="text-5xl font-bold mt-2"
          style={{ 
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
          }}
        >
          Dashboard
        </h1>
        <p className="text-lg mt-3" style={{ color: 'var(--color-text-secondary)' }}>
          Here's your gym overview and key metrics.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx} 
              className="p-6 rounded-lg border transition-all hover:shadow-md"
              style={{
                backgroundColor: 'var(--color-white)',
                borderColor: 'var(--color-surface)',
                borderWidth: '1px',
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p 
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {stat.label}
                  </p>
                  <p 
                    className="text-4xl font-bold mt-2"
                    style={{ 
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {stat.value}
                  </p>
                  <p 
                    className="text-xs mt-3 font-medium"
                    style={{ color: stat.color || 'var(--color-success)' }}
                  >
                    {stat.change} from last month
                  </p>
                </div>
                <div 
                  className="p-3 rounded-lg"
                  style={{ 
                    backgroundColor: `${stat.color}15`,
                  }}
                >
                  <Icon className="w-6 h-6" style={{ color: stat.color || 'var(--color-primary)' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <div 
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: 'var(--color-white)',
            borderColor: 'var(--color-surface)',
            borderWidth: '1px',
          }}
        >
          <h3 
            className="text-xl font-bold mb-6"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
            }}
          >
            Attendance Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface)" />
              <XAxis stroke="var(--color-gray)" />
              <YAxis stroke="var(--color-gray)" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="checkIns" stroke="var(--color-primary)" strokeWidth={2} />
              <Line type="monotone" dataKey="uniqueMembers" stroke="var(--color-charcoal)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Peak Hours */}
        <div 
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: 'var(--color-white)',
            borderColor: 'var(--color-surface)',
            borderWidth: '1px',
          }}
        >
          <h3 
            className="text-xl font-bold mb-6"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
            }}
          >
            Peak Hours
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={peakHoursData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface)" />
              <XAxis stroke="var(--color-gray)" />
              <YAxis stroke="var(--color-gray)" />
              <Tooltip />
              <Bar dataKey="count" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div 
        className="p-6 rounded-lg border"
        style={{
          backgroundColor: 'var(--color-white)',
          borderColor: 'var(--color-surface)',
          borderWidth: '1px',
        }}
      >
        <h3 
          className="text-xl font-bold mb-6"
          style={{
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
          }}
        >
          Recent Activity
        </h3>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-center justify-between p-4 rounded-lg transition"
              style={{
                backgroundColor: 'var(--color-background)',
                borderBottom: '1px solid var(--color-surface)',
              }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: 
                      activity.type === 'checkin' ? 'var(--color-success)' : 
                      activity.type === 'checkout' ? 'var(--color-danger)' :
                      'var(--color-primary)',
                  }}
                />
                <div>
                  <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {activity.member}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {activity.action}
                  </p>
                </div>
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {activity.time}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
