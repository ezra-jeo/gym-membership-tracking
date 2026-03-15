'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase';
import { QrCode, Settings, LogOut, Edit2, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { profile, signOut } = useAuth();
  const router = useRouter();
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editContact, setEditContact] = useState('');
  const [membershipInfo, setMembershipInfo] = useState<{
    planName: string;
    startDate: string;
    endDate: string;
    status: string;
  } | null>(null);

  useEffect(() => {
    if (!profile) {
      router.push("/login"); 
      router.refresh();
      return;
    };
    generateQR();
    loadMembership();
    setEditName(profile.name);
    setEditContact(profile.contactNumber ?? '');
  }, [profile]);

  async function generateQR() {
    if (!qrCanvasRef.current || !profile) return;
    try {
      await QRCode.toCanvas(qrCanvasRef.current, profile.qrCode, {
        width: 250,
        margin: 2,
        color: {
          dark: '#2C2C2C',
          light: '#FFFFFF',
        },
      });
    } catch {
      // QR generation failed silently
    }
  }

  async function loadMembership() {
    if (!profile) return;
    const supabase = createClient();

    const { data } = await supabase
      .from('memberships')
      .select('*, membership_plans(name)')
      .eq('member_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (data) {
      const plan = data.membership_plans as unknown as { name: string } | null;
      setMembershipInfo({
        planName: plan?.name ?? 'Unknown',
        startDate: data.start_date,
        endDate: data.end_date,
        status: data.status,
      });
    }
  }

  async function saveProfile() {
    if (!profile) return;
    const supabase = createClient();

    const { error } = await supabase
      .from('profiles')
      .update({ name: editName, contact_number: editContact || null })
      .eq('id', profile.id);

    if (error) {
      toast.error('Failed to update profile');
      return;
    }

    toast.success('Profile updated!');
    setIsEditing(false);
    // Refresh the page to update the auth context
    router.refresh();
  }

  const handleSignOut = async () => {
    await signOut();
  };

  if (!profile) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--color-surface)' }} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
        >
          Profile
        </h1>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
          style={{ color: 'var(--color-danger)' }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      {/* QR Code Section */}
      <div
        className="rounded-xl p-6 border text-center"
        style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-surface)' }}
      >
        <h2
          className="text-sm font-semibold uppercase tracking-widest mb-4"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Your QR Code
        </h2>
        <div className="flex justify-center mb-3">
          <canvas ref={qrCanvasRef} className="rounded-lg" />
        </div>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Show this at the gym kiosk to check in
        </p>
      </div>

      {/* Profile Info */}
      <div
        className="rounded-xl p-5 border"
        style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-surface)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Personal Info
          </h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 text-sm"
              style={{ color: 'var(--color-primary)' }}
            >
              <Edit2 size={14} />
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={saveProfile}
                className="flex items-center gap-1 text-sm font-medium"
                style={{ color: 'var(--color-success)' }}
              >
                <Save size={14} />
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1 text-sm"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Name</label>
            {isEditing ? (
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border text-sm"
                style={{
                  borderColor: 'var(--color-light-gray)',
                  color: 'var(--color-text-primary)',
                }}
              />
            ) : (
              <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{profile.name}</p>
            )}
          </div>
          <div>
            <label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Email</label>
            <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{profile.email}</p>
          </div>
          <div>
            <label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Contact Number</label>
            {isEditing ? (
              <input
                value={editContact}
                onChange={(e) => setEditContact(e.target.value)}
                placeholder="09XX XXX XXXX"
                className="w-full mt-1 px-3 py-2 rounded-lg border text-sm"
                style={{
                  borderColor: 'var(--color-light-gray)',
                  color: 'var(--color-text-primary)',
                }}
              />
            ) : (
              <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {profile.contactNumber || 'Not set'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Membership Info */}
      {membershipInfo && (
        <div
          className="rounded-xl p-5 border"
          style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-surface)' }}
        >
          <h2
            className="text-sm font-semibold uppercase tracking-widest mb-4"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Membership
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Plan</span>
              <span className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{membershipInfo.planName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Status</span>
              <span
                className="font-medium text-sm px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: membershipInfo.status === 'active' ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                  color: membershipInfo.status === 'active' ? 'var(--color-success)' : 'var(--color-danger)',
                }}
              >
                {membershipInfo.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Expires</span>
              <span className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
                {new Date(membershipInfo.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Member since */}
      <p className="text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
        Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </p>
    </div>
  );
}
