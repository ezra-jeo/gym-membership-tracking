'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase';
import { LogOut, Edit2, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { toast } from 'sonner';
import { PageSkeleton } from '@/components/ui/loading-screen';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileEditSchema } from '@/lib/validations';
import type { z } from 'zod';

type ProfileEditFormData = z.infer<typeof profileEditSchema>;

export default function ProfilePage() {
  const { profile, signOut, isSigningOut } = useAuth();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [membershipInfo, setMembershipInfo] = useState<{
    planName: string;
    startDate: string;
    endDate: string;
    status: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      name: '',
      contact_number: '',
    },
  });

  useEffect(() => {
    if (!profile) {
      return;
    }

    void generateQR();
    void loadMembership();
    reset({
      name: profile.name,
      contact_number: profile.contactNumber ?? '',
    });
  }, [profile, reset, router]);

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
        status: data.status ?? 'expired',
      });
    }
  }

  const onSave = async (data: ProfileEditFormData) => {
    if (!profile) return;

    const { error } = await supabase
      .from('profiles')
      .update({ name: data.name, contact_number: data.contact_number || null })
      .eq('id', profile.id);

    if (error) {
      toast.error('Failed to update profile');
      return;
    }

    toast.success('Profile updated!');
    setIsEditing(false);
    router.refresh();
  };

  const handleSignOut = async () => {
    if (isSigningOut) return;
    await signOut();
  };

  const daysLeft = membershipInfo && membershipInfo.status === 'active'
    ? Math.max(0, Math.ceil((new Date(membershipInfo.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  if (!profile) return <PageSkeleton rows={3} height={96} />;

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
          disabled={isSigningOut}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
          style={{ color: 'var(--color-danger)' }}
        >
          <LogOut size={16} />
          {isSigningOut ? 'Signing Out...' : 'Sign Out'}
        </button>
      </div>

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
                onClick={handleSubmit(onSave)}
                disabled={isSubmitting}
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

        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div>
            <label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Name</label>
            {isEditing ? (
              <>
                <input
                  {...register('name')}
                  className="w-full mt-1 px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: 'var(--color-light-gray)', color: 'var(--color-text-primary)' }}
                />
                {errors.name && <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.name.message}</p>}
              </>
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
              <>
                <input
                  {...register('contact_number')}
                  placeholder="09XX XXX XXXX"
                  className="w-full mt-1 px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: 'var(--color-light-gray)', color: 'var(--color-text-primary)' }}
                />
                {errors.contact_number && <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.contact_number.message}</p>}
              </>
            ) : (
              <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {profile.contactNumber || 'Not set'}
              </p>
            )}
          </div>
        </form>
      </div>

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
        {membershipInfo ? (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Plan</span>
              <span className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>{membershipInfo.planName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Status</span>
              <div className="flex items-center gap-2">
                <span
                  className="font-medium text-sm px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: membershipInfo.status === 'active' ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                    color: membershipInfo.status === 'active' ? 'var(--color-success)' : 'var(--color-danger)',
                  }}
                >
                  {membershipInfo.status}
                </span>
                {membershipInfo.status === 'active' && daysLeft !== null && daysLeft <= 7 && (
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}
                  >
                    Expiring soon
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Expires</span>
              <span className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
                {new Date(membershipInfo.endDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Remaining</span>
              <span className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
                {membershipInfo.status === 'active' && daysLeft !== null
                  ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''}`
                  : 'Expired'}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            No membership record found.
          </p>
        )}
      </div>

      <p className="text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
        Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </p>
    </div>
  );
}
