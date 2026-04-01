'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, QrCode, HelpCircle, Building2, X } from 'lucide-react';
import { createClient } from '@/lib/supabase';

const STORAGE_KEY = 'stren-selected-gym';

type SavedGym = {
  id: string;
  name: string;
  code: string;
};

type GymSearchResult = {
  id: string;
  name: string;
  code: string;
  address: string | null;
};

export default function GymSelectPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef(0);

  const [rememberedGym, setRememberedGym] = useState<SavedGym | null>(null);
  const [searchMode, setSearchMode] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GymSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // Load remembered gym from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setRememberedGym(JSON.parse(saved));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Focus input when entering search mode
  useEffect(() => {
    if (searchMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchMode]);

  // Lock body scroll when QR modal is open
  useEffect(() => {
    document.body.style.overflow = qrModalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [qrModalOpen]);

  // Gym search with debounce (reusing existing logic)
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      requestIdRef.current += 1;
      setResults([]);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;
    const requestId = ++requestIdRef.current;
    setIsLoading(true);

    const timeout = setTimeout(async () => {
      const { data, error } = await supabase.rpc('search_gyms', { p_query: trimmed });
      if (isCancelled || requestId !== requestIdRef.current) return;

      if (error) {
        setResults([]);
      } else {
        const nextResults = ((data ?? []) as GymSearchResult[]).slice(0, 5);
        setResults(nextResults);
      }
      setIsLoading(false);
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timeout);
    };
  }, [query, supabase]);

  const handleGymSelect = (gym: GymSearchResult | SavedGym) => {
    // Save to localStorage
    const toSave: SavedGym = { id: gym.id, name: gym.name, code: gym.code };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    
    // Navigate to login with gym
    router.push(`/login?gym=${encodeURIComponent(gym.code)}`);
  };

  const handleEnterSearchMode = () => {
    setSearchMode(true);
  };

  const handleExitSearchMode = () => {
    setSearchMode(false);
    setQuery('');
    setResults([]);
  };

  const showResults = searchMode && query.trim().length >= 2;

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <>
      <div 
        className="min-h-[100dvh] flex flex-col px-6 py-8 relative overflow-hidden"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Large decorative circle - top right */}
          <div 
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full"
            style={{ 
              background: 'radial-gradient(circle, var(--color-primary-glow) 0%, transparent 70%)',
              opacity: 0.6,
            }}
          />
          {/* Medium decorative circle - bottom left */}
          <div 
            className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full"
            style={{ 
              background: 'radial-gradient(circle, var(--color-primary-glow) 0%, transparent 70%)',
              opacity: 0.5,
            }}
          />
          {/* Small accent circle - center left */}
          <div 
            className="absolute top-1/3 -left-16 w-48 h-48 rounded-full"
            style={{ 
              background: 'radial-gradient(circle, var(--color-surface) 0%, transparent 70%)',
              opacity: 0.4,
            }}
          />
        </div>

        {/* Content wrapper with fade-in */}
        <div className="relative z-10 flex flex-col flex-1 animate-in fade-in duration-500">
          {/* Header/Branding Section */}
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Logo with subtle glow */}
            <div className="relative mb-5">
              <div 
                className="absolute inset-0 blur-2xl scale-150"
                style={{ 
                  background: 'var(--color-primary-glow)',
                  opacity: 0.5,
                }}
              />
              <div className="relative w-[120px] h-[120px]">
                <Image
                  src="/stren-logo.png"
                  alt="Stren"
                  fill
                  className="object-contain drop-shadow-lg"
                  priority
                />
              </div>
            </div>
            <h1
              className="text-4xl font-bold"
              style={{
                fontFamily: 'var(--font-heading)',
                color: 'var(--color-primary)',
              }}
            >
              Stren
            </h1>
          </div>

          {/* Action Section */}
          <div className="flex-1 flex flex-col justify-end pb-6">
            {/* Remembered Gym Button */}
            {rememberedGym && !searchMode && (
              <button
                type="button"
                onClick={() => handleGymSelect(rememberedGym)}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-semibold text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mb-3"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-white)',
                  boxShadow: '0 4px 20px rgba(212, 149, 106, 0.35)',
                }}
              >
                <Building2 size={20} />
                <span>{rememberedGym.name}</span>
              </button>
            )}

            {/* Find Your Gym Button / Search Input */}
            {!searchMode ? (
              <button
                type="button"
                onClick={handleEnterSearchMode}
                className="w-full px-6 py-4 rounded-2xl font-semibold text-base border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  borderColor: 'var(--color-surface)',
                  backgroundColor: 'var(--color-white)',
                  color: 'var(--color-text-primary)',
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                }}
              >
                Find your gym
              </button>
            ) : (
              <div className="space-y-3">
                {/* Search Input */}
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--color-text-muted)' }}
                  />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by gym name or code"
                    className="w-full rounded-2xl border-2 pl-11 pr-4 py-4 text-base outline-none transition-all duration-200"
                    style={{
                      backgroundColor: 'var(--color-white)',
                      borderColor: 'var(--color-primary)',
                      color: 'var(--color-text-primary)',
                      boxShadow: '0 4px 20px rgba(212, 149, 106, 0.15)',
                    }}
                  />
                </div>

                {/* Search Results */}
                {showResults && (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {isLoading && (
                      <div
                        className="rounded-2xl border p-4 text-sm"
                        style={{
                          backgroundColor: 'var(--color-white)',
                          borderColor: 'var(--color-surface)',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        Searching gyms...
                      </div>
                    )}

                    {!isLoading && results.map((gym) => (
                      <button
                        key={gym.id}
                        type="button"
                        onClick={() => handleGymSelect(gym)}
                        className="w-full rounded-2xl border p-4 text-left transition-all duration-150 hover:border-[var(--color-primary)] hover:shadow-md active:scale-[0.98]"
                        style={{
                          backgroundColor: 'var(--color-white)',
                          borderColor: 'var(--color-surface)',
                        }}
                      >
                        <p
                          className="text-base font-semibold truncate"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {gym.name}
                        </p>
                        {gym.address && (
                          <p
                            className="text-sm mt-1 truncate"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {gym.address}
                          </p>
                        )}
                      </button>
                    ))}

                    {!isLoading && results.length === 0 && (
                      <div
                        className="rounded-2xl border p-4 text-sm"
                        style={{
                          backgroundColor: 'var(--color-white)',
                          borderColor: 'var(--color-surface)',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        No gyms found. Try a different name or code.
                      </div>
                    )}
                  </div>
                )}

                {/* Cancel Search */}
                <button
                  type="button"
                  onClick={handleExitSearchMode}
                  className="w-full py-3 text-sm font-medium transition-colors duration-150"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Footer Links */}
          {!searchMode && (
            <div className="flex items-center justify-center gap-4 pt-4 pb-2">
              <button
                type="button"
                onClick={() => setQrModalOpen(true)}
                className="flex items-center gap-2 text-sm font-medium transition-colors duration-150 hover:opacity-70"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <QrCode size={16} />
                <span>QR Login</span>
              </button>
              <span style={{ color: 'var(--color-light-gray)' }}>|</span>
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-medium transition-colors duration-150 hover:opacity-70"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <HelpCircle size={16} />
                <span>Need help?</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* QR Login Modal - Slide up from bottom */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          qrModalOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            qrModalOpen ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setQrModalOpen(false)}
        />

        {/* Modal Panel - Slide up */}
        <div
          className={`absolute inset-x-0 bottom-0 transition-transform duration-300 ease-out ${
            qrModalOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ 
            backgroundColor: 'var(--color-background)',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            minHeight: '85vh',
            maxHeight: '95vh',
          }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div 
              className="w-10 h-1 rounded-full"
              style={{ backgroundColor: 'var(--color-light-gray)' }}
            />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3">
            <h2
              className="text-xl font-semibold"
              style={{
                fontFamily: 'var(--font-heading)',
                color: 'var(--color-text-primary)',
              }}
            >
              QR Login
            </h2>
            <button
              type="button"
              onClick={() => setQrModalOpen(false)}
              className="flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-150 hover:bg-black/5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <X size={22} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-12">
            <div 
              className="w-28 h-28 rounded-full flex items-center justify-center mb-8"
              style={{ 
                backgroundColor: 'var(--color-primary-glow)',
                boxShadow: '0 8px 32px rgba(212, 149, 106, 0.2)',
              }}
            >
              <QrCode size={56} style={{ color: 'var(--color-primary)' }} />
            </div>
            
            <h3
              className="text-2xl font-bold mb-4"
              style={{
                fontFamily: 'var(--font-heading)',
                color: 'var(--color-text-primary)',
              }}
            >
              Coming Soon
            </h3>
            
            <p
              className="text-base leading-relaxed max-w-xs mb-8"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Scan your gym&apos;s QR code to instantly log in. This feature is currently in development.
            </p>

            <button
              type="button"
              onClick={() => setQrModalOpen(false)}
              className="px-8 py-3 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
              }}
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
