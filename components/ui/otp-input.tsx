'use client';

import { OTPInput, type SlotProps } from 'input-otp';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
  error?: string;
  disabled?: boolean;
}

function Slot({ char, hasFakeCaret, isActive }: SlotProps) {
  return (
    <div
      className={cn(
        'relative h-14 w-12 flex items-center justify-center',
        'text-xl font-bold rounded-xl border-2 transition-all',
        isActive ? 'border-(--color-primary) shadow-sm' : 'border-(--color-light-gray)'
      )}
      style={{
        backgroundColor: 'var(--color-white)',
        color: 'var(--color-text-primary)',
      }}
    >
      {char ?? ''}
      {hasFakeCaret && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-px h-6 animate-caret-blink" style={{ backgroundColor: 'var(--color-primary)' }} />
        </div>
      )}
    </div>
  );
}

export function OtpInput({ value, onChange, error, disabled }: OtpInputProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <OTPInput
        maxLength={6}
        value={value}
        onChange={onChange}
        disabled={disabled}
        containerClassName="flex gap-3 justify-center"
        render={({ slots }) => (
          <>
            {slots.map((slot, i) => (
              <Slot key={i} {...slot} />
            ))}
          </>
        )}
      />
      {error && (
        <p className="text-sm text-center" style={{ color: 'var(--color-danger)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
