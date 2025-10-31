import createContextHook from '@nkzw/create-context-hook';
import { useMemo } from 'react';
import { useUser } from './UserContext';
import { useTasks } from './TasksContext';
import { useEconomy } from './EconomyContext';

export const [AppProvider, useApp] = createContextHook(() => {
  const userContext = useUser();
  const tasksContext = useTasks();
  const economyContext = useEconomy();

  return useMemo(() => ({
    ...userContext,
    ...tasksContext,
    ...economyContext,
  }), [userContext, tasksContext, economyContext]);
});
