import React, { createContext, useContext, useState, useCallback } from 'react';

export type GoalSource = 'aiMade' | 'preMade' | 'selfMade';

export type GoalItemType = 'habit' | 'task';

export interface GoalItem {
  id: string;
  type: GoalItemType;
  title: string;
  reminderTime?: string;
}

export interface SavedGoal {
  id: string;
  title: string;
  coverIndex: number;
  source: GoalSource;
  habitsTotal: number;
  habitsDone: number;
  tasksTotal: number;
  tasksDone: number;
  dueDate: Date | null;
  achieved: boolean;
  createdAt: number;
  /** Habits and tasks for this goal; used on Home to show checklist per date */
  items?: GoalItem[];
}

/** itemId -> list of date strings (YYYY-MM-DD) when that item was completed */
export type ItemCompletions = Record<string, string[]>;

interface GoalsContextValue {
  goals: SavedGoal[];
  /** Per-item completion by date; key = item.id, value = ['2026-02-22', ...] */
  itemCompletions: ItemCompletions;
  addGoal: (goal: Omit<SavedGoal, 'id' | 'createdAt'>) => void;
  markAchieved: (id: string, achieved: boolean) => void;
  updateProgress: (id: string, habitsDone: number, tasksDone: number) => void;
  /** Toggle completion of an item for a given date (YYYY-MM-DD). */
  toggleItemCompletion: (itemId: string, dateStr: string) => void;
  /** Get completion count for a date: { total, completed } from all goals' items. */
  getCompletionForDate: (dateStr: string) => { total: number; completed: number };
}

const GoalsContext = createContext<GoalsContextValue | null>(null);

let nextId = 1;
function generateId() {
  return `goal-${Date.now()}-${nextId++}`;
}

let nextItemId = 1;
function generateItemId() {
  return `item-${Date.now()}-${nextItemId++}`;
}

export function GoalsProvider({ children }: { children: React.ReactNode }) {
  const [goals, setGoals] = useState<SavedGoal[]>([]);
  const [itemCompletions, setItemCompletions] = useState<ItemCompletions>({});

  const addGoal = useCallback((goal: Omit<SavedGoal, 'id' | 'createdAt'>) => {
    const id = generateId();
    const items = goal.items?.map((it) => ({
      ...it,
      id: it.id || generateItemId(),
    }));
    setGoals((prev) => [
      ...prev,
      {
        ...goal,
        id,
        createdAt: Date.now(),
        items: items ?? [],
      },
    ]);
  }, []);

  const markAchieved = useCallback((id: string, achieved: boolean) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, achieved } : g))
    );
  }, []);

  const updateProgress = useCallback((id: string, habitsDone: number, tasksDone: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, habitsDone, tasksDone } : g
      )
    );
  }, []);

  const toggleItemCompletion = useCallback((itemId: string, dateStr: string) => {
    setItemCompletions((prev) => {
      const list = prev[itemId] ?? [];
      const has = list.includes(dateStr);
      if (has) {
        const next = list.filter((d) => d !== dateStr);
        if (next.length === 0) {
          const { [itemId]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [itemId]: next };
      }
      return { ...prev, [itemId]: [...list, dateStr] };
    });
  }, []);

  const getCompletionForDate = useCallback(
    (dateStr: string) => {
      let total = 0;
      let completed = 0;
      goals.forEach((g) => {
        (g.items ?? []).forEach((it) => {
          total += 1;
          const list = itemCompletions[it.id] ?? [];
          if (list.includes(dateStr)) completed += 1;
        });
      });
      return { total, completed };
    },
    [goals, itemCompletions]
  );

  return (
    <GoalsContext.Provider
      value={{
        goals,
        itemCompletions,
        addGoal,
        markAchieved,
        updateProgress,
        toggleItemCompletion,
        getCompletionForDate,
      }}
    >
      {children}
    </GoalsContext.Provider>
  );
}

export function useGoals() {
  const ctx = useContext(GoalsContext);
  if (!ctx) throw new Error('useGoals must be used within GoalsProvider');
  return ctx;
}
