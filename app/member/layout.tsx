import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { brandColorVars } from '@/lib/brand-color';
import { getGymBrandingById } from '@/lib/gym-member';
import { MemberShell } from '@/components/member/MemberShell';
import type { GymBranding } from '@/lib/gym-member';

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let gymBranding: GymBranding | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('gym_id')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.gym_id) {
      gymBranding = await getGymBrandingById(profile.gym_id);
    }
  }

  const brandColor = gymBranding?.brand_color ?? '#D4956A';

  return (
    <>
      <style>{`:root { ${brandColorVars(brandColor)} }`}</style>
      <MemberShell gymBranding={gymBranding} hasServerUser={!!user}>
        {children}
      </MemberShell>
    </>
  );
}