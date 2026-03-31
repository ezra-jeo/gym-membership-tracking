import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const ADMIN_ROLES = new Set(['owner', 'admin', 'staff']);

export async function POST(request: Request) {
  let code = '';

  try {
    const body = (await request.json()) as { code?: unknown };
    if (typeof body.code === 'string') {
      code = body.code.trim();
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'Missing gym code.' }, { status: 400 });
  }

  try {
    code = decodeURIComponent(code).trim();
  } catch {
    // Keep raw value if decode fails.
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
    .select('role')
    .eq('id', currentUser.id)
    .maybeSingle();

  if (!profile || !profile.role || !ADMIN_ROLES.has(profile.role)) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const encodedCode = encodeURIComponent(code);
  revalidatePath(`/gym/${encodedCode}`);
  revalidatePath(`/gym/${encodedCode}/contact`);
  revalidatePath(`/gym/${encodedCode}/pricing`);
  revalidatePath(`/gym/${encodedCode}/locate`);

  return NextResponse.json({ revalidated: true, code });
}
