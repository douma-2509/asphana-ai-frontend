import * as React from 'react';
import {
  Body,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';

/**
 * Intake form shape for email (matches IntakeFormData / PatientIntakeForm).
 */
export interface IntakeSummaryEmailProps {
  intake: {
    patient?: Record<string, unknown>;
    emergency_contact?: Record<string, unknown>;
    medical_history?: Record<string, unknown>;
    medications?: Record<string, unknown>;
    allergies?: Record<string, unknown>;
    vaccinations?: Record<string, unknown>;
  };
  roomName?: string;
}

function formatValue(value: unknown): string {
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.length ? value.join(', ') : '—';
  return String(value);
}

function EmailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Section style={sectionStyle}>
      <Text style={headingStyle}>{title}</Text>
      {children}
    </Section>
  );
}

function EmailField({ label, value }: { label: string; value?: unknown }) {
  const display = formatValue(value);
  return (
    <Row style={rowStyle}>
      <Column style={labelStyle}>{label}</Column>
      <Column style={valueStyle}>{display}</Column>
    </Row>
  );
}

const rowStyle: React.CSSProperties = {
  marginBottom: '4px',
};

export function IntakeSummaryEmail({ intake, roomName }: IntakeSummaryEmailProps) {
  const patient = intake?.patient ?? {};
  const emergency = intake?.emergency_contact ?? {};
  const medical = intake?.medical_history ?? {};
  const medications = intake?.medications ?? {};
  const allergies = intake?.allergies ?? {};
  const vaccinations = intake?.vaccinations ?? {};

  const medicalEntries = Object.entries(medical).filter(([, v]) => v != null && v !== '');
  const medicationEntries = Object.entries(medications).filter(
    ([, v]) => v != null && v !== '' && (Array.isArray(v) ? v.length > 0 : true)
  );
  const allergyEntries = Object.entries(allergies).filter(([, v]) => v != null && v !== '');
  const vaccinationEntries = Object.entries(vaccinations).filter(([, v]) => v != null && v !== '');

  const patientName = [patient.first_name, patient.last_name].filter(Boolean).join(' ') || '—';

  return (
    <Html>
      <Head />
      <Preview>Intake summary – {roomName ?? 'Session'}</Preview>
      <Body style={bodyStyle}>
        <Heading as="h1" style={titleStyle}>
          Intake Summary
        </Heading>
        {roomName && (
          <Text style={metaStyle}>
            <strong>Room:</strong> {roomName}
          </Text>
        )}
        <Text style={metaStyle}>
          <strong>Patient:</strong> {patientName}
        </Text>
        <Hr style={hrStyle} />

        <EmailSection title="Patient">
          <EmailField label="First name" value={patient.first_name} />
          <EmailField label="Last name" value={patient.last_name} />
          <EmailField label="Date of birth" value={patient.date_of_birth} />
          <EmailField label="Address" value={patient.address} />
          <EmailField label="City" value={patient.city} />
          <EmailField label="State" value={patient.state} />
          <EmailField label="ZIP" value={patient.zip_code} />
          <EmailField label="Phone" value={patient.phone_home} />
          <EmailField label="Email" value={patient.email} />
          <EmailField label="Gender" value={patient.gender} />
          <EmailField label="Language" value={patient.language} />
          <EmailField label="Race" value={patient.race} />
          <EmailField label="Marital status" value={patient.marital_status} />
          <EmailField label="Referred by" value={patient.referred_by} />
        </EmailSection>

        <EmailSection title="Emergency contact">
          <EmailField label="Name" value={emergency.name} />
          <EmailField label="Phone" value={emergency.phone} />
          <EmailField label="Relation" value={emergency.relation} />
        </EmailSection>

        {medicalEntries.length > 0 && (
          <EmailSection title="Medical history">
            {medicalEntries.map(([key, val]) => (
              <EmailField
                key={key}
                label={key.replace(/_/g, ' ')}
                value={typeof val === 'string' ? val : String(val)}
              />
            ))}
          </EmailSection>
        )}

        {medicationEntries.length > 0 && (
          <EmailSection title="Medications">
            {medicationEntries.map(([key, val]) => (
              <EmailField
                key={key}
                label={key.replace(/_/g, ' ')}
                value={Array.isArray(val) ? (val.length ? val.join(', ') : '—') : String(val)}
              />
            ))}
          </EmailSection>
        )}

        {allergyEntries.length > 0 && (
          <EmailSection title="Allergies">
            {allergyEntries.map(([key, val]) => (
              <EmailField
                key={key}
                label={key.replace(/_/g, ' ')}
                value={typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
              />
            ))}
          </EmailSection>
        )}

        {vaccinationEntries.length > 0 && (
          <EmailSection title="Vaccinations">
            {vaccinationEntries.map(([key, val]) => (
              <EmailField
                key={key}
                label={key.replace(/_/g, ' ')}
                value={typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
              />
            ))}
          </EmailSection>
        )}

        <Hr style={hrStyle} />
        <Text style={footerStyle}>This intake was submitted via voice session.</Text>
      </Body>
    </Html>
  );
}

const bodyStyle: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: '24px',
};

const titleStyle: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 600,
  marginBottom: '8px',
};

const metaStyle: React.CSSProperties = {
  color: '#525f7f',
  fontSize: '14px',
  margin: '4px 0',
};

const hrStyle: React.CSSProperties = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const sectionStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  marginBottom: '16px',
  padding: '20px',
};

const headingStyle: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: 600,
  letterSpacing: '0.5px',
  marginBottom: '12px',
  textTransform: 'uppercase',
};

const labelStyle: React.CSSProperties = {
  color: '#525f7f',
  fontSize: '13px',
  fontWeight: 500,
  padding: '4px 0',
  width: '140px',
};

const valueStyle: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '13px',
  padding: '4px 0',
};

const footerStyle: React.CSSProperties = {
  color: '#8898aa',
  fontSize: '12px',
  marginTop: '16px',
};
