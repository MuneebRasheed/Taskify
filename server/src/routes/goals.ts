// server/src/routes/goals.ts

import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { getAuthenticatedUser } from '../lib/auth';

const router = Router();
const supabaseUrl = process.env.SUPABASE_URL ?? '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

function getAdminClient() {
  return createClient(supabaseUrl, supabaseServiceRoleKey);
}

/**
 * GET /goals
 * Returns all goals for the authenticated user with their items and item_completions.
 */
router.get('/', async (req: Request, res: Response) => {
  const { user, error } = await getAuthenticatedUser(req, res);
  if (error) return;

  const admin = getAdminClient();
  const userId = user!.id;

  const { data: goalsRows, error: goalsErr } = await admin
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (goalsErr) {
    res.status(500).json({ error: 'Failed to load goals' });
    return;
  }

  const goals = goalsRows ?? [];
  const goalIds = goals.map((g: { id: string }) => g.id);
  if (goalIds.length === 0) {
    res.json({ goals: [], itemCompletions: {} });
    return;
  }

  const { data: itemsRows, error: itemsErr } = await admin
    .from('goal_items')
    .select('*')
    .in('goal_id', goalIds);

  if (itemsErr) {
    res.status(500).json({ error: 'Failed to load goal items' });
    return;
  }

  const itemsByGoal = (itemsRows ?? []).reduce((acc: Record<string, unknown[]>, row: { goal_id: string }) => {
    (acc[row.goal_id] = acc[row.goal_id] ?? []).push(row);
    return acc;
  }, {});

  const { data: compRows, error: compErr } = await admin
    .from('item_completions')
    .select('item_id, completion_date')
    .eq('user_id', userId);

  if (compErr) {
    res.status(500).json({ error: 'Failed to load completions' });
    return;
  }

  const itemCompletions: Record<string, string[]> = {};
  (compRows ?? []).forEach((r: { item_id: string; completion_date: string }) => {
    if (!itemCompletions[r.item_id]) itemCompletions[r.item_id] = [];
    itemCompletions[r.item_id].push(r.completion_date);
  });

  const goalsPayload = goals.map((g: Record<string, unknown>) => ({
    id: g.id,
    title: g.title,
    coverIndex: g.cover_index,
    source: g.source,
    habitsTotal: g.habits_total,
    habitsDone: g.habits_done,
    tasksTotal: g.tasks_total,
    tasksDone: g.tasks_done,
    dueDate: g.due_date ? new Date(g.due_date as string).getTime() : null,
    achieved: g.achieved,
    createdAt: g.created_at,
    items: (itemsByGoal[g.id as string] ?? []).map((it: Record<string, unknown>) => ({
      id: it.id,
      type: it.type,
      title: it.title,
      reminderTime: it.reminder_time ?? undefined,
      note: it.note ?? undefined,
      selectedDays: it.selected_days ?? undefined,
      dueDate: it.due_date ?? undefined,
      paused: it.paused ?? false,
    })),
  }));

  res.json({ goals: goalsPayload, itemCompletions });
});

/**
 * POST /goals
 * Body: { title, coverIndex, source, dueDate, achieved, items: [{ id, type, title, ... }] }
 */
router.post('/', async (req: Request, res: Response) => {
  const { user, error } = await getAuthenticatedUser(req, res);
  if (error) return;

  const admin = getAdminClient();
  const userId = user!.id;
  const body = req.body ?? {};
  const id = body.id ?? `goal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const goalRow = {
    id,
    user_id: userId,
    title: body.title ?? 'Untitled',
    cover_index: body.coverIndex ?? 0,
    source: body.source ?? 'selfMade',
    habits_total: body.habitsTotal ?? 0,
    habits_done: body.habitsDone ?? 0,
    tasks_total: body.tasksTotal ?? 0,
    tasks_done: body.tasksDone ?? 0,
    due_date: body.dueDate ? new Date(body.dueDate).toISOString() : null,
    achieved: body.achieved ?? false,
    created_at: body.createdAt ?? Date.now(),
  };

  const { error: goalErr } = await admin.from('goals').insert(goalRow);
  if (goalErr) {
    console.error('[goals] POST /goals insert failed:', goalErr.message, goalErr.details);
    res.status(500).json({ error: 'Failed to create goal', details: goalErr.message });
    return;
  }

  const items = body.items ?? [];
  if (items.length > 0) {
    const ts = Date.now();
    const rows = items.map((it: Record<string, unknown>, index: number) => ({
      id: it.id ?? `item-${ts}-${index}-${Math.random().toString(36).slice(2, 9)}`,
      goal_id: id,
      type: it.type ?? 'task',
      title: it.title ?? '',
      reminder_time: it.reminderTime ?? null,
      note: it.note ?? null,
      selected_days: it.selectedDays ?? null,
      due_date: it.dueDate ?? null,
      paused: it.paused ?? false,
    }));
    const { error: itemsErr } = await admin.from('goal_items').insert(rows);
    if (itemsErr) {
      console.error('[goals] POST /goals goal_items insert failed:', itemsErr.message, itemsErr.details);
      res.status(500).json({ error: 'Failed to create goal items', details: itemsErr.message });
      return;
    }
  }

  const created = {
    ...goalRow,
    dueDate: goalRow.due_date ? new Date(goalRow.due_date).getTime() : null,
    createdAt: goalRow.created_at,
    items: items.map((it: Record<string, unknown>) => ({
      id: it.id,
      type: it.type,
      title: it.title,
      reminderTime: it.reminderTime,
      note: it.note,
      selectedDays: it.selectedDays,
      dueDate: it.dueDate,
      paused: it.paused,
    })),
  };
  res.status(201).json(created);
});

/**
 * PATCH /goals/:id
 * Body: partial goal (e.g. achieved, habitsDone, tasksDone)
 */
router.patch('/:id', async (req: Request, res: Response) => {
  const { user, error } = await getAuthenticatedUser(req, res);
  if (error) return;

  const admin = getAdminClient();
  const { id } = req.params;
  const body = req.body ?? {};

  const { data: existing } = await admin.from('goals').select('user_id').eq('id', id).single();
  if (!existing || existing.user_id !== user!.id) {
    res.status(404).json({ error: 'Goal not found' });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (body.achieved !== undefined) updates.achieved = body.achieved;
  if (body.habitsDone !== undefined) updates.habits_done = body.habitsDone;
  if (body.tasksDone !== undefined) updates.tasks_done = body.tasksDone;
  if (body.title !== undefined) updates.title = body.title;
  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: 'No updates provided' });
    return;
  }
  updates.updated_at = new Date().toISOString();

  const { error: updErr } = await admin.from('goals').update(updates).eq('id', id);
  if (updErr) {
    res.status(500).json({ error: 'Failed to update goal' });
    return;
  }
  res.json({ success: true });
});

/**
 * DELETE /goals/:id
 */
router.delete('/:id', async (req: Request, res: Response) => {
  const { user, error } = await getAuthenticatedUser(req, res);
  if (error) return;

  const admin = getAdminClient();
  const { id } = req.params;

  const { data: existing } = await admin.from('goals').select('user_id').eq('id', id).single();
  if (!existing || existing.user_id !== user!.id) {
    res.status(404).json({ error: 'Goal not found' });
    return;
  }

  const { data: goalItemRows } = await admin.from('goal_items').select('id').eq('goal_id', id);
  const itemIds = (goalItemRows ?? []).map((r: { id: string }) => r.id);
  if (itemIds.length > 0) {
    await admin.from('item_completions').delete().eq('user_id', user!.id).in('item_id', itemIds);
  }
  const { error: delErr } = await admin.from('goals').delete().eq('id', id);
  if (delErr) {
    console.error('[goals] DELETE /goals failed:', delErr.message);
    res.status(500).json({ error: 'Failed to delete goal' });
    return;
  }
  res.status(204).send();
});

/**
 * POST /goals/complete
 * Body: { itemId, date } — date = YYYY-MM-DD. Toggles completion.
 */
router.post('/complete', async (req: Request, res: Response) => {
  const { user, error } = await getAuthenticatedUser(req, res);
  if (error) return;

  const admin = getAdminClient();
  const userId = user!.id;
  const { itemId, date } = req.body ?? {};
  if (!itemId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: 'itemId and date (YYYY-MM-DD) required' });
    return;
  }

  const { data: existing } = await admin
    .from('item_completions')
    .select('id')
    .eq('user_id', userId)
    .eq('item_id', itemId)
    .eq('completion_date', date)
    .maybeSingle();

  if (existing) {
    await admin.from('item_completions').delete().eq('user_id', userId).eq('item_id', itemId).eq('completion_date', date);
    res.json({ completed: false });
  } else {
    await admin.from('item_completions').insert({ user_id: userId, item_id: itemId, completion_date: date });
    res.json({ completed: true });
  }
});

export default router;