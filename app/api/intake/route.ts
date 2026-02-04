import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const TABLE = 'patient_intakes';

export const revalidate = 0;

/**
 * GET /api/intake?roomName=...
 * Returns stored intake for the given room, or 404.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roomName = searchParams.get('roomName');
    if (!roomName) {
      return NextResponse.json({ error: 'roomName query is required' }, { status: 400 });
    }
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from(TABLE)
      .select('intake, updated_at')
      .eq('room_name', roomName)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Intake GET error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json(null, { status: 404 });
    }
    return NextResponse.json(data.intake);
  } catch (e) {
    if (e instanceof Error && e.message.includes('Missing Supabase')) {
      return NextResponse.json({ error: 'Intake persistence not configured' }, { status: 503 });
    }
    throw e;
  }
}

/**
 * POST /api/intake
 * Body: { roomName: string, intake: object }
 * Upserts intake for the room (by room_name).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const roomName = body?.roomName;
    const intake = body?.intake;
    if (typeof roomName !== 'string' || roomName === '') {
      return NextResponse.json({ error: 'roomName is required' }, { status: 400 });
    }
    if (intake === undefined || intake === null) {
      return NextResponse.json({ error: 'intake is required' }, { status: 400 });
    }
    const supabase = getSupabaseServer();
    const { error } = await supabase.from(TABLE).upsert(
      {
        room_name: roomName,
        intake,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'room_name',
      }
    );

    if (error) {
      console.error('Intake POST error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message.includes('Missing Supabase')) {
      return NextResponse.json({ error: 'Intake persistence not configured' }, { status: 503 });
    }
    throw e;
  }
}
