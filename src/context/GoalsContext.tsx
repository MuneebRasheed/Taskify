import React, { createContext, useContext, useState, useCallback } from 'react';

export type GoalSource = 'aiMade' | 'preMade' | 'selfMade';

export type GoalItemType = 'habit' | 'task';

export interface GoalItem {
  id: string;
  type: GoalItemType;
  title: string;
  reminderTime?: string;
  note?: string;
  /** Habit: day indices 0=Mon … 6=Sun */
  selectedDays?: number[];
  /** Task: display string e.g. "Today, Dec 22, 2024" */
  dueDate?: string;
  /** Habit: paused state */
  paused?: boolean;
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
  addGoal: (goal: Omit<SavedGoal, 'id' | 'createdAt'>) => string;
  markAchieved: (id: string, achieved: boolean) => void;
  updateProgress: (id: string, habitsDone: number, tasksDone: number) => void;
  /** Remove a goal by id (and clear its item completions). */
  removeGoal: (id: string) => void;
  /** Toggle completion of an item for a given date (YYYY-MM-DD). If goalId is provided, updates that goal's habitsDone/tasksDone. */
  toggleItemCompletion: (itemId: string, dateStr: string, goalId?: string) => void;
  /** Remove a single habit or task from a goal. */
  removeGoalItem: (goalId: string, itemId: string) => void;
  /** Update a goal item's fields (title, reminderTime, note, selectedDays, dueDate, paused). */
  updateGoalItem: (goalId: string, itemId: string, updates: Partial<Pick<GoalItem, 'title' | 'reminderTime' | 'note' | 'selectedDays' | 'dueDate' | 'paused'>>) => void;
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

  const addGoal = useCallback((goal: Omit<SavedGoal, 'id' | 'createdAt'>): string => {
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
    return id;
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

  const removeGoal = useCallback((id: string) => {
    const goalToRemove = goals.find((g) => g.id === id);
    const itemIds = new Set((goalToRemove?.items ?? []).map((it) => it.id));
    setGoals((prev) => prev.filter((g) => g.id !== id));
    setItemCompletions((prev) => {
      if (itemIds.size === 0) return prev;
      const next = { ...prev };
      itemIds.forEach((itemId) => delete next[itemId]);
      return next;
    });
  }, [goals]);

  const toggleItemCompletion = useCallback((itemId: string, dateStr: string, goalId?: string) => {
    setItemCompletions((prev) => {
      const list = prev[itemId] ?? [];
      const has = list.includes(dateStr);
      const nextList = has ? list.filter((d) => d !== dateStr) : [...list, dateStr];
      const next: ItemCompletions =
        nextList.length === 0 && has
          ? (() => {
              const { [itemId]: _, ...rest } = prev;
              return rest;
            })()
          : { ...prev, [itemId]: nextList };
      if (goalId) {
        setGoals((gPrev) => {
          const goal = gPrev.find((g) => g.id === goalId);
          if (!goal?.items) return gPrev;
          const habitIds = goal.items.filter((i) => i.type === 'habit').map((i) => i.id);
          const taskIds = goal.items.filter((i) => i.type === 'task').map((i) => i.id);
          const habitsDone = habitIds.filter((id) => (next[id] ?? []).includes(dateStr)).length;
          const tasksDone = taskIds.filter((id) => (next[id] ?? []).includes(dateStr)).length;
          return gPrev.map((g) => (g.id === goalId ? { ...g, habitsDone, tasksDone } : g));
        });
      }
      return next;
    });
  }, []);

  const removeGoalItem = useCallback((goalId: string, itemId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal?.items) return;
    const item = goal.items.find((i) => i.id === itemId);
    if (!item) return;
    const wasHabit = item.type === 'habit';
    const todayStr = new Date().toISOString().slice(0, 10);
    const wasCompletedToday = (itemCompletions[itemId] ?? []).includes(todayStr);
    setItemCompletions((prev) => {
      const { [itemId]: _, ...rest } = prev;
      return rest;
    });
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const newItems = (g.items ?? []).filter((i) => i.id !== itemId);
        const habitsTotal = newItems.filter((i) => i.type === 'habit').length;
        const tasksTotal = newItems.filter((i) => i.type === 'task').length;
        let habitsDone = g.habitsDone;
        let tasksDone = g.tasksDone;
        if (wasHabit) {
          habitsDone = wasCompletedToday ? Math.max(0, g.habitsDone - 1) : g.habitsDone;
        } else {
          tasksDone = wasCompletedToday ? Math.max(0, g.tasksDone - 1) : g.tasksDone;
        }
        return {
          ...g,
          items: newItems,
          habitsTotal,
          tasksTotal,
          habitsDone,
          tasksDone,
        };
      })
    );
  }, [goals, itemCompletions]);

  const updateGoalItem = useCallback((goalId: string, itemId: string, updates: Partial<Pick<GoalItem, 'title' | 'reminderTime' | 'note' | 'selectedDays' | 'dueDate' | 'paused'>>) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId || !g.items) return g;
        return {
          ...g,
          items: g.items.map((i) => (i.id === itemId ? { ...i, ...updates } : i)),
        };
      })
    );
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
        removeGoal,
        toggleItemCompletion,
        removeGoalItem,
        updateGoalItem,
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
