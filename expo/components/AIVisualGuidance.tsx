import React from 'react';
import { useUltimateAICoach } from '@/contexts/UltimateAICoachContext';
import AITutorialSystem from './AITutorialSystem';

export default function AIVisualGuidance() {
  const { activeTutorial, dismissTutorial, highlightElement, dismissHighlight } = useUltimateAICoach();

  return (
    <AITutorialSystem
      tutorial={activeTutorial}
      onDismiss={dismissTutorial}
      onHighlightElement={highlightElement}
      onDismissHighlight={dismissHighlight}
    />
  );
}
