'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase';
import { isValidHex } from '@/lib/brand-color';
import { toast } from 'sonner';
import { ExternalLink, Plus, Upload, X } from 'lucide-react';
import { PageSkeleton } from '@/components/ui/loading-screen';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

type HoursState = Record<(typeof DAYS)[number], string>;
type SocialState = { facebook: string; instagram: string; website: string };

function emptyHours(): HoursState {
  return {
    Monday: '',
    Tuesday: '',
    Wednesday: '',
    Thursday: '',
    Friday: '',
    Saturday: '',
    Sunday: '',
  };
}

export default function GymProfilePage() {
  const { profile, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const [gymName, setGymName] = useState('');
  const [gymCode, setGymCode] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [brandColor, setBrandColor] = useState('#D4956A');
  const [brandColorError, setBrandColorError] = useState('');

  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [operatingHours, setOperatingHours] = useState<HoursState>(emptyHours());

  const [amenities, setAmenities] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState('');

  const [socialLinks, setSocialLinks] = useState<SocialState>({
    facebook: '',
    instagram: '',
    website: '',
  });

  useEffect(() => {
    if (authLoading) return;

    if (!profile) {
      router.replace('/login');
      return;
    }

    if (profile.role !== 'owner') {
      router.replace('/admin');
      return;
    }

    if (!profile.gymId) {
      setIsLoading(false);
      return;
    }

    loadGym(profile.gymId);
  }, [authLoading, profile, router]);

  async function loadGym(gymId: string) {
    const { data, error } = await supabase
      .from('gyms')
      .select('id, name, code, tagline, description, brand_color, logo_url, cover_url, operating_hours, amenities, social_links')
      .eq('id', gymId)
      .maybeSingle();

    if (error || !data) {
      toast.error('Unable to load gym profile.');
      setIsLoading(false);
      return;
    }

    setGymName(data.name ?? '');
    setGymCode(data.code ?? '');
    setTagline(data.tagline ?? '');
    setDescription(data.description ?? '');
    setBrandColor(data.brand_color && isValidHex(data.brand_color) ? data.brand_color : '#D4956A');
    setLogoUrl(data.logo_url ?? '');
    setCoverUrl(data.cover_url ?? '');
    setAmenities(data.amenities ?? []);

    const nextHours = emptyHours();
    if (data.operating_hours && typeof data.operating_hours === 'object' && !Array.isArray(data.operating_hours)) {
      const src = data.operating_hours as Record<string, unknown>;
      for (const day of DAYS) {
        const value = src[day];
        nextHours[day] = typeof value === 'string' ? value : '';
      }
    }
    setOperatingHours(nextHours);

    if (data.social_links && typeof data.social_links === 'object' && !Array.isArray(data.social_links)) {
      const src = data.social_links as Record<string, unknown>;
      setSocialLinks({
        facebook: typeof src.facebook === 'string' ? src.facebook : '',
        instagram: typeof src.instagram === 'string' ? src.instagram : '',
        website: typeof src.website === 'string' ? src.website : '',
      });
    }

    setIsLoading(false);
  }

  async function uploadAsset(file: File, kind: 'logo' | 'cover') {
    if (!profile?.gymId) return;

    if (kind === 'logo') setIsUploadingLogo(true);
    if (kind === 'cover') setIsUploadingCover(true);

    const path = `${profile.gymId}/${kind}`;

    const { error } = await supabase.storage
      .from('gym-assets')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (error) {
      toast.error(`Failed to upload ${kind}: ${error.message}`);
      if (kind === 'logo') setIsUploadingLogo(false);
      if (kind === 'cover') setIsUploadingCover(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('gym-assets').getPublicUrl(path);
    if (kind === 'logo') setLogoUrl(urlData.publicUrl);
    if (kind === 'cover') setCoverUrl(urlData.publicUrl);

    toast.success(`${kind === 'logo' ? 'Logo' : 'Cover image'} uploaded`);

    if (kind === 'logo') setIsUploadingLogo(false);
    if (kind === 'cover') setIsUploadingCover(false);
  }

  function addAmenity() {
    const value = amenityInput.trim();
    if (!value) return;
    if (amenities.includes(value)) {
      setAmenityInput('');
      return;
    }
    setAmenities((prev) => [...prev, value]);
    setAmenityInput('');
  }

  function removeAmenity(value: string) {
    setAmenities((prev) => prev.filter((item) => item !== value));
  }

  async function handleSave() {
    if (!profile?.gymId) {
      toast.error('Missing gym context.');
      return;
    }

    if (!gymName.trim() || !gymCode.trim()) {
      toast.error('Gym name and code are required.');
      return;
    }

    const normalizedColor = brandColor.trim().toUpperCase();
    if (!isValidHex(normalizedColor)) {
      setBrandColorError('Brand color must be a valid #RRGGBB value.');
      return;
    }

    setBrandColorError('');
    setIsSaving(true);

    const socialPayload: Record<string, string> = {};
    if (socialLinks.facebook.trim()) socialPayload.facebook = socialLinks.facebook.trim();
    if (socialLinks.instagram.trim()) socialPayload.instagram = socialLinks.instagram.trim();
    if (socialLinks.website.trim()) socialPayload.website = socialLinks.website.trim();

    const { error } = await supabase.from('gyms').update({
      id: profile.gymId,
      name: gymName.trim(),
      code: gymCode.trim(),
      tagline: tagline.trim() || null,
      description: description.trim() || null,
      brand_color: normalizedColor,
      logo_url: logoUrl || null,
      cover_url: coverUrl || null,
      operating_hours: operatingHours,
      amenities: amenities.length > 0 ? amenities : null,
      social_links: Object.keys(socialPayload).length > 0 ? socialPayload : null,
    }).eq('id', profile.gymId);

    if (error) {
      toast.error(`Failed to save gym profile: ${error.message}`);
      setIsSaving(false);
      return;
    }

    toast.success('Gym profile updated successfully.');
    setIsSaving(false);
  }

  const isPublished = tagline.trim().length > 0;

  if (authLoading || isLoading) {
    return <PageSkeleton rows={4} height={96} />;
  }

  if (!profile || profile.role !== 'owner') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
        >
          Gym Page
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Customize your public gym landing page
        </p>
      </div>

      <div
        className="rounded-xl border px-4 py-3"
        style={{
          backgroundColor: isPublished ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
          borderColor: isPublished ? 'var(--color-success)' : 'var(--color-warning)',
        }}
      >
        {isPublished ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Your page is live.
            </p>
            <Link
              href={`/gym/${gymCode}`}
              target="_blank"
              className="text-sm inline-flex items-center gap-1"
              style={{ color: 'var(--color-success)' }}
            >
              View page <ExternalLink size={14} />
            </Link>
          </div>
        ) : (
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Your page is not visible to the public yet. Add a tagline below to publish it.
          </p>
        )}
      </div>

      <section
        className="rounded-xl border p-5 space-y-4"
        style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-surface)' }}
      >
        <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>Basic Info</h2>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Tagline</label>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{tagline.length}/120</span>
          </div>
          <input
            value={tagline}
            maxLength={120}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Your gym's one-liner"
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ borderColor: 'var(--color-surface)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-white)' }}
          />
        </div>

        <div>
          <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell people what makes your gym special"
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none"
            style={{ borderColor: 'var(--color-surface)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-white)' }}
          />
        </div>

        <div>
          <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Brand Color</label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="color"
              value={isValidHex(brandColor) ? brandColor : '#D4956A'}
              onChange={(e) => {
                setBrandColor(e.target.value.toUpperCase());
                setBrandColorError('');
              }}
              className="h-10 w-12 rounded border"
              style={{ borderColor: 'var(--color-surface)' }}
            />
            <input
              value={brandColor}
              onChange={(e) => {
                setBrandColor(e.target.value.toUpperCase());
                setBrandColorError('');
              }}
              placeholder="#D4956A"
              className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ borderColor: 'var(--color-surface)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-white)' }}
            />
            <div
              className="h-10 w-10 rounded-lg border"
              style={{ borderColor: 'var(--color-surface)', backgroundColor: isValidHex(brandColor) ? brandColor : '#D4956A' }}
            />
          </div>
          {brandColorError && (
            <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{brandColorError}</p>
          )}
        </div>
      </section>

      <section
        className="rounded-xl border p-5 space-y-4"
        style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-surface)' }}
      >
        <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>Images</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadAsset(file, 'logo');
            }}
            className="text-sm"
          />
          {isUploadingLogo && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Uploading logo...</p>}
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Gym logo"
              className="h-20 w-20 rounded-full object-cover border"
              style={{ borderColor: 'var(--color-surface)' }}
            />
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Cover Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadAsset(file, 'cover');
            }}
            className="text-sm"
          />
          {isUploadingCover && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Uploading cover image...</p>}
          {coverUrl && (
            <img
              src={coverUrl}
              alt="Gym cover"
              className="h-48 w-full rounded-xl object-cover border"
              style={{ borderColor: 'var(--color-surface)' }}
            />
          )}
        </div>
      </section>

      <section
        className="rounded-xl border p-5"
        style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-surface)' }}
      >
        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Operating Hours</h2>
        <div className="space-y-3">
          {DAYS.map((day) => (
            <div key={day} className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-2 md:gap-3 items-center">
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{day}</span>
              <input
                value={operatingHours[day]}
                onChange={(e) => setOperatingHours((prev) => ({ ...prev, [day]: e.target.value }))}
                placeholder="5:00 AM – 10:00 PM"
                className="rounded-lg border px-3 py-2 text-sm outline-none"
                style={{ borderColor: 'var(--color-surface)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-white)' }}
              />
            </div>
          ))}
        </div>
      </section>

      <section
        className="rounded-xl border p-5"
        style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-surface)' }}
      >
        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Amenities</h2>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={amenityInput}
            onChange={(e) => setAmenityInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addAmenity();
              }
            }}
            placeholder="Add amenity"
            className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ borderColor: 'var(--color-surface)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-white)' }}
          />
          <button
            type="button"
            onClick={addAmenity}
            className="inline-flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-medium"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-white)' }}
          >
            <Plus size={14} /> Add
          </button>
        </div>

        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {amenities.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: 'var(--color-primary-glow)', color: 'var(--color-primary)' }}
              >
                {item}
                <button type="button" onClick={() => removeAmenity(item)}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      <section
        className="rounded-xl border p-5"
        style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-surface)' }}
      >
        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Social Links</h2>

        <div className="space-y-3">
          <div>
            <label className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Facebook URL</label>
            <input
              value={socialLinks.facebook}
              onChange={(e) => setSocialLinks((prev) => ({ ...prev, facebook: e.target.value }))}
              placeholder="https://facebook.com/your-gym"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ borderColor: 'var(--color-surface)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-white)' }}
            />
          </div>
          <div>
            <label className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Instagram URL</label>
            <input
              value={socialLinks.instagram}
              onChange={(e) => setSocialLinks((prev) => ({ ...prev, instagram: e.target.value }))}
              placeholder="https://instagram.com/your-gym"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ borderColor: 'var(--color-surface)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-white)' }}
            />
          </div>
          <div>
            <label className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Website URL</label>
            <input
              value={socialLinks.website}
              onChange={(e) => setSocialLinks((prev) => ({ ...prev, website: e.target.value }))}
              placeholder="https://yourgym.com"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ borderColor: 'var(--color-surface)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-white)' }}
            />
          </div>
        </div>
      </section>

      <div className="pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-lg px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-white)' }}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
