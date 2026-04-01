'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, QrCode, HelpCircle, Building2 } from 'lucide-react';
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
    <div 
      className="min-h-[100dvh] flex flex-col px-6 py-8 animate-in fade-in duration-500"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* Header/Branding Section */}
      <div className="flex-1 flex flex-col items-center justify-center pt-8">
        <div className="relative w-20 h-20 mb-4">
          <Image
            src="/stren-logo.png"
            alt="Stren"
            fill
            className="object-contain"
            priority
          />
        </div>
        <h1
          className="text-3xl font-bold"
          style={{
            fontFamily: 'var(--font-heading)',
            color: 'var(--color-primary)',
          }}
        >
          Stren
        </h1>
      </div>

      {/* Action Section */}
      <div className="flex-1 flex flex-col justify-end pb-8">
        {/* Remembered Gym Button */}
        {rememberedGym && !searchMode && (
          <button
            type="button"
            onClick={() => handleGymSelect(rememberedGym)}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mb-3"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-white)',
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
            className="w-full px-6 py-4 rounded-xl font-semibold text-base border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              borderColor: 'var(--color-surface)',
              backgroundColor: 'var(--color-white)',
              color: 'var(--color-text-primary)',
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
                className="w-full rounded-xl border-2 pl-11 pr-4 py-4 text-base outline-none transition-all duration-200"
                style={{
                  backgroundColor: 'var(--color-white)',
                  borderColor: 'var(--color-primary)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>

            {/* Search Results */}
            {showResults && (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {isLoading && (
                  <div
                    className="rounded-xl border p-4 text-sm"
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
                    className="w-full rounded-xl border p-4 text-left transition-all duration-150 hover:border-[var(--color-primary)] active:scale-[0.98]"
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
                    className="rounded-xl border p-4 text-sm"
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
          <a
            href="/qr-login"
            className="flex items-center gap-2 text-sm font-medium transition-colors duration-150 hover:opacity-70"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <QrCode size={16} />
            <span>QR Login</span>
          </a>
          <span style={{ color: 'var(--color-text-muted)' }}>|</span>
          <a
            href="#"
            className="flex items-center gap-2 text-sm font-medium transition-colors duration-150 hover:opacity-70"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <HelpCircle size={16} />
            <span>Need help?</span>
          </a>
        </div>
      )}
    </div>
  );
}
