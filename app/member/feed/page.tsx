'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import type { FeedItem } from '@/lib/types';
import { Heart, MessageCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function FeedPage() {
  const { profile } = useAuth();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const loadFeed = useCallback(async () => {
    const { data } = await supabase
      .from('feed_items')
      .select('*, profiles!feed_items_member_id_fkey(name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      const items: FeedItem[] = data.map((item) => {
        const profileData = item.profiles as unknown as { name: string; avatar_url: string | null } | null;
        return {
          id: item.id,
          memberId: item.member_id,
          type: item.type,
          title: item.title,
          description: item.description,
          metadata: item.metadata as Record<string, unknown> | null,
          kudosCount: item.kudos_count,
          createdAt: item.created_at,
          memberName: profileData?.name ?? 'Unknown',
          memberAvatar: profileData?.avatar_url ?? null,
        };
      });

      if (profile) {
        const { data: kudosData } = await supabase
          .from('kudos')
          .select('feed_item_id')
          .eq('from_member', profile.id);

        const kudosedIds = new Set(kudosData?.map((k) => k.feed_item_id) ?? []);
        items.forEach((item) => {
          item.hasKudosed = kudosedIds.has(item.id);
        });
      }

      setFeedItems(items);
    }
    setIsLoading(false);
  }, [supabase, profile]);

  useEffect(() => {
    loadFeed();

    const channel = supabase
      .channel('feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feed_items' }, (payload) => {
        const row = payload.new as Record<string, unknown>;
        const newItem: FeedItem = {
          id: row.id as string,
          memberId: row.member_id as string,
          type: row.type as FeedItem['type'],
          title: row.title as string,
          description: (row.description as string) ?? null,
          metadata: (row.metadata as Record<string, unknown>) ?? null,
          kudosCount: 0,
          createdAt: row.created_at as string,
          memberName: 'Gym Member',
          memberAvatar: null,
          hasKudosed: false,
        };
        setFeedItems((prev) => [newItem, ...prev.slice(0, 49)]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadFeed, supabase]);

  async function handleKudos(feedItemId: string) {
    if (!profile) return;

    const item = feedItems.find((f) => f.id === feedItemId);
    if (!item || item.hasKudosed || item.memberId === profile.id) return;

    const { error } = await supabase.from('kudos').insert({
      from_member: profile.id,
      feed_item_id: feedItemId,
    });

    if (!error) {
      setFeedItems((prev) =>
        prev.map((f) =>
          f.id === feedItemId
            ? { ...f, kudosCount: f.kudosCount + 1, hasKudosed: true }
            : f
        )
      );
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-28 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--color-surface)' }} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
        >
          Activity Feed
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          See what the gym community is up to
        </p>
      </div>

      {feedItems.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle size={48} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
          <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>No activity yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Check in at the gym to get started!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedItems.map((item) => (
            <FeedCard key={item.id} item={item} onKudos={handleKudos} isOwnItem={item.memberId === profile?.id} />
          ))}
        </div>
      )}
    </div>
  );
}

function FeedCard({
  item,
  onKudos,
  isOwnItem,
}: {
  item: FeedItem;
  onKudos: (id: string) => void;
  isOwnItem: boolean;
}) {
  const typeIcon = getFeedTypeIcon(item.type);
  const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });

  return (
    <div
      className="rounded-xl p-4 border"
      style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-surface)' }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
          style={{ backgroundColor: 'var(--color-primary-glow)' }}
        >
          {typeIcon}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
            {item.title}
          </p>
          {item.description && (
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              {item.description}
            </p>
          )}

          <div className="flex items-center gap-4 mt-3">
            {/* Kudos button */}
            <button
              onClick={() => onKudos(item.id)}
              disabled={item.hasKudosed || isOwnItem}
              className="flex items-center gap-1.5 text-sm transition-all"
              style={{
                color: item.hasKudosed ? 'var(--color-primary)' : 'var(--color-text-muted)',
                opacity: isOwnItem ? 0.5 : 1,
                cursor: item.hasKudosed || isOwnItem ? 'default' : 'pointer',
              }}
            >
              <Heart size={16} fill={item.hasKudosed ? 'currentColor' : 'none'} />
              <span>{item.kudosCount > 0 ? item.kudosCount : ''}</span>
            </button>

            {/* Timestamp */}
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <Clock size={12} />
              {timeAgo}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getFeedTypeIcon(type: FeedItem['type']): string {
  switch (type) {
    case 'check_in': return '💪';
    case 'check_out': return '👋';
    case 'badge': return '🏅';
    case 'challenge': return '🎯';
    case 'announcement': return '📢';
    case 'streak_milestone': return '🔥';
    default: return '📝';
  }
}
