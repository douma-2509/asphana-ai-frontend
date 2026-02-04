'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { TokenSource } from 'livekit-client';
import { useSession } from '@livekit/components-react';
import { WarningIcon } from '@phosphor-icons/react/dist/ssr';
import type { AppConfig } from '@/app-config';
import { AgentSessionProvider } from '@/components/agents-ui/agent-session-provider';
import { StartAudioButton } from '@/components/agents-ui/start-audio-button';
import type { IntakeFormData } from '@/components/app/intake-summary-form';
import { ViewController } from '@/components/app/view-controller';
import { Toaster } from '@/components/ui/sonner';
import { useAgentErrors } from '@/hooks/useAgentErrors';
import { useDebugMode } from '@/hooks/useDebug';
import { LanguageCode } from './language-selector';

export type SessionMode = 'intake' | 'translation';

const IN_DEVELOPMENT = process.env.NODE_ENV !== 'production';

function AppSetup() {
  useDebugMode({ enabled: IN_DEVELOPMENT });
  useAgentErrors();

  return null;
}

interface AppProps {
  appConfig: AppConfig;
}

export function App({ appConfig }: AppProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('en');
  const [lastRoomName, setLastRoomName] = useState<string | null>(null);
  const [lastIntake, setLastIntake] = useState<IntakeFormData | null>(null);

  const sessionModeRef = useRef<SessionMode>('intake');
  const selectedLanguageRef = useRef(selectedLanguage);
  selectedLanguageRef.current = selectedLanguage;

  const onSessionEnded = useCallback((roomName: string, intake: IntakeFormData | null) => {
    setLastRoomName(roomName);
    setLastIntake(intake);
  }, []);

  const onClearPostCall = useCallback(() => {
    setLastRoomName(null);
    setLastIntake(null);
  }, []);

  const onBeforeStart = useCallback((mode: SessionMode) => {
    sessionModeRef.current = mode;
  }, []);

  const tokenSource = useMemo(() => {
    return TokenSource.custom(async (options) => {
      // Build metadata from refs so we always use current language/mode at request time
      const language = selectedLanguageRef.current;
      const mode = sessionModeRef.current;
      const metadata = JSON.stringify({ language, mode });

      const roomConfig =
        options.agentName ?? appConfig.agentName
          ? {
              agents: [
                {
                  agent_name: options.agentName ?? appConfig.agentName,
                  agentName: options.agentName ?? appConfig.agentName,
                  metadata,
                },
              ],
            }
          : undefined;

      const url =
        typeof process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT === 'string'
          ? new URL(process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT, window.location.origin).toString()
          : '/api/connection-details';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (typeof process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT === 'string' && appConfig.sandboxId) {
        headers['X-Sandbox-Id'] = appConfig.sandboxId ?? '';
      }

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ room_config: roomConfig }),
      });
      if (!res.ok) throw new Error('Failed to get connection details');
      return res.json();
    });
  }, [appConfig.agentName, appConfig.sandboxId]);

  // Pass stable options so the SDK always calls our custom token source callback
  // (otherwise it returns a cached token when options change, e.g. after language change).
  // We build the real metadata from refs inside the callback.
  const session = useSession(
    tokenSource,
    appConfig.agentName
      ? {
          agentName: appConfig.agentName,
          agentMetadata: '', // stable; real language/mode come from refs in callback
        }
      : undefined
  );

  return (
    <AgentSessionProvider session={session}>
      <AppSetup />
      <main className="grid h-svh grid-cols-1 place-content-center">
        <ViewController
          appConfig={appConfig}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          lastRoomName={lastRoomName}
          lastIntake={lastIntake}
          onSessionEnded={onSessionEnded}
          onClearPostCall={onClearPostCall}
          onBeforeStart={onBeforeStart}
        />
      </main>
      <StartAudioButton label="Start Audio" />
      <Toaster
        icons={{
          warning: <WarningIcon weight="bold" />,
        }}
        position="top-center"
        className="toaster group"
        style={
          {
            '--normal-bg': 'var(--popover)',
            '--normal-text': 'var(--popover-foreground)',
            '--normal-border': 'var(--border)',
          } as React.CSSProperties
        }
      />
    </AgentSessionProvider>
  );
}
