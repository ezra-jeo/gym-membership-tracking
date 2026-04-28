'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Bell, Flame, Calendar, Megaphone, Activity, X, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MemberNotification {
  id: string;
  notification_type: 'membership_expiry_7d' | 'membership_expiry_0d' | 'streak_milestone' | 'inactivity_nudge' | 'announcement';
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
}

const TYPE_ICON: Record<MemberNotification['notification_type'], React.ReactNode> = {
  membership_expiry_7d: <Calendar size={15} />,
  membership_expiry_0d: <Calendar size={15} />,
  streak_milestone:     <Flame size={15} />,
  inactivity_nudge:     <Activity size={15} />,
  announcement:         <Megaphone size={15} />,
};

const TYPE_COLOR: Record<MemberNotification['notification_type'], string> = {
  membership_expiry_7d: '#D97706',
  membership_expiry_0d: '#DC2626',
  streak_milestone:     '#EA580C',
  inactivity_nudge:     '#16A34A',
  announcement:         '#7C3AED',
};

const TYPE_BG: Record<MemberNotification['notification_type'], string> = {
  membership_expiry_7d: '#FFFBEB',
  membership_expiry_0d: '#FEF2F2',
  streak_milestone:     '#FFF7ED',
  inactivity_nudge:     '#ECFDF3',
  announcement:         '#F5F3FF',
};

export function MemberNotificationsPanel() {
  const { profile } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<MemberNotification[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const load = useCallback(async () => {
    if (!profile?.id) return;
    const { data } = await supabase
      .from('notifications')
      .select('id, notification_type, title, body, is_read, created_at')
      .eq('member_id', profile.id)
      .eq('for_member', true)
      .order('created_at', { ascending: false })
      .limit(30);
    setNotifications((data as MemberNotification[]) ?? []);
  }, [profile?.id, supabase]);

  useEffect(() => { load(); }, [load]);

  // Realtime — new notifications appear instantly
  useEffect(() => {
    if (!profile?.id) return;
    const channelName = `member-notifications-${profile.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      channel = supabase.channel(channelName);
      channel.on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `member_id=eq.${profile.id}`,
      }, (payload) => {
        const newNotif = payload.new as MemberNotification;
        if (newNotif.notification_type) {
          setNotifications((prev) => [newNotif, ...prev.slice(0, 29)]);
        }
      });
      channel.subscribe();
    } catch (error) {
      console.error('Failed to initialize member notifications realtime channel', error);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [profile?.id, supabase]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  async function markAllRead() {
    if (!profile?.id) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('member_id', profile.id)
      .eq('for_member', true)
      .eq('is_read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  async function markRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg transition-colors"
        style={{ color: 'var(--color-text-secondary)' }}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold px-1"
            style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="w-[calc(100vw-2rem)] max-w-sm rounded-2xl shadow-xl overflow-hidden"
              style={{ backgroundColor: 'var(--color-white)', border: '1px solid var(--color-surface)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--color-surface)' }}>
                <div className="flex items-center gap-2">
                  <Bell size={16} style={{ color: 'var(--color-primary)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'var(--color-primary-glow)', color: 'var(--color-primary)' }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="p-1.5 rounded-lg hover:bg-black/5" style={{ color: 'var(--color-text-muted)' }} title="Mark all read">
                      <CheckCheck size={14} />
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-black/5" style={{ color: 'var(--color-text-muted)' }}>
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="overflow-y-auto" style={{ maxHeight: 'min(400px, calc(100vh - 8rem))' }}>
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                    <Bell size={32} style={{ color: 'var(--color-surface)', marginBottom: 8 }} />
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>All caught up!</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n, i) => (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-black/2"
                      style={{ borderTop: i > 0 ? '1px solid var(--color-surface)' : 'none', backgroundColor: n.is_read ? 'transparent' : 'var(--color-primary-glow)' }}
                    >
                      <div className="mt-0.5 shrink-0 h-7 w-7 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: TYPE_BG[n.notification_type], color: TYPE_COLOR[n.notification_type] }}>
                        {TYPE_ICON[n.notification_type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{n.title}</p>
                        {n.body && <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>{n.body}</p>}
                        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      {!n.is_read && (
                        <div className="mt-1.5 h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: 'var(--color-primary)' }} />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
