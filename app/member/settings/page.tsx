'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  LogOut,
  Trash2,
  Info,
  Mail,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageSkeleton } from '@/components/ui/loading-screen';

function SettingsRow({
  icon,
  label,
  sublabel,
  onClick,
  danger = false,
  hideChevron = false,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onClick?: () => void;
  danger?: boolean;
  hideChevron?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-black/2 text-left disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <div
        className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
        style={{
          backgroundColor: danger ? 'var(--color-danger-bg)' : 'var(--color-surface)',
          color: danger ? 'var(--color-danger)' : 'var(--color-primary)',
        }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: danger ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
          {label}
        </p>
        {sublabel && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{sublabel}</p>
        )}
      </div>
      {!hideChevron && (
        <ChevronRight size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
      )}
    </button>
  );
}

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div>
      {title && (
        <p className="text-xs font-semibold uppercase tracking-widest px-1 mb-2"
          style={{ color: 'var(--color-text-muted)' }}>
          {title}
        </p>
      )}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--color-white)',
          border: '1px solid var(--color-surface)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ borderTop: '1px solid var(--color-surface)' }} />;
}

export default function SettingsPage() {
  const { profile, signOut, isSigningOut } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!profile) return <PageSkeleton rows={3} height={80} />;

  async function handleSignOut() {
    if (isSigningOut) return;
    await signOut();
  }

  async function handleDeleteAccount() {
    if (!profile) return;
    setDeleting(true);
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'rejected' })
      .eq('id', profile.id);
    if (error) {
      toast.error('Failed to delete account. Please contact support.');
      setDeleting(false);
      return;
    }
    toast.success('Account deleted.');
    await signOut();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}>
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Account and app preferences
        </p>
      </div>

      {/* Account */}
      <SectionCard title="Account">
        <div className="px-4 py-3.5 flex items-center gap-4">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold"
            style={{ backgroundColor: 'var(--color-primary-glow)', color: 'var(--color-primary)' }}
          >
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{profile.name}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{profile.email}</p>
          </div>
        </div>
        <Divider />
        <SettingsRow
          icon={<Shield size={17} />}
          label="Edit Profile"
          sublabel="Name, contact number, QR code"
          onClick={() => router.push('/member/profile')}
        />
      </SectionCard>

      {/* App */}
      <SectionCard title="App">
        <SettingsRow
          icon={<Info size={17} />}
          label="About Stren"
          sublabel="Version 1.0 · Built for local gyms"
          hideChevron
        />
        <Divider />
        <SettingsRow
          icon={<Mail size={17} />}
          label="Contact Us"
          sublabel="Get help or send feedback"
          onClick={() => window.open('mailto:support@stren.app', '_blank')}
        />
      </SectionCard>

      {/* Actions */}
      <SectionCard title="Account Actions">
        <SettingsRow
          icon={<LogOut size={17} />}
          label={isSigningOut ? 'Signing Out...' : 'Sign Out'}
          onClick={handleSignOut}
          danger
          hideChevron
          disabled={isSigningOut}
        />
        <Divider />
        <SettingsRow
          icon={<Trash2 size={17} />}
          label="Delete Account"
          sublabel="Permanently remove your account"
          onClick={() => setShowDeleteConfirm(true)}
          danger
        />
      </SectionCard>

      <p className="text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
        Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </p>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 space-y-4"
            style={{ backgroundColor: 'var(--color-white)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-danger-bg)' }}>
                <AlertTriangle size={20} style={{ color: 'var(--color-danger)' }} />
              </div>
              <div>
                <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Delete Account?</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>This cannot be undone</p>
              </div>
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Your profile, attendance history, and membership records will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors"
                style={{ borderColor: 'var(--color-surface)', color: 'var(--color-text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-danger)', color: 'white' }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
