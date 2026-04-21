import { headers } from 'next/headers';
import { brandColorVars } from '@/lib/brand-color';
import { getGymBrandingById } from '@/lib/gym-member';
import { MemberShell } from '@/components/member/MemberShell';
import type { GymBranding } from '@/lib/gym-member';

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestHeaders = await headers();
  const headerGymId = requestHeaders.get('x-gym-id');
  const headerUserRole = requestHeaders.get('x-user-role');

  let gymBranding: GymBranding | null = null;
  if (headerGymId) {
    gymBranding = await getGymBrandingById(headerGymId);
  }

  const hasServerUser = Boolean(headerUserRole);

  const brandColor = gymBranding?.brand_color ?? '#D4956A';
  const secondaryColor = gymBranding?.secondary_color ?? null;

  return (
    <>
      <style>{`:root { ${brandColorVars(brandColor, secondaryColor)} }`}</style>
      <MemberShell gymBranding={gymBranding} hasServerUser={hasServerUser}>
        {children}
      </MemberShell>
    </>
  );
}