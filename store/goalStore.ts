import { create } from 'zustand';
import type { TrackerCardItem } from '../src/components/TrackerCard';
import { ImageSourcePropType } from 'react-native';

interface GoalState {
  /** Selected cover image index for the current goal flow (GoalPlanner / SelectCoverImage). */
  selectedCoverIndex: number;
  setSelectedCoverIndex: (index: number) => void;
  /** Cached cover images for instant loading */
  cachedCoverImages: ImageSourcePropType[];
  setCachedCoverImages: (images: ImageSourcePropType[]) => void;
  /** Loading state for cover images */
  coverImagesLoading: boolean;
  setCoverImagesLoading: (loading: boolean) => void;
  /** Draft habits for the current goal (self-made flow). */
  draftHabits: TrackerCardItem[];
  /** Draft tasks for the current goal (self-made flow). */
  draftTasks: TrackerCardItem[];
  /** AI-made habits (for AI-generated goals before saving). */
  aiMadeHabits: TrackerCardItem[];
  /** AI-made tasks (for AI-generated goals before saving). */
  aiMadeTasks: TrackerCardItem[];
  setDraftHabits: (habits: TrackerCardItem[] | ((prev: TrackerCardItem[]) => TrackerCardItem[])) => void;
  setDraftTasks: (tasks: TrackerCardItem[] | ((prev: TrackerCardItem[]) => TrackerCardItem[])) => void;
  setAiMadeHabits: (habits: TrackerCardItem[] | ((prev: TrackerCardItem[]) => TrackerCardItem[])) => void;
  setAiMadeTasks: (tasks: TrackerCardItem[] | ((prev: TrackerCardItem[]) => TrackerCardItem[])) => void;
  addDraftHabit: (item: TrackerCardItem) => void;
  addDraftTask: (item: TrackerCardItem) => void;
  addAiMadeHabit: (item: TrackerCardItem) => void;
  addAiMadeTask: (item: TrackerCardItem) => void;
  updateDraftHabit: (index: number, item: TrackerCardItem) => void;
  updateDraftTask: (index: number, item: TrackerCardItem) => void;
  updateAiMadeHabit: (index: number, item: TrackerCardItem) => void;
  updateAiMadeTask: (index: number, item: TrackerCardItem) => void;
  /** Reset draft habits/tasks (e.g. when starting a new self-made goal). */
  resetDraft: () => void;
  /** Reset AI-made habits/tasks (e.g. when starting a new AI-generated goal). */
  resetAiMade: () => void;
}

export const useGoalStore = create<GoalState>()((set) => ({
  selectedCoverIndex: 0,
  setSelectedCoverIndex: (index) => set({ selectedCoverIndex: index }),
  cachedCoverImages: [],
  setCachedCoverImages: (images) => set({ cachedCoverImages: images }),
  coverImagesLoading: false,
  setCoverImagesLoading: (loading) => set({ coverImagesLoading: loading }),
  draftHabits: [],
  draftTasks: [],
  aiMadeHabits: [],
  aiMadeTasks: [],
  setDraftHabits: (habits) =>
    set((state) => ({
      draftHabits: typeof habits === 'function' ? habits(state.draftHabits) : habits,
    })),
  setDraftTasks: (tasks) =>
    set((state) => ({
      draftTasks: typeof tasks === 'function' ? tasks(state.draftTasks) : tasks,
    })),
  setAiMadeHabits: (habits) =>
    set((state) => ({
      aiMadeHabits: typeof habits === 'function' ? habits(state.aiMadeHabits) : habits,
    })),
  setAiMadeTasks: (tasks) =>
    set((state) => ({
      aiMadeTasks: typeof tasks === 'function' ? tasks(state.aiMadeTasks) : tasks,
    })),
  addDraftHabit: (item) =>
    set((state) => ({ draftHabits: [...state.draftHabits, item] })),
  addDraftTask: (item) =>
    set((state) => ({ draftTasks: [...state.draftTasks, item] })),
  addAiMadeHabit: (item) =>
    set((state) => ({ aiMadeHabits: [...state.aiMadeHabits, item] })),
  addAiMadeTask: (item) =>
    set((state) => ({ aiMadeTasks: [...state.aiMadeTasks, item] })),
  updateDraftHabit: (index, item) =>
    set((state) => ({
      draftHabits: state.draftHabits.map((h, i) => (i === index ? item : h)),
    })),
  updateDraftTask: (index, item) =>
    set((state) => ({
      draftTasks: state.draftTasks.map((t, i) => (i === index ? item : t)),
    })),
  updateAiMadeHabit: (index, item) =>
    set((state) => ({
      aiMadeHabits: state.aiMadeHabits.map((h, i) => (i === index ? item : h)),
    })),
  updateAiMadeTask: (index, item) =>
    set((state) => ({
      aiMadeTasks: state.aiMadeTasks.map((t, i) => (i === index ? item : t)),
    })),
  resetDraft: () => set({ draftHabits: [], draftTasks: [] }),
  resetAiMade: () => set({ aiMadeHabits: [], aiMadeTasks: [] }),
}));
