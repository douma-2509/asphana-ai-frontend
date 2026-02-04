'use client';

/**
 * Read-only display of intake form data (matches backend PatientIntakeForm shape).
 */
export interface IntakeFormData {
  patient?: {
    first_name?: string;
    last_name?: string;
    middle_initial?: string;
    date_of_birth?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    phone_home?: string;
    email?: string;
    gender?: string;
    language?: string;
    race?: string;
    marital_status?: string;
    referred_by?: string;
  };
  emergency_contact?: {
    name?: string;
    phone?: string;
    relation?: string;
  };
  medical_history?: Record<string, unknown>;
  medications?: Record<string, unknown>;
  allergies?: Record<string, unknown>;
  vaccinations?: Record<string, unknown>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-muted/30 border-border rounded-lg border p-4">
      <h3 className="text-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
        {title}
      </h3>
      <div className="text-muted-foreground grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  className,
}: {
  label: string;
  value?: string | null;
  className?: string;
}) {
  const display = value != null && value !== '' ? String(value) : '—';
  return (
    <div className={className}>
      <dt className="text-muted-foreground font-medium">{label}</dt>
      <dd className="text-foreground mt-0.5">{display}</dd>
    </div>
  );
}

export function IntakeSummaryForm({ form }: { form: IntakeFormData }) {
  const patient = form?.patient ?? {};
  const emergency = form?.emergency_contact ?? {};
  const medical = form?.medical_history ?? {};
  const medications = form?.medications ?? {};
  const allergies = form?.allergies ?? {};
  const vaccinations = form?.vaccinations ?? {};

  const medicalEntries = Object.entries(medical).filter(([, v]) => v != null && v !== '');
  const medicationEntries = Object.entries(medications).filter(
    ([, v]) => v != null && v !== '' && (Array.isArray(v) ? v.length > 0 : true)
  );
  const allergyEntries = Object.entries(allergies).filter(([, v]) => v != null && v !== '');
  const vaccinationEntries = Object.entries(vaccinations).filter(([, v]) => v != null && v !== '');

  return (
    <div className="flex flex-col gap-6">
      <Section title="Patient">
        <Field label="First name" value={patient.first_name} />
        <Field label="Last name" value={patient.last_name} />
        <Field label="Date of birth" value={patient.date_of_birth} />
        <Field label="Address" value={patient.address} />
        <Field label="City" value={patient.city} />
        <Field label="State" value={patient.state} />
        <Field label="ZIP" value={patient.zip_code} />
        <Field label="Phone" value={patient.phone_home} />
        <Field label="Email" value={patient.email} />
        <Field label="Gender" value={patient.gender} />
        <Field label="Language" value={patient.language} />
        <Field label="Race" value={patient.race} />
        <Field label="Marital status" value={patient.marital_status} />
        <Field label="Referred by" value={patient.referred_by} />
      </Section>
      <Section title="Emergency contact">
        <Field label="Name" value={emergency.name} />
        <Field label="Phone" value={emergency.phone} />
        <Field label="Relation" value={emergency.relation} />
      </Section>
      {medicalEntries.length > 0 && (
        <Section title="Medical history">
          {medicalEntries.map(([key, val]) => (
            <Field
              key={key}
              label={key.replace(/_/g, ' ')}
              value={typeof val === 'string' ? val : String(val)}
            />
          ))}
        </Section>
      )}
      {medicationEntries.length > 0 && (
        <Section title="Medications">
          {medicationEntries.map(([key, val]) =>
            Array.isArray(val) ? (
              <Field
                key={key}
                label={key.replace(/_/g, ' ')}
                value={val.length ? val.join(', ') : '—'}
              />
            ) : (
              <Field key={key} label={key.replace(/_/g, ' ')} value={String(val)} />
            )
          )}
        </Section>
      )}
      {allergyEntries.length > 0 && (
        <Section title="Allergies">
          {allergyEntries.map(([key, val]) => (
            <Field
              key={key}
              label={key.replace(/_/g, ' ')}
              value={typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
            />
          ))}
        </Section>
      )}
      {vaccinationEntries.length > 0 && (
        <Section title="Vaccinations">
          {vaccinationEntries.map(([key, val]) => (
            <Field
              key={key}
              label={key.replace(/_/g, ' ')}
              value={typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
            />
          ))}
        </Section>
      )}
    </div>
  );
}
