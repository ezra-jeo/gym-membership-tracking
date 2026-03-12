'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import type { LeaderboardEntry } from '@/lib/types';
import { Trophy, Medal, Flame, Clock } from 'lucide-react';

type LeaderboardCategory = 'visits' | 'duration' | 'streak';

export default function LeaderboardPage() {
  const { profile } = useAuth();
  const [category, setCategory] = useState<LeaderboardCategory>('visits');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [myRank, setMyRank] = useState<number | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [category]);

  async function loadLeaderboard() {
    setIsLoading(true);
    const supabase = createClient();

    type Row = { member_id: string; member_name: string; avatar_url: string | null; value: number }
    let rows: Row[] = []

    if (category === 'visits') {
      const { data } = await supabase.rpc('leaderboard_visits', { p_limit: 50 })
      rows = (data ?? []) as Row[]
    } else if (category === 'duration') {
      const { data } = await supabase.rpc('leaderboard_duration', { p_limit: 50 })
      rows = (data ?? []) as Row[]
    } else {
      const { data } = await supabase.rpc('leaderboard_streak', { p_limit: 50 })
      rows = (data ?? []) as Row[]
    }

    const leaderboard: LeaderboardEntry[] = rows.map((row, i) => ({
      memberId:   row.member_id,
      memberName: row.member_name,
      avatarUrl:  row.avatar_url,
      value:      Number(row.value),
      rank:       i + 1,
    }))

    setEntries(leaderboard)
    const myEntry = leaderboard.find((e) => e.memberId === profile?.id)
    setMyRank(myEntry?.rank ?? null)
    setIsLoading(false)
  }

  const categoryLabels: Record<LeaderboardCategory, { label: string; icon: React.ReactNode; unit: string }> = {
    visits: { label: 'Most Visits', icon: <Trophy size={18} />, unit: 'visits' },
    duration: { label: 'Total Time', icon: <Clock size={18} />, unit: 'min' },
    streak: { label: 'Best Streak', icon: <Flame size={18} />, unit: 'days' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
        >
          Leaderboard
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Monthly rankings — resets each month
        </p>
      </div>

      {/* My rank banner */}
      {myRank !== null && (
        <div
          className="rounded-xl p-4 border"
          style={{
            backgroundColor: 'var(--color-primary-glow)',
            borderColor: 'var(--color-primary)',
          }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--color-primary-dark)' }}>
            Your rank: <span className="text-xl font-bold">#{myRank}</span> in {categoryLabels[category].label}
          </p>
        </div>
      )}

      {/* Category tabs */}
      <div className="flex gap-2">
        {(Object.keys(categoryLabels) as LeaderboardCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: category === cat ? 'var(--color-primary)' : 'var(--color-white)',
              color: category === cat ? 'var(--color-white)' : 'var(--color-text-secondary)',
              border: `1px solid ${category === cat ? 'var(--color-primary)' : 'var(--color-surface)'}`,
            }}
          >
            {categoryLabels[cat].icon}
            {categoryLabels[cat].label}
          </button>
        ))}
      </div>

      {/* Leaderboard list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--color-surface)' }} />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12">
          <Trophy size={48} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
          <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>No entries yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Check in to appear on the leaderboard!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.memberId}
              className="flex items-center gap-3 p-3 rounded-xl border transition-all"
              style={{
                backgroundColor: entry.memberId === profile?.id ? 'var(--color-primary-glow)' : 'var(--color-white)',
                borderColor: entry.memberId === profile?.id ? 'var(--color-primary)' : 'var(--color-surface)',
              }}
            >
              {/* Rank */}
              <div className="w-8 text-center">
                {entry.rank <= 3 ? (
                  <span className="text-xl">{entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}</span>
                ) : (
                  <span className="text-sm font-bold" style={{ color: 'var(--color-text-muted)' }}>
                    {entry.rank}
                  </span>
                )}
              </div>

              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{
                  backgroundColor: 'var(--color-primary-glow)',
                  color: 'var(--color-primary)',
                }}
              >
                {entry.memberName.charAt(0).toUpperCase()}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {entry.memberName}
                  {entry.memberId === profile?.id && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
                      You
                    </span>
                  )}
                </p>
              </div>

              {/* Value */}
              <div className="text-right">
                <span className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {entry.value}
                </span>
                <span className="text-xs ml-1" style={{ color: 'var(--color-text-muted)' }}>
                  {categoryLabels[category].unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
