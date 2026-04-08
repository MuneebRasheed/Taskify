import { supabase } from '../supabase/client';
import type { PreMadeGoalItem } from '../../data/preMadeGoals';
import { GOAL_CATEGORIES, type GoalCategory } from '../../components/CategoryModal';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const COVER_BUCKET = 'covers';

type RawPreMadeGoalRow = {
  id: string;
  title: string;
  category: string;
  cover_index: number | null;
  habits_count: number | null;
  tasks_count: number | null;
  user_count: string | null;
  note: string | null;
  habits: unknown;
  tasks: unknown;
  sort_order: number | null;
};

function isGoalCategory(value: string): value is GoalCategory {
  return (GOAL_CATEGORIES as readonly string[]).includes(value);
}

function toStringOrEmpty(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function toNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.filter((day): day is number => typeof day === 'number');
}

function normalizeHabits(value: unknown): PreMadeGoalItem['habits'] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => !!item && typeof item === 'object')
    .map((item) => {
      const row = item as Record<string, unknown>;
      return {
        title: toStringOrEmpty(row.title),
        selectedDays: toNumberArray(row.selectedDays),
        reminderTime: typeof row.reminderTime === 'string' ? row.reminderTime : undefined,
      };
    })
    .filter((item) => item.title.length > 0);
}

function normalizeTasks(value: unknown): PreMadeGoalItem['tasks'] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => !!item && typeof item === 'object')
    .map((item) => {
      const row = item as Record<string, unknown>;
      return {
        title: toStringOrEmpty(row.title),
        dueDate: typeof row.dueDate === 'string' ? row.dueDate : undefined,
        reminderTime: typeof row.reminderTime === 'string' ? row.reminderTime : undefined,
      };
    })
    .filter((item) => item.title.length > 0);
}

function coverFromIndex(index: number | null | undefined): { uri: string } {
  const safeIndex = typeof index === 'number' && index >= 0 ? index : 0;
  const fileName = `cover${safeIndex + 1}.png`;
  return {
    uri: `${SUPABASE_URL}/storage/v1/object/public/${COVER_BUCKET}/${encodeURIComponent(fileName)}`,
  };
}

function mapRowToPreMadeGoal(row: RawPreMadeGoalRow): PreMadeGoalItem {
  const category = isGoalCategory(row.category) ? row.category : 'General';
  const habits = normalizeHabits(row.habits);
  const tasks = normalizeTasks(row.tasks);
  return {
    id: row.id,
    title: row.title,
    category,
    coverIndex: typeof row.cover_index === 'number' && row.cover_index >= 0 ? row.cover_index : 0,
    coverImage: coverFromIndex(row.cover_index),
    habitsCount: row.habits_count ?? habits.length,
    tasksCount: row.tasks_count ?? tasks.length,
    userCount: row.user_count ?? '+0 users',
    habits,
    tasks,
    note: row.note ?? '',
  };
}

export async function fetchPreMadeGoals(): Promise<{ data?: PreMadeGoalItem[]; error?: string }> {
  const { data, error } = await supabase
    .from('pre_made_goals')
    .select(
      'id, title, category, cover_index, habits_count, tasks_count, user_count, note, habits, tasks, sort_order'
    )
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    return { error: error.message };
  }

  const mapped = (data ?? []).map((row) => mapRowToPreMadeGoal(row as RawPreMadeGoalRow));
  return { data: mapped };
}
