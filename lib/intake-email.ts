import { Resend } from 'resend';
import type { IntakeFormData } from '@/components/app/intake-summary-form';
import { IntakeSummaryEmail } from '@/emails/intake-summary-email';

const DEFAULT_FROM = 'Onboarding <onboarding@resend.dev>';

/**
 * Sends an intake summary notification email. No-op if RESEND_API_KEY or
 * INTAKE_NOTIFY_EMAIL is missing. On failure, logs and does not throw.
 */
export async function sendIntakeNotification(
  intake: IntakeFormData,
  roomName: string,
  options?: { to?: string }
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = options?.to;
  if (!apiKey || !to) {
    console.warn('[intake-email] Skipping email: RESEND_API_KEY or INTAKE_NOTIFY_EMAIL is not set');
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM;
  const patient = intake?.patient;
  const patientName =
    patient?.first_name || patient?.last_name
      ? [patient.first_name, patient.last_name].filter(Boolean).join(' ').trim()
      : null;
  const subject = patientName
    ? `Intake summary – ${patientName} (${roomName})`
    : `Intake summary – ${roomName}`;

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      react: IntakeSummaryEmail({ intake, roomName }),
    });

    if (error) {
      console.error('[intake-email] Resend error:', error);
    }
  } catch (err) {
    console.error('[intake-email] Failed to send:', err);
  }
}
