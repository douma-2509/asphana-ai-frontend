'use client';

import { useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useSessionContext } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import type { IntakeFormData } from '@/components/app/intake-summary-form';
import { PostCallView } from '@/components/app/post-call-view';
import { SessionView } from '@/components/app/session-view';
import { WelcomeView } from '@/components/app/welcome-view';
import type { SessionMode } from './app';
import { LanguageCode } from './language-selector';

//const MotionWelcomeView = motion.create(WelcomeView);
const MotionSessionView = motion.create(SessionView);
const MotionPostCallView = motion.create(PostCallView);

const VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
    },
    hidden: {
      opacity: 0,
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.5,
    ease: 'linear',
  },
};

interface ViewControllerProps {
  appConfig: AppConfig;
  selectedLanguage: LanguageCode;
  setSelectedLanguage: (language: LanguageCode) => void;
  lastRoomName: string | null;
  lastIntake: IntakeFormData | null;
  onSessionEnded: (roomName: string, intake: IntakeFormData | null) => void;
  onClearPostCall: () => void;
  onBeforeStart: (mode: SessionMode) => void;
}

export function ViewController({
  appConfig,
  selectedLanguage,
  setSelectedLanguage,
  lastRoomName,
  lastIntake,
  onSessionEnded,
  onClearPostCall,
  onBeforeStart,
}: ViewControllerProps) {
  const { isConnected, start } = useSessionContext();

  const handleStartCall = useCallback(() => {
    onBeforeStart('intake');
    start();
  }, [onBeforeStart, start]);

  const handleStartTranslation = useCallback(() => {
    onBeforeStart('translation');
    start();
  }, [onBeforeStart, start]);

  return (
    <AnimatePresence mode="wait">
      {/* Post-call view: show after disconnect when we have session-ended data */}
      {!isConnected && lastRoomName != null && (
        <MotionPostCallView
          key="post-call"
          {...VIEW_MOTION_PROPS}
          intake={lastIntake}
          onStartNewCall={onClearPostCall}
        />
      )}
      {/* Welcome view: show when not connected and no post-call data */}
      {!isConnected && lastRoomName == null && (
        <motion.div key="welcome" {...VIEW_MOTION_PROPS}>
          <WelcomeView
            startButtonText={appConfig.startButtonText}
            translationButtonText={appConfig.translationButtonText ?? 'Translation'}
            onStartCall={handleStartCall}
            onStartTranslation={handleStartTranslation}
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />
        </motion.div>
      )}
      {/* Session view */}
      {isConnected && (
        <MotionSessionView
          key="session-view"
          {...VIEW_MOTION_PROPS}
          appConfig={appConfig}
          onSessionEnded={onSessionEnded}
        />
      )}
    </AnimatePresence>
  );
}
