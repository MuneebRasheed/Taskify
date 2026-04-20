import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '../lib/auth/AuthProvider';
import * as goalsApi from '../lib/api/goalsApi';

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
  category?: string | null;
  reminderDate?: Date | null;
  reminderTime?: string | null;
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

/** Get weekday index from YYYY-MM-DD: 0 = Monday, 6 = Sunday */
export function getDayIndexFromDateStr(dateStr: string): number {
  const d = new Date(dateStr + 'T12:00:00').getDay();
  return d === 0 ? 6 : d - 1;
}

/** Parse task dueDate display string to YYYY-MM-DD for comparison, or null if unparseable */
export function parseTaskDueDateToYYYYMMDD(dueDateStr: string): string | null {
  if (!dueDateStr || typeof dueDateStr !== 'string') return null;
  const s = dueDateStr.trim();
  const isoMatch = /^\d{4}-\d{2}-\d{2}$/.exec(s);
  if (isoMatch) return s;
  let toParse = s;
  const afterComma = s.includes(',') ? s.split(',').pop()?.trim() : null;
  if (afterComma && /^[A-Za-z]{3}\s+\d{1,2},?\s*\d{4}$/.test(afterComma)) toParse = afterComma;
  const ddmmy = /^(\d{1,2})\s+([A-Za-z]{3}),?\s*(\d{4})$/.exec(toParse);
  if (ddmmy) toParse = `${ddmmy[2]} ${ddmmy[1]}, ${ddmmy[3]}`;
  const t = Date.parse(toParse);
  if (Number.isNaN(t)) return null;
  const date = new Date(t);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** True if item should appear on the given date (habit: that weekday; task: due that day) */
export function isItemScheduledForDate(item: GoalItem, dateStr: string): boolean {
  if (item.type === 'habit') {
    const days = item.selectedDays ?? [];
    if (days.length === 0) return true;
    const dayIndex = getDayIndexFromDateStr(dateStr);
    return days.includes(dayIndex);
  }
  if (item.type === 'task') {
    const due = item.dueDate ? parseTaskDueDateToYYYYMMDD(item.dueDate) : null;
    if (!due) return false;
    return due === dateStr;
  }
  return false;
}

/** Goal due date as YYYY-MM-DD, or null if goal has no due date */
export function getGoalDueDateStr(goal: SavedGoal): string | null {
  const d = goal.dueDate;
  if (d == null) return null;
  const date = typeof d === 'number' ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * True if this item should appear on the given date.
 * When the goal has a due date: item shows only on that exact date.
 * When the goal has no due date: use item-level schedule (habit weekdays, task due date).
 */
export function isItemScheduledForDateWithGoal(
  goal: SavedGoal,
  item: GoalItem,
  dateStr: string
): boolean {
  const goalDueStr = getGoalDueDateStr(goal);
  if (goalDueStr != null) return dateStr === goalDueStr;
  return isItemScheduledForDate(item, dateStr);
}

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

function apiGoalToSavedGoal(g: goalsApi.GoalsPayload['goals'][0]): SavedGoal {
  return {
    id: g.id,
    title: g.title,
    category: g.category ?? null,
    reminderDate: g.reminderDate != null ? new Date(g.reminderDate) : null,
    reminderTime: g.reminderTime ?? null,
    coverIndex: g.coverIndex,
    source: g.source as GoalSource,
    habitsTotal: g.habitsTotal,
    habitsDone: g.habitsDone,
    tasksTotal: g.tasksTotal,
    tasksDone: g.tasksDone,
    dueDate: g.dueDate != null ? new Date(g.dueDate) : null,
    achieved: g.achieved,
    createdAt: g.createdAt,
    items: (g.items ?? []).map((it) => ({
      id: it.id,
      type: it.type as GoalItemType,
      title: it.title,
      reminderTime: it.reminderTime,
      note: it.note,
      selectedDays: it.selectedDays,
      dueDate: it.dueDate,
      paused: it.paused ?? false,
    })),
  };
}

export function GoalsProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [goals, setGoals] = useState<SavedGoal[]>([]);
  const [itemCompletions, setItemCompletions] = useState<ItemCompletions>({});

  useEffect(() => {
    const token = session?.access_token;
    console.log('[GoalsContext] fetch effect — hasSession:', !!session, 'hasToken:', !!token);
    if (!token) return;
    console.log('[GoalsContext] calling fetchGoals...');
    goalsApi.fetchGoals(token).then(({ data, error }) => {
      console.log('[GoalsContext] fetchGoals response — error:', error ?? null, 'goalsCount:', data?.goals?.length ?? 0, 'itemCompletionsKeys:', data?.itemCompletions ? Object.keys(data.itemCompletions).length : 0);
      if (error) {
        console.warn('[GoalsContext] fetchGoals failed:', error);
        return;
      }
      if (data?.goals) {
        setGoals(data.goals.map(apiGoalToSavedGoal));
        console.log('[GoalsContext] setGoals:', data.goals.length, 'goals');
      }
      if (data?.itemCompletions) {
        setItemCompletions(data.itemCompletions);
        console.log('[GoalsContext] setItemCompletions:', Object.keys(data.itemCompletions).length, 'items');
      }
    });
  }, [session?.access_token]);

  const addGoal = useCallback((goal: Omit<SavedGoal, 'id' | 'createdAt'>): string => {
    const id = generateId();
    const items = goal.items?.map((it) => ({
      ...it,
      // Always re-key item ids to avoid collisions from template/static ids.
      id: generateItemId(),
    }));
    const newGoal: SavedGoal = {
      ...goal,
      id,
      createdAt: Date.now(),
      items: items ?? [],
    };
    // Insert newest goal at the front so it appears at the top of My Goals.
    setGoals((prev) => [newGoal, ...prev]);

    const token = session?.access_token;
    if (token) {
      const dueDate =
        goal.dueDate != null
          ? goal.dueDate instanceof Date
            ? goal.dueDate.getTime()
            : (goal.dueDate as unknown as number)
          : null;
      goalsApi
        .createGoal(token, {
          id,
          title: newGoal.title,
          category: newGoal.category ?? null,
          reminderDate:
            newGoal.reminderDate instanceof Date
              ? newGoal.reminderDate.getTime()
              : null,
          reminderTime: newGoal.reminderTime ?? null,
          coverIndex: newGoal.coverIndex,
          source: newGoal.source,
          habitsTotal: newGoal.habitsTotal,
          habitsDone: newGoal.habitsDone,
          tasksTotal: newGoal.tasksTotal,
          tasksDone: newGoal.tasksDone,
          dueDate,
          achieved: newGoal.achieved,
          createdAt: newGoal.createdAt,
          items: (newGoal.items ?? []).map((it) => ({
            id: it.id,
            type: it.type,
            title: it.title,
            reminderTime: it.reminderTime,
            note: it.note,
            selectedDays: it.selectedDays,
            dueDate: it.dueDate,
            paused: it.paused,
          })),
        })
        .then(({ error }) => {
          if (error) {
            console.warn('[GoalsContext] createGoal failed:', error);
            setGoals((prev) => prev.filter((g) => g.id !== id));
            // Server-side goal creation now rolls back atomically when item creation fails.
            // Keep client rollback local only to avoid noisy "Goal not found" follow-up warnings.
          }
        });
    }
    return id;
  }, [session?.access_token]);

  const markAchieved = useCallback(
    (id: string, achieved: boolean) => {
      setGoals((prev) => {
        const next = prev.map((g) => (g.id === id ? { ...g, achieved } : g));
        const token = session?.access_token;
        if (token) {
          goalsApi.updateGoal(token, id, { achieved }).then(({ error }) => {
            if (error) {
              console.warn('[GoalsContext] updateGoal (markAchieved) failed:', error);
              setGoals((current) =>
                current.map((g) => (g.id === id ? { ...g, achieved: !achieved } : g))
              );
            }
          });
        }
        return next;
      });
    },
    [session?.access_token]
  );

  const updateProgress = useCallback(
    (id: string, habitsDone: number, tasksDone: number) => {
      setGoals((prev) => {
        const prevGoal = prev.find((g) => g.id === id);
        const next = prev.map((g) =>
          g.id === id ? { ...g, habitsDone, tasksDone } : g
        );
        const token = session?.access_token;
        if (token) {
          goalsApi.updateGoal(token, id, { habitsDone, tasksDone }).then(({ error }) => {
            if (error && prevGoal) {
              console.warn('[GoalsContext] updateGoal (updateProgress) failed:', error);
              setGoals((current) =>
                current.map((g) =>
                  g.id === id
                    ? { ...g, habitsDone: prevGoal.habitsDone, tasksDone: prevGoal.tasksDone }
                    : g
                )
              );
            }
          });
        }
        return next;
      });
    },
    [session?.access_token]
  );

  const removeGoal = useCallback(
    (id: string) => {
      const goalToRemove = goals.find((g) => g.id === id);
      const itemIds = new Set((goalToRemove?.items ?? []).map((it) => it.id));
      const prevCompletionsForGoal: ItemCompletions = {};
      itemIds.forEach((itemId) => {
        if (itemCompletions[itemId]) prevCompletionsForGoal[itemId] = itemCompletions[itemId];
      });
      setGoals((prev) => prev.filter((g) => g.id !== id));
      setItemCompletions((prev) => {
        if (itemIds.size === 0) return prev;
        const next = { ...prev };
        itemIds.forEach((itemId) => delete next[itemId]);
        return next;
      });
      const token = session?.access_token;
      if (token) {
        goalsApi.deleteGoal(token, id).then(({ error }) => {
          if (error && goalToRemove) {
            console.warn('[GoalsContext] deleteGoal failed:', error);
            setGoals((prev) => [...prev, goalToRemove]);
            setItemCompletions((prev) => ({ ...prev, ...prevCompletionsForGoal }));
          }
        });
      }
    },
    [goals, itemCompletions, session?.access_token]
  );

  const toggleItemCompletion = useCallback(
    (itemId: string, dateStr: string, goalId?: string) => {
      const token = session?.access_token;
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
        if (token) {
          const prevSnapshot = prev;
          goalsApi.toggleCompletion(token, itemId, dateStr).then(({ error }) => {
            if (error) {
              console.warn('[GoalsContext] toggleCompletion failed:', error);
              setItemCompletions(() => prevSnapshot);
              if (goalId) {
                setGoals((gPrev) =>
                  gPrev.map((g) => {
                    if (g.id !== goalId || !g.items) return g;
                    const habitIds = g.items.filter((i) => i.type === 'habit').map((i) => i.id);
                    const taskIds = g.items.filter((i) => i.type === 'task').map((i) => i.id);
                    const habitsDone = habitIds.filter((id) => (prevSnapshot[id] ?? []).includes(dateStr)).length;
                    const tasksDone = taskIds.filter((id) => (prevSnapshot[id] ?? []).includes(dateStr)).length;
                    return { ...g, habitsDone, tasksDone };
                  })
                );
              }
            }
          });
        }
        return next;
      });
    },
    [session?.access_token]
  );

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
          if (!isItemScheduledForDateWithGoal(g, it, dateStr)) return;
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
