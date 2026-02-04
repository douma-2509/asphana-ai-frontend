'use client';

import type { IntakeFormData } from '@/components/app/intake-summary-form';
import { IntakeSummaryForm } from '@/components/app/intake-summary-form';
import { Button } from '@/components/ui/button';

interface PostCallViewProps {
  intake: IntakeFormData | null;
  onStartNewCall: () => void;
}

export function PostCallView({ intake, onStartNewCall }: PostCallViewProps) {
  return (
    <div className="bg-background flex min-h-svh flex-col overflow-y-auto pt-20 md:pt-24">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 pb-12">
        <h1 className="text-foreground text-2xl font-semibold">Intake summary</h1>
        {intake ? (
          <IntakeSummaryForm form={intake} />
        ) : (
          <p className="text-muted-foreground">No intake data from this session.</p>
        )}
        <Button onClick={onStartNewCall} size="lg" className="w-full sm:w-auto">
          Start new call
        </Button>
      </div>
    </div>
  );
}
