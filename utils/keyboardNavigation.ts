import { Platform } from 'react-native';
import { useEffect } from 'react';
import { router } from 'expo-router';

export const KEY_CODES = {
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  SPACE: ' ',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

export type KeyCode = typeof KEY_CODES[keyof typeof KEY_CODES];

export interface KeyboardShortcut {
  key: KeyCode;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardNavigation = (
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
) => {
  useEffect(() => {
    if (Platform.OS !== 'web' || !enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const matchingShortcut = shortcuts.find(shortcut => {
        return (
          shortcut.key === event.key &&
          (shortcut.ctrl === undefined || shortcut.ctrl === event.ctrlKey) &&
          (shortcut.alt === undefined || shortcut.alt === event.altKey) &&
          (shortcut.shift === undefined || shortcut.shift === event.shiftKey) &&
          (shortcut.meta === undefined || shortcut.meta === event.metaKey)
        );
      });

      if (matchingShortcut) {
        event.preventDefault();
        event.stopPropagation();
        matchingShortcut.action();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [shortcuts, enabled]);
};

export const useEscapeKey = (onEscape: () => void, enabled: boolean = true) => {
  useEffect(() => {
    if (Platform.OS !== 'web' || !enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === KEY_CODES.ESCAPE) {
        event.preventDefault();
        onEscape();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [onEscape, enabled]);
};

export const useEnterKey = (onEnter: () => void, enabled: boolean = true) => {
  useEffect(() => {
    if (Platform.OS !== 'web' || !enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === KEY_CODES.ENTER) {
        event.preventDefault();
        onEnter();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [onEnter, enabled]);
};

export const globalShortcuts: KeyboardShortcut[] = [
  {
    key: 'h',
    ctrl: true,
    description: 'Go to Home',
    action: () => router.push('/home'),
  },
  {
    key: 'p',
    ctrl: true,
    description: 'Go to Profile',
    action: () => router.push('/profile'),
  },
  {
    key: 'l',
    ctrl: true,
    description: 'Go to Leaderboard',
    action: () => router.push('/leaderboard'),
  },
  {
    key: 'q',
    ctrl: true,
    description: 'Go to Quests',
    action: () => router.push('/quests'),
  },
  {
    key: 't',
    ctrl: true,
    description: 'Go to Tasks',
    action: () => router.push('/tasks'),
  },
  {
    key: 's',
    ctrl: true,
    description: 'Go to Settings',
    action: () => router.push('/settings'),
  },
  {
    key: 'k',
    ctrl: true,
    description: 'Search',
    action: () => router.push('/search'),
  },
  {
    key: '/',
    description: 'Search',
    action: () => router.push('/search'),
  },
  {
    key: KEY_CODES.ESCAPE,
    description: 'Go back',
    action: () => router.back(),
  },
];

export const getKeyboardShortcutsHelp = (): string => {
  return globalShortcuts
    .map(shortcut => {
      const modifiers = [];
      if (shortcut.ctrl) modifiers.push('Ctrl');
      if (shortcut.alt) modifiers.push('Alt');
      if (shortcut.shift) modifiers.push('Shift');
      if (shortcut.meta) modifiers.push('Cmd');
      
      const keyCombo = [...modifiers, shortcut.key.toUpperCase()].join('+');
      return `${keyCombo.padEnd(20)} - ${shortcut.description}`;
    })
    .join('\n');
};

export const useFocusManagement = () => {
  const focusFirst = () => {
    if (Platform.OS !== 'web') return;
    
    if (typeof document !== 'undefined') {
      const firstFocusable = document.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      firstFocusable?.focus();
    }
  };

  const trapFocus = (containerElement: HTMLElement) => {
    if (Platform.OS !== 'web') return () => {};

    const focusableElements = containerElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== KEY_CODES.TAB) return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    containerElement.addEventListener('keydown', handleTabKey);

    return () => {
      containerElement.removeEventListener('keydown', handleTabKey);
    };
  };

  return { focusFirst, trapFocus };
};
