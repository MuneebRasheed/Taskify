import { create } from 'zustand';
import type { TrackerCardItem } from '../src/components/TrackerCard';

interface GoalState {
  /** Selected cover image index for the current goal flow (GoalPlanner / SelectCoverImage). */
  selectedCoverIndex: number;
  setSelectedCoverIndex: (index: number) => void;
  /** Draft habits for the current goal (self-made flow). */
  draftHabits: TrackerCardItem[];
  /** Draft tasks for the current goal (self-made flow). */
  draftTasks: TrackerCardItem[];
  setDraftHabits: (habits: TrackerCardItem[] | ((prev: TrackerCardItem[]) => TrackerCardItem[])) => void;
  setDraftTasks: (tasks: TrackerCardItem[] | ((prev: TrackerCardItem[]) => TrackerCardItem[])) => void;
  addDraftHabit: (item: TrackerCardItem) => void;
  addDraftTask: (item: TrackerCardItem) => void;
  updateDraftHabit: (index: number, item: TrackerCardItem) => void;
  updateDraftTask: (index: number, item: TrackerCardItem) => void;
  /** Reset draft habits/tasks (e.g. when starting a new self-made goal). */
  resetDraft: () => void;
}

export const useGoalStore = create<GoalState>()((set) => ({
  selectedCoverIndex: 0,
  setSelectedCoverIndex: (index) => set({ selectedCoverIndex: index }),
  draftHabits: [],
  draftTasks: [],
  setDraftHabits: (habits) =>
    set((state) => ({
      draftHabits: typeof habits === 'function' ? habits(state.draftHabits) : habits,
    })),
  setDraftTasks: (tasks) =>
    set((state) => ({
      draftTasks: typeof tasks === 'function' ? tasks(state.draftTasks) : tasks,
    })),
  addDraftHabit: (item) =>
    set((state) => ({ draftHabits: [...state.draftHabits, item] })),
  addDraftTask: (item) =>
    set((state) => ({ draftTasks: [...state.draftTasks, item] })),
  updateDraftHabit: (index, item) =>
    set((state) => ({
      draftHabits: state.draftHabits.map((h, i) => (i === index ? item : h)),
    })),
  updateDraftTask: (index, item) =>
    set((state) => ({
      draftTasks: state.draftTasks.map((t, i) => (i === index ? item : t)),
    })),
  resetDraft: () => set({ draftHabits: [], draftTasks: [] }),
}));
