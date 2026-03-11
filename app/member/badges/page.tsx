'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import type { Badge, MemberBadge } from '@/lib/types';
import { Award } from 'lucide-react';

export default function BadgesPage() {
  const { profile } = useAuth();
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<Set<string>>(new Set());
  const [earnedDates, setEarnedDates] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    loadBadges();
  }, [profile]);

  async function loadBadges() {
    if (!profile) return;
    const supabase = createClient();

    const [{ data: badges }, { data: earned }] = await Promise.all([
      supabase.from('badges').select('*'),
      supabase.from('member_badges').select('*').eq('member_id', profile.id),
    ]);

    if (badges) {
      setAllBadges(
        badges.map((b) => ({
          id: b.id,
          name: b.name,
          description: b.description,
          icon: b.icon,
          criteria: b.criteria as unknown as Badge['criteria'],
        }))
      );
    }

    if (earned) {
      setEarnedBadgeIds(new Set(earned.map((e) => e.badge_id)));
      const dates = new Map<string, string>();
      earned.forEach((e) => dates.set(e.badge_id, e.earned_at));
      setEarnedDates(dates);
    }

    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 rounded animate-pulse" style={{ backgroundColor: 'var(--color-surface)' }} />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-36 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--color-surface)' }} />
          ))}
        </div>
      </div>
    );
  }

  const earned = allBadges.filter((b) => earnedBadgeIds.has(b.id));
  const locked = allBadges.filter((b) => !earnedBadgeIds.has(b.id));

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
        >
          Badges
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          {earned.length} of {allBadges.length} earned
        </p>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            backgroundColor: 'var(--color-primary)',
            width: allBadges.length > 0 ? `${(earned.length / allBadges.length) * 100}%` : '0%',
          }}
        />
      </div>

      {/* Earned badges */}
      {earned.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
            Earned
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {earned.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                isEarned={true}
                earnedDate={earnedDates.get(badge.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Locked badges */}
      {locked.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
            Locked
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {locked.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} isEarned={false} />
            ))}
          </div>
        </div>
      )}

      {allBadges.length === 0 && (
        <div className="text-center py-12">
          <Award size={48} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
          <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>No badges available</p>
        </div>
      )}
    </div>
  );
}

function BadgeCard({
  badge,
  isEarned,
  earnedDate,
}: {
  badge: Badge;
  isEarned: boolean;
  earnedDate?: string;
}) {
  return (
    <div
      className="rounded-xl p-4 border text-center transition-all"
      style={{
        backgroundColor: isEarned ? 'var(--color-white)' : 'var(--color-background)',
        borderColor: isEarned ? 'var(--color-primary)' : 'var(--color-surface)',
        opacity: isEarned ? 1 : 0.6,
      }}
    >
      <div className="text-4xl mb-2" style={{ filter: isEarned ? 'none' : 'grayscale(1)' }}>
        {badge.icon}
      </div>
      <p
        className="font-semibold text-sm"
        style={{ color: isEarned ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}
      >
        {badge.name}
      </p>
      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
        {badge.description}
      </p>
      {isEarned && earnedDate && (
        <p className="text-xs mt-2" style={{ color: 'var(--color-primary)' }}>
          Earned {new Date(earnedDate).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
