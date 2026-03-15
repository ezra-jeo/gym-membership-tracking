'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase';
import { Flame, TrendingUp, Clock, Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { MemberStats } from '@/lib/types';

export default function MemberHomePage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentVisits, setRecentVisits] = useState<{ date: string; duration: number | null }[]>([]);

  useEffect(() => {
    if (!profile) return;
    loadStats();
  }, [profile]);

  async function loadStats() {
    if (!profile) return;
    const supabase = createClient();

    const { data, error } = await supabase.rpc('member_home_stats')
    if (error || !data) { setIsLoading(false); return }

    setStats({
      totalVisits:         data.total_visits,
      monthlyVisits:       data.monthly_visits,
      currentStreak:       data.streak?.current_streak ?? 0,
      bestStreak:          data.streak?.best_streak ?? 0,
      avgSessionMinutes:   data.avg_session_minutes,
      leaderboardRank:     null,
    })

    setRecentVisits(
      data.recent_visits.map((r: { date: string; duration_min: number | null }) => ({
        date:     r.date,
        duration: r.duration_min,
      }))
    )

    setIsLoading(false)
  }

  if (isLoading || !profile) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--color-surface)' }} />
        ))}
      </div>
    );
  }

  const greeting = getGreeting();

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
        >
          {greeting}, {profile.name.split(' ')[0]}!
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Here&apos;s your gym activity overview
        </p>
      </div>

      {/* Streak Banner */}
      {stats && stats.currentStreak > 0 && (
        <div
          className="relative overflow-hidden rounded-xl p-5"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
            color: 'var(--color-white)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame size={24} />
                <span className="text-3xl font-bold">{stats.currentStreak}</span>
                <span className="text-lg opacity-90">day streak!</span>
              </div>
              <p className="text-sm opacity-80">
                Personal best: {stats.bestStreak} days
              </p>
            </div>
            <div className="text-6xl opacity-20">🔥</div>
          </div>
        </div>
      )}

      {stats && stats.currentStreak === 0 && (
        <div
          className="rounded-xl p-5 border"
          style={{
            backgroundColor: 'var(--color-warning-bg)',
            borderColor: 'var(--color-warning)',
          }}
        >
          <div className="flex items-center gap-3">
            <Flame size={24} style={{ color: 'var(--color-warning)' }} />
            <div>
              <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                No active streak
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Check in today to start a new streak!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<Calendar size={20} />} label="This Month" value={stats?.monthlyVisits ?? 0} unit="visits" />
        <StatCard icon={<TrendingUp size={20} />} label="All Time" value={stats?.totalVisits ?? 0} unit="visits" />
        <StatCard icon={<Clock size={20} />} label="Avg Session" value={stats?.avgSessionMinutes ?? 0} unit="min" />
      </div>

      {/* Quick Links */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
          Quick Access
        </h2>
        <QuickLink href="/member/feed" label="Activity Feed" description="See what everyone's up to" />
        <QuickLink href="/member/leaderboard" label="Leaderboard" description="Monthly rankings" />
        <QuickLink href="/member/profile" label="My QR Code" description="Show at check-in" />
      </div>

      {/* Recent Visits */}
      {recentVisits.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
            Recent Visits
          </h2>
          <div className="space-y-2">
            {recentVisits.map((visit, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: 'var(--color-white)', border: '1px solid var(--color-surface)' }}
              >
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {new Date(visit.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {visit.duration ? `${visit.duration} min` : 'In progress'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, unit }: { icon: React.ReactNode; label: string; value: number | string; unit: string }) {
  return (
    <div
      className="rounded-xl p-4 border"
      style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-surface)' }}
    >
      <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--color-primary)' }}>
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{value}</span>
        {unit && <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{unit}</span>}
      </div>
    </div>
  );
}

function QuickLink({ href, label, description }: { href: string; label: string; description: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-sm"
      style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-surface)' }}
    >
      <div>
        <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{label}</p>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{description}</p>
      </div>
      <ChevronRight size={20} style={{ color: 'var(--color-text-muted)' }} />
    </Link>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
