import { supabase } from '../supabase/client';
import type { ImageSourcePropType } from 'react-native';
import { GOAL_CATEGORIES, type GoalCategory } from '../../components/CategoryModal';

export interface PreMadeGoalItem {
  id: string;
  title: string;
  category: GoalCategory;
  coverIndex: number;
  coverImage: ImageSourcePropType;
  habitsCount: number;
  tasksCount: number;
  userCount: string;
  habits: { title: string; selectedDays: number[]; reminderTime?: string }[];
  tasks: { title: string; dueDate?: string; reminderTime?: string }[];
  note: string;
}

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
  sort_order: number | null;
};

type RawPreMadeGoalItemRow = {
  goal_id: string;
  type: 'habit' | 'task' | string;
  title: string;
  reminder_time: string | null;
  selected_days: unknown;
  due_date: string | null;
  created_at: string | null;
};

type RawGoalRow = {
  id: string;
  title: string;
};

const SELECT_FULL =
  'id, title, category, cover_index, habits_count, tasks_count, user_count, note, sort_order';
const SELECT_BASIC = 'id, title, category, cover_index, habits_count, tasks_count, user_count, note';

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

function normalizeHabits(value: RawPreMadeGoalItemRow[]): PreMadeGoalItem['habits'] {
  return value
    .filter((row) => row.type === 'habit')
    .map((row) => ({
      title: toStringOrEmpty(row.title),
      selectedDays: toNumberArray(row.selected_days),
      reminderTime: typeof row.reminder_time === 'string' ? row.reminder_time : undefined,
    }))
    .filter((item) => item.title.length > 0);
}

function normalizeTasks(value: RawPreMadeGoalItemRow[]): PreMadeGoalItem['tasks'] {
  return value
    .filter((row) => row.type === 'task')
    .map((row) => ({
      title: toStringOrEmpty(row.title),
      dueDate: typeof row.due_date === 'string' ? row.due_date : undefined,
      reminderTime: typeof row.reminder_time === 'string' ? row.reminder_time : undefined,
    }))
    .filter((item) => item.title.length > 0);
}

function coverFromIndex(index: number | null | undefined): { uri: string } {
  const safeIndex = typeof index === 'number' && index >= 0 ? index : 0;
  const fileName = `cover${safeIndex + 1}.png`;
  return {
    uri: `${SUPABASE_URL}/storage/v1/object/public/${COVER_BUCKET}/${encodeURIComponent(fileName)}`,
  };
}

function mapRowToPreMadeGoal(
  row: RawPreMadeGoalRow,
  itemRowsByGoalId: Record<string, RawPreMadeGoalItemRow[]>
): PreMadeGoalItem {
  const category = isGoalCategory(row.category) ? row.category : 'General';
  const goalItems = itemRowsByGoalId[row.id] ?? [];
  const habits = normalizeHabits(goalItems);
  const tasks = normalizeTasks(goalItems);
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
  // 1) Preferred query for full schema from migrations.
  const fullQuery = await supabase
    .from('pre_made_goals')
    .select(SELECT_FULL)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  const rows = (!fullQuery.error ? fullQuery.data : null) as
    | RawPreMadeGoalRow[]
    | null;

  // 2) Fallback for tables created manually in Supabase UI where is_active/sort_order/created_at might not exist yet.
  const basicQuery =
    rows == null
      ? await supabase
          .from('pre_made_goals')
          .select(SELECT_BASIC)
          .order('id', { ascending: true })
      : null;

  if (rows == null && basicQuery?.error) {
    return { error: basicQuery.error.message };
  }

  const preMadeRows =
    rows ??
    ((basicQuery?.data ?? []).map((row) => ({
      ...(row as RawPreMadeGoalRow),
      note: (row as RawPreMadeGoalRow).note ?? '',
      sort_order: null,
    })) as RawPreMadeGoalRow[]);

  const preMadeIds = preMadeRows.map((row) => row.id);
  let itemRowsByGoalId: Record<string, RawPreMadeGoalItemRow[]> = {};
  if (preMadeIds.length > 0) {
    const { data: itemRows } = await supabase
      .from('goal_items')
      .select('goal_id, type, title, reminder_time, selected_days, due_date, created_at')
      .in('goal_id', preMadeIds)
      .order('created_at', { ascending: true });

    itemRowsByGoalId = ((itemRows ?? []) as RawPreMadeGoalItemRow[]).reduce(
      (acc, row) => {
        (acc[row.goal_id] = acc[row.goal_id] ?? []).push(row);
        return acc;
      },
      {} as Record<string, RawPreMadeGoalItemRow[]>
    );
  }

  // Fallback: if template goal_id has no goal_items rows, reuse items from
  // existing goals(source='preMade') with the same title for this user.
  const templateIdsMissingItems = preMadeRows
    .filter((row) => (itemRowsByGoalId[row.id] ?? []).length === 0)
    .map((row) => row.id);

  if (templateIdsMissingItems.length > 0) {
    const missingTemplateRows = preMadeRows.filter((row) =>
      templateIdsMissingItems.includes(row.id)
    );
    const missingTitles = missingTemplateRows.map((row) => row.title);

    const { data: sourceGoals } = await supabase
      .from('goals')
      .select('id, title')
      .eq('source', 'preMade')
      .in('title', missingTitles);

    const sourceGoalRows = (sourceGoals ?? []) as RawGoalRow[];
    const sourceGoalIds = sourceGoalRows.map((g) => g.id);

    if (sourceGoalIds.length > 0) {
      const { data: sourceItemRows } = await supabase
        .from('goal_items')
        .select('goal_id, type, title, reminder_time, selected_days, due_date, created_at')
        .in('goal_id', sourceGoalIds)
        .order('created_at', { ascending: true });

      const sourceItemsByGoalId = ((sourceItemRows ?? []) as RawPreMadeGoalItemRow[]).reduce(
        (acc, row) => {
          (acc[row.goal_id] = acc[row.goal_id] ?? []).push(row);
          return acc;
        },
        {} as Record<string, RawPreMadeGoalItemRow[]>
      );

      const sourceGoalIdByTitle = sourceGoalRows.reduce((acc, row) => {
        if (!acc[row.title]) acc[row.title] = row.id;
        return acc;
      }, {} as Record<string, string>);

      for (const tpl of missingTemplateRows) {
        const sourceGoalId = sourceGoalIdByTitle[tpl.title];
        if (!sourceGoalId) continue;
        const fallbackItems = sourceItemsByGoalId[sourceGoalId] ?? [];
        if (fallbackItems.length > 0) {
          itemRowsByGoalId[tpl.id] = fallbackItems;
        }
      }
    }
  }

  const mapped = preMadeRows.map((row) =>
    mapRowToPreMadeGoal(row, itemRowsByGoalId)
  );
  return { data: mapped };
}
