'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase';
import { CheckCircle2, XCircle, UserPlus } from 'lucide-react';
import { A, ACard, Avatar, EmptyState, LoadingSkeleton, PageHeader } from '@/lib/admin-ui';

interface PendingMember {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export default function PendingMembersPage() {
  const { profile } = useAuth();
  const supabase = createClient();
  const [members, setMembers] = useState<PendingMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.gymId) fetchPending();
  }, [profile?.gymId]);

  async function fetchPending() {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, name, email, created_at')
      .eq('gym_id', profile!.gymId!)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    setMembers(
      (data ?? []).map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        created_at: m.created_at ?? new Date().toISOString(),
      }))
    );
    setLoading(false);
  }

  async function handleAction(memberId: string, status: 'active' | 'rejected') {
    setActionLoading(memberId);
    await supabase.from('profiles').update({ status }).eq('id', memberId);
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    setActionLoading(null);
  }

  if (loading) {
    return <LoadingSkeleton rows={5} h={76} />;
  }

  return (
    <div className="space-y-6" style={{ backgroundColor: A.bg }}>
      <PageHeader
        title="Pending Approvals"
        subtitle="Review and approve new member requests"
      />

      {members.length === 0 ? (
        <EmptyState
          icon={<UserPlus size={40} />}
          title="No pending requests"
          subtitle="New member requests will appear here"
        />
      ) : (
        <div className="space-y-2">
          {members.map((m) => (
            <ACard key={m.id} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={m.name} size={9} />
                  <div className="min-w-0">
                    <p className="font-medium truncate" style={{ color: A.text }}>{m.name}</p>
                    <p className="text-sm truncate" style={{ color: A.text2 }}>{m.email}</p>
                    <p className="text-xs" style={{ color: A.muted }}>Requested {new Date(m.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleAction(m.id, 'active')}
                    disabled={actionLoading === m.id}
                    className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-60"
                    style={{ backgroundColor: 'var(--admin-active-bg)', color: 'var(--admin-active-text)', border: '1px solid var(--admin-active-border)' }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction(m.id, 'rejected')}
                    disabled={actionLoading === m.id}
                    className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-60"
                    style={{ backgroundColor: 'var(--admin-expired-bg)', color: 'var(--admin-expired-text)', border: '1px solid var(--admin-expired-border)' }}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            </ACard>
          ))}
        </div>
      )}
    </div>
  );
}
