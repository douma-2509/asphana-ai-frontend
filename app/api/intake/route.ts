import { NextResponse } from 'next/server';
import type { IntakeFormData } from '@/components/app/intake-summary-form';
import { sendIntakeNotification } from '@/lib/intake-email';
import { getSupabaseServer } from '@/lib/supabase-server';

const TABLE = 'patient_intakes';

/**
 * Email deduplication requires column patient_intakes.notification_sent_at.
 * Run: frontend/supabase/migrations/20250201000000_add_notification_sent_at.sql
 * (or add the column manually in Supabase dashboard)
 */

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

    let notifyEmail: string | null = null;
    const { data: configRow } = await supabase
      .from('notification_config')
      .select('intake_notify_email')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (configRow?.intake_notify_email?.trim()) {
      notifyEmail = configRow.intake_notify_email.trim();
    }
    if (!notifyEmail) {
      console.log('No notification email configured');
    } else {
      console.log('Notification email configured:', notifyEmail);
    }

    // Only send email once per room (avoids duplicate when both agent and frontend POST)
    let shouldSendEmail = true;
    const { data: row, error: selectErr } = await supabase
      .from(TABLE)
      .select('notification_sent_at')
      .eq('room_name', roomName)
      .limit(1)
      .maybeSingle();

    if (!selectErr && row != null && row.notification_sent_at != null) {
      shouldSendEmail = false;
    }

    if (shouldSendEmail && notifyEmail) {
      try {
        await sendIntakeNotification(intake as IntakeFormData, roomName, { to: notifyEmail });
        await supabase
          .from(TABLE)
          .update({ notification_sent_at: new Date().toISOString() })
          .eq('room_name', roomName);
      } catch (emailErr) {
        console.error('Intake email notification failed:', emailErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message.includes('Missing Supabase')) {
      return NextResponse.json({ error: 'Intake persistence not configured' }, { status: 503 });
    }
    throw e;
  }
}
