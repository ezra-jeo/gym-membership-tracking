import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { rateLimit } from '@/lib/rate-limit';
import { getGymPublicByCode } from '@/lib/gym-public';
import { getGymBrandingById } from '@/lib/gym-member';

const ADMIN_ROLES = new Set(['owner', 'admin', 'staff']);

function msSince(start: number): number {
  return Number((performance.now() - start).toFixed(2));
}

export async function GET(request: Request) {
  const ip = (await headers()).get('x-forwarded-for') ?? 'unknown';
  const { success } = rateLimit(`cache-health:${ip}`, 30, 60_000);
  if (!success) {
    return Response.json({ error: 'Too many requests' }, { status: 429 });
  }

  const supabase = await createServerSupabaseClient();

  let currentUser: { id: string } | null = null;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!userError && user) {
    currentUser = { id: user.id };
  } else {
    const authHeader = request.headers.get('authorization') ?? '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : '';

    if (token) {
      const {
        data: { user: bearerUser },
        error: bearerError,
      } = await supabase.auth.getUser(token);

      if (!bearerError && bearerUser) {
        currentUser = { id: bearerUser.id };
      }
    }
  }

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, gym_id')
    .eq('id', currentUser.id)
    .maybeSingle();

  if (!profile || !profile.role || !ADMIN_ROLES.has(profile.role)) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const url = new URL(request.url);
  let gymCode = (url.searchParams.get('code') ?? '').trim();

  if (!gymCode && profile.gym_id) {
    const { data: gymRow } = await supabase
      .from('gyms')
      .select('code')
      .eq('id', profile.gym_id)
      .maybeSingle();

    gymCode = (gymRow?.code ?? '').trim();
  }

  if (!gymCode) {
    return NextResponse.json(
      { error: 'Missing gym code. Provide ?code=... or ensure your profile has a gym_id.' },
      { status: 400 },
    );
  }

  const publicFirstStart = performance.now();
  const publicFirst = await getGymPublicByCode(gymCode);
  const publicFirstMs = msSince(publicFirstStart);

  const publicSecondStart = performance.now();
  const publicSecond = await getGymPublicByCode(gymCode);
  const publicSecondMs = msSince(publicSecondStart);

  const gymId = publicFirst.data?.id ?? null;

  let brandingFirstMs: number | null = null;
  let brandingSecondMs: number | null = null;

  if (gymId) {
    const brandingFirstStart = performance.now();
    await getGymBrandingById(gymId);
    brandingFirstMs = msSince(brandingFirstStart);

    const brandingSecondStart = performance.now();
    await getGymBrandingById(gymId);
    brandingSecondMs = msSince(brandingSecondStart);
  }

  const response = NextResponse.json({
    ok: true,
    checkedAt: new Date().toISOString(),
    gymCode,
    resolvedGymId: gymId,
    publicCache: {
      firstMs: publicFirstMs,
      secondMs: publicSecondMs,
      secondCallFasterOrEqual: publicSecondMs <= publicFirstMs,
      hasData: !!publicFirst.data && !!publicSecond.data,
    },
    brandingCache: gymId
      ? {
          firstMs: brandingFirstMs,
          secondMs: brandingSecondMs,
          secondCallFasterOrEqual: (brandingSecondMs ?? 0) <= (brandingFirstMs ?? 0),
        }
      : null,
  });

  response.headers.set('Cache-Control', 'no-store');
  return response;
}
