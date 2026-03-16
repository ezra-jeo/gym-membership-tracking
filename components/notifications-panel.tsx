'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Bell, UserPlus, LogIn, AlertCircle, X, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'member_pending' | 'member_checkin' | 'membership_expiring';
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
  member_id: string | null;
}

const TYPE_ICON: Record<Notification['type'], React.ReactNode> = {
  member_pending:      <UserPlus size={15} />,
  member_checkin:      <LogIn size={15} />,
  membership_expiring: <AlertCircle size={15} />,
};

const TYPE_COLOR: Record<Notification['type'], string> = {
  member_pending:      '#D97706',
  member_checkin:      '#16A34A',
  membership_expiring: '#DC2626',
};

const TYPE_BG: Record<Notification['type'], string> = {
  member_pending:      '#FFFBEB',
  member_checkin:      '#ECFDF3',
  membership_expiring: '#FEF2F2',
};

export function NotificationsPanel() {
  const { profile } = useAuth();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const load = useCallback(async () => {
    if (!profile?.gymId) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);
    setNotifications((data as Notification[]) ?? []);
  }, [profile?.gymId, supabase]);

  useEffect(() => { load(); }, [load]);

  // Realtime — new notifications appear instantly
  useEffect(() => {
    if (!profile?.gymId) return;
    const channel = supabase
      .channel('notifications-' + profile.gymId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `gym_id=eq.${profile.gymId}`,
      }, (payload) => {
        setNotifications((prev) => [payload.new as Notification, ...prev.slice(0, 29)]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile?.gymId, supabase]);

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
    if (!profile?.gymId) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('gym_id', profile.gymId)
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
        style={{ color: 'var(--color-gray)' }}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ backgroundColor: 'var(--color-danger)', color: 'white' }}
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
            style={{ backgroundColor: '#ffffff', border: '1px solid var(--admin-border)' }}
          >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--admin-border)' }}>
            <div className="flex items-center gap-2">
              <Bell size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>Notifications</span>
              {unreadCount > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'var(--color-primary-glow)', color: 'var(--color-primary)' }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="p-1.5 rounded-lg hover:bg-black/5" style={{ color: '#5A5A5A' }} title="Mark all read">
                  <CheckCheck size={14} />
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-black/5" style={{ color: '#9A9A9A' }}>
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: 'min(400px, calc(100vh - 8rem))' }}>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <Bell size={32} style={{ color: '#D1C9BE', marginBottom: 8 }} />
                <p className="text-sm font-medium" style={{ color: '#5A5A5A' }}>All caught up!</p>
                <p className="text-xs mt-1" style={{ color: '#9A9A9A' }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map((n, i) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-black/2"
                  style={{ borderTop: i > 0 ? '1px solid #F3F1EE' : 'none', backgroundColor: n.is_read ? 'transparent' : '#FAFAF9' }}
                >
                  <div className="mt-0.5 shrink-0 h-7 w-7 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: TYPE_BG[n.type], color: TYPE_COLOR[n.type] }}>
                    {TYPE_ICON[n.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>{n.title}</p>
                    {n.body && <p className="text-xs mt-0.5 truncate" style={{ color: '#5A5A5A' }}>{n.body}</p>}
                    <p className="text-xs mt-1" style={{ color: '#9A9A9A' }}>
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