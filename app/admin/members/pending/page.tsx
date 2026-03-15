'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase';
import { CheckCircle2, XCircle, Loader2, UserPlus } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}>
          Pending Approvals
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Review and approve new member requests
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--color-primary)' }} />
        </div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <UserPlus className="h-12 w-12 mb-4" style={{ color: 'var(--color-text-muted)' }} />
          <p className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>No pending requests</p>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            New member requests will appear here
          </p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--color-light-gray)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: 'var(--color-surface)' }}>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>Requested</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-t" style={{ borderColor: 'var(--color-light-gray)' }}>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>{m.name}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{m.email}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {new Date(m.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleAction(m.id, 'active')}
                        disabled={actionLoading === m.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105"
                        style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#16a34a' }}
                      >
                        {actionLoading === m.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(m.id, 'rejected')}
                        disabled={actionLoading === m.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105"
                        style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#dc2626' }}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
