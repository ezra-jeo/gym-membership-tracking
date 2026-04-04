import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const secretKey = process.env.CRON_SECRET;

  if (!secretKey) {
    console.error('[CRON] CRON_SECRET not configured');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid authorization header' },
      { status: 401 }
    );
  }

  const token = authHeader.slice(7);
  if (token !== secretKey) {
    return NextResponse.json(
      { error: 'Invalid authorization token' },
      { status: 401 }
    );
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[CRON] Missing Supabase credentials');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createSupabaseClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });

    console.log(`[CRON] Starting daily notifications job at ${new Date().toISOString()}`);

    const { data, error } = await supabase.rpc('process_daily_notifications');

    if (error) {
      console.error('[CRON] Function error:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          duration: `${Date.now() - startTime}ms`
        },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    console.log(`[CRON] Job completed successfully in ${duration}ms`);
    console.log('[CRON] Result:', data);

    return NextResponse.json(
      {
        success: true,
        message: 'Notifications processed successfully',
        data,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[CRON] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`
      },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  return NextResponse.json(
    {
      message: 'Notification cron endpoint',
      status: 'ready',
      method: 'POST with Bearer token required'
    },
    { status: 200 }
  );
}
