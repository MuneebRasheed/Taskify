// server/src/routes/goals.ts

import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { getAuthenticatedUser } from '../lib/auth';
import { 
  scheduleGoalReminder, 
  scheduleGoalDue, 
  scheduleHabitReminders, 
  scheduleTaskDue,
  cancelGoalNotifications 
} from '../services/notificationScheduler';
import { convertLocalToUTC } from '../services/timezoneHelper';

const router = Router();
const supabaseUrl = process.env.SUPABASE_URL ?? '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

function getAdminClient() {
  return createClient(supabaseUrl, supabaseServiceRoleKey);
}

/**
 * Format a Date object as YYYY-MM-DD without timezone conversion.
 * This preserves the calendar date regardless of the device's timezone.
 */
function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD date string to a timestamp at local midnight.
 * Avoids timezone shift by not parsing as UTC.
 */
function parseDateStringToTimestamp(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).getTime();
}

function parseUserCountText(value: string): number {
  const text = value.trim();
  const m = text.match(/([\d.]+)\s*([KMB])?/i);
  if (!m) return 0;
  const base = Number(m[1]);
  if (Number.isNaN(base)) return 0;
  const unit = (m[2] ?? '').toUpperCase();
  const multiplier =
    unit === 'K' ? 1_000 : unit === 'M' ? 1_000_000 : unit === 'B' ? 1_000_000_000 : 1;
  return Math.round(base * multiplier);
}

function formatUserCountText(count: number): string {
  if (count >= 1_000_000_000) return `+${(count / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B users`;
  if (count >= 1_000_000) return `+${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M users`;
  if (count >= 1_000) return `+${(count / 1_000).toFixed(1).replace(/\.0$/, '')}K users`;
  return `+${count} users`;
}

async function incrementPreMadeTemplateUsers(
  admin: ReturnType<typeof getAdminClient>,
  templateId: string
): Promise<void> {
  const { data, error } = await admin
    .from('pre_made_goals')
    .select('user_count')
    .eq('id', templateId)
    .maybeSingle();
  if (error || !data) return;

  const currentText = typeof data.user_count === 'string' ? data.user_count : '+0 users';
  const nextText = formatUserCountText(parseUserCountText(currentText) + 1);
  await admin.from('pre_made_goals').update({ user_count: nextText }).eq('id', templateId);
}

/**
 * GET /goals
 * Returns all goals for the authenticated user with their items and item_completions.
 */
router.get('/', async (req: Request, res: Response) => {
  console.log('[goals] GET /goals — request received');
  const { user, error } = await getAuthenticatedUser(req, res);
  if (error) {
    console.warn('[goals] GET /goals — auth failed:', error);
    return;
  }

  const admin = getAdminClient();
  const userId = user!.id;
  console.log('[goals] GET /goals — user id:', userId);

  const { data: goalsRows, error: goalsErr } = await admin
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (goalsErr) {
    console.error('[goals] GET /goals — goals query failed:', goalsErr.message, goalsErr.code, goalsErr.details);
    res.status(500).json({ error: 'Failed to load goals' });
    return;
  }

  const goals = goalsRows ?? [];
  const goalIds = goals.map((g: { id: string }) => g.id);
  console.log('[goals] GET /goals — goals count:', goals.length, 'goalIds:', goalIds);
  if (goalIds.length === 0) {
    console.log('[goals] GET /goals — no goals, returning empty');
    res.json({ goals: [], itemCompletions: {} });
    return;
  }

  const { data: itemsRows, error: itemsErr } = await admin
    .from('goal_items')
    .select('*')
    .in('goal_id', goalIds);

  if (itemsErr) {
    console.error('[goals] GET /goals — goal_items query failed:', itemsErr.message, itemsErr.code, itemsErr.details);
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
    console.error('[goals] GET /goals — item_completions query failed:', compErr.message, compErr.code, compErr.details);
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
    category: g.category ?? null,
    reminderDate: g.reminder_date ? parseDateStringToTimestamp(g.reminder_date as string) : null,
    reminderTime: g.reminder_time ?? null,
    preMadeTemplateId: g.pre_made_template_id ?? null,
    coverIndex: g.cover_index ?? 0,
    coverUrl: g.cover_url ?? null,
    source: g.source,
    habitsTotal: g.habits_total,
    habitsDone: g.habits_done,
    tasksTotal: g.tasks_total,
    tasksDone: g.tasks_done,
    dueDate: g.due_date ? parseDateStringToTimestamp(g.due_date as string) : null,
    achieved: g.achieved,
    createdAt: g.created_at,
    note: g.note ?? null,
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

  // DEBUG: Log what we're reading
  if (goals.length > 0) {
    console.log('[goals] GET /goals — Date Debug for first goal:');
    console.log('  Raw due_date from DB:', goals[0].due_date);
    console.log('  Raw reminder_date from DB:', goals[0].reminder_date);
    console.log('  Converted dueDate:', goalsPayload[0].dueDate);
    console.log('  Converted reminderDate:', goalsPayload[0].reminderDate);
  }

  console.log('[goals] GET /goals — success: goals=', goalsPayload.length, 'itemCompletions keys=', Object.keys(itemCompletions).length);
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

  // Get user's timezone
  const { data: profile } = await admin
    .from('profiles')
    .select('timezone')
    .eq('id', userId)
    .single();
  const userTimezone = profile?.timezone || 'UTC';

  const reminderDateFormatted = body.reminderDate ? formatDateOnly(new Date(body.reminderDate)) : null;
  const dueDateFormatted = body.dueDate ? formatDateOnly(new Date(body.dueDate)) : null;

  // Calculate UTC reminder time if reminder is set
  let reminderUTC: string | null = null;
  if (reminderDateFormatted && body.reminderTime) {
    // Validate reminder time format
    if (!body.reminderTime || typeof body.reminderTime !== 'string') {
      console.error('[goals] Invalid reminderTime format:', body.reminderTime);
    } else {
      try {
        console.log('[goals] Converting reminder time:', {
          date: reminderDateFormatted,
          time: body.reminderTime,
          timezone: userTimezone
        });
        reminderUTC = convertLocalToUTC(reminderDateFormatted, body.reminderTime, userTimezone);
        console.log('[goals] Converted to UTC:', reminderUTC);
      } catch (error) {
        console.error('[goals] Error converting reminder time to UTC:', error);
        console.error('[goals] Input values:', {
          reminderDate: body.reminderDate,
          reminderDateFormatted,
          reminderTime: body.reminderTime,
          timezone: userTimezone
        });
        // Don't fail the request, just skip UTC conversion
      }
    }
  }

  const goalRow = {
    id,
    user_id: userId,
    title: body.title ?? 'Untitled',
    category: body.category ?? null,
    reminder_date: reminderDateFormatted,
    reminder_time: body.reminderTime ?? null,
    reminder_utc: reminderUTC,
    reminder_timezone: body.reminderTime ? userTimezone : null,
    pre_made_template_id: body.preMadeTemplateId ?? null,
    cover_index: body.coverIndex ?? 0,
    cover_url: body.coverUrl ?? null,
    source: body.source ?? 'selfMade',
    habits_total: body.habitsTotal ?? 0,
    habits_done: body.habitsDone ?? 0,
    tasks_total: body.tasksTotal ?? 0,
    tasks_done: body.tasksDone ?? 0,
    due_date: dueDateFormatted,
    achieved: body.achieved ?? false,
    created_at: body.createdAt ?? Date.now(),
    note: body.note ?? null,
  };

  // DEBUG: Log what we're storing
  console.log('[goals] POST /goals — Date Debug:');
  console.log('  Received body.dueDate:', body.dueDate);
  console.log('  Received body.reminderDate:', body.reminderDate);
  console.log('  Converted due_date:', goalRow.due_date);
  console.log('  Converted reminder_date:', goalRow.reminder_date);

  const { error: goalErr } = await admin.from('goals').insert(goalRow);
  if (goalErr) {
    console.error('[goals] POST /goals insert failed:', goalErr.message, goalErr.details);
    res.status(500).json({ error: 'Failed to create goal', details: goalErr.message });
    return;
  }

  const items = body.items ?? [];
  let insertedItemRows: Record<string, unknown>[] = [];
  if (items.length > 0) {
    try {
      const ts = Date.now();
      const rows = items.map((it: Record<string, unknown>, index: number) => {
        const type = it.type ?? 'task';
        const isHabit = type === 'habit';

        let dueDateFormatted: string | null = null;
        if (it.dueDate != null) {
          const raw = String(it.dueDate);
          const parsedTs = Date.parse(raw);
          if (!Number.isNaN(parsedTs)) {
            dueDateFormatted = formatDateOnly(new Date(parsedTs));
            
            // Validate: task due date cannot be after goal's due date
            // NOTE: Skip this validation during initial goal creation to allow AI-generated
            // goals and user flexibility. Validation can still happen on updates.
            // Compare date strings directly to avoid timezone issues
            // if (type === 'task' && goalRow.due_date && dueDateFormatted) {
            //   if (dueDateFormatted > goalRow.due_date) {
            //     throw new Error('Task due date cannot be after the goal due date');
            //   }
            // }
          }
        }

        return {
          id: `${id}-item-${ts}-${index}-${Math.random().toString(36).slice(2, 9)}`,
          goal_id: id,
          type,
          title: it.title ?? '',
          reminder_time: it.reminderTime ?? null,
          reminder_timezone: it.reminderTime ? userTimezone : null,
          note: it.note ?? null,
          selected_days: isHabit ? (it.selectedDays ?? []) : null,
          due_date: dueDateFormatted,
          paused: it.paused === true,
        };
      });
      const { data: insertedRows, error: itemsErr } = await admin.from('goal_items').insert(rows).select('*');
      if (itemsErr) {
        console.error('[goals] POST /goals goal_items insert failed:', itemsErr.message, itemsErr.details);
        // Roll back the goal row so we don't end up with orphan goals that have no habits/tasks.
        const { error: rollbackErr } = await admin.from('goals').delete().eq('id', id);
        if (rollbackErr) {
          console.error('[goals] POST /goals rollback delete failed:', rollbackErr.message, rollbackErr.details);
        }
        res.status(500).json({
          error: 'Failed to create goal items',
          details: itemsErr.details ? `${itemsErr.message}: ${itemsErr.details}` : itemsErr.message,
        });
        return;
      }
      insertedItemRows = (insertedRows ?? []) as Record<string, unknown>[];
    } catch (validationError) {
      // Rollback goal creation if validation fails
      await admin.from('goals').delete().eq('id', id);
      res.status(400).json({ 
        error: validationError instanceof Error ? validationError.message : 'Validation error' 
      });
      return;
    }
  }

  const created = {
    ...goalRow,
    category: goalRow.category,
    reminderDate: goalRow.reminder_date ? parseDateStringToTimestamp(goalRow.reminder_date) : null,
    reminderTime: goalRow.reminder_time,
    preMadeTemplateId: goalRow.pre_made_template_id,
    dueDate: goalRow.due_date ? parseDateStringToTimestamp(goalRow.due_date) : null,
    createdAt: goalRow.created_at,
    note: goalRow.note,
    items: insertedItemRows.map((it: Record<string, unknown>) => ({
      id: it.id,
      type: it.type,
      title: it.title,
      reminderTime: it.reminder_time ?? undefined,
      note: it.note ?? undefined,
      selectedDays: it.selected_days ?? undefined,
      dueDate: it.due_date ?? undefined,
      paused: it.paused ?? false,
    })),
  };

  if (
    goalRow.source === 'preMade' &&
    typeof goalRow.pre_made_template_id === 'string' &&
    goalRow.pre_made_template_id.length > 0
  ) {
    await incrementPreMadeTemplateUsers(admin, goalRow.pre_made_template_id);
  }

  // Schedule notifications for goal and items
  try {
    console.log('[goals] POST /goals — Starting notification scheduling...');
    
    // Schedule goal reminder if set
    if (goalRow.reminder_date && goalRow.reminder_time) {
      console.log('[goals] Scheduling goal reminder:', {
        userId,
        goalId: id,
        date: goalRow.reminder_date,
        time: goalRow.reminder_time,
        timezone: userTimezone
      });
      
      await scheduleGoalReminder(
        userId,
        id,
        goalRow.reminder_date,
        goalRow.reminder_time,
        userTimezone
      );
      
      console.log('[goals] ✅ Goal reminder scheduled successfully');
    } else {
      console.log('[goals] ⏭️  No goal reminder to schedule (missing date or time)');
    }

    // Schedule goal due date notification if set
    if (goalRow.due_date) {
      const dueTime = process.env.NOTIFICATION_DEFAULT_TIME || '09:00 AM';
      console.log('[goals] Scheduling goal due notification:', {
        userId,
        goalId: id,
        dueDate: goalRow.due_date,
        dueTime,
        timezone: userTimezone
      });
      
      await scheduleGoalDue(userId, id, goalRow.due_date, userTimezone, dueTime);
      console.log('[goals] ✅ Goal due notification scheduled successfully');
    } else {
      console.log('[goals] ⏭️  No goal due date to schedule');
    }

    // Schedule notifications for habits and tasks
    console.log('[goals] Processing items for notification scheduling:', {
      totalItems: insertedItemRows.length,
      items: insertedItemRows.map(it => ({
        id: it.id,
        type: it.type,
        title: it.title,
        reminderTime: it.reminder_time,
        selectedDays: it.selected_days,
        dueDate: it.due_date
      }))
    });
    
    for (const item of insertedItemRows) {
      if (item.type === 'habit' && item.reminder_time && item.selected_days) {
        const selectedDays = Array.isArray(item.selected_days)
          ? item.selected_days
          : JSON.parse(item.selected_days as string);
        
        console.log('[goals] Scheduling habit reminders:', {
          itemId: item.id,
          title: item.title,
          reminderTime: item.reminder_time,
          selectedDays,
          timezone: userTimezone
        });
        
        await scheduleHabitReminders(
          userId,
          id,
          item.id as string,
          selectedDays,
          item.reminder_time as string,
          userTimezone
        );
        
        console.log('[goals] ✅ Habit reminders scheduled successfully');
      } else if (item.type === 'task' && item.due_date && item.reminder_time) {
        console.log('[goals] Scheduling task due notification:', {
          itemId: item.id,
          title: item.title,
          dueDate: item.due_date,
          reminderTime: item.reminder_time,
          timezone: userTimezone
        });
        
        await scheduleTaskDue(
          userId,
          id,
          item.id as string,
          item.due_date as string,
          item.reminder_time as string,
          userTimezone
        );
        
        console.log('[goals] ✅ Task due notification scheduled successfully');
      } else {
        console.log('[goals] ⏭️  Skipping item (missing required fields):', {
          itemId: item.id,
          type: item.type,
          hasReminderTime: !!item.reminder_time,
          hasSelectedDays: !!item.selected_days,
          hasDueDate: !!item.due_date
        });
      }
    }

    console.log(`[goals] POST /goals — ✅ All notifications scheduled for goal ${id}`);
  } catch (scheduleError) {
    console.error('[goals] POST /goals — ❌ Error scheduling notifications:', scheduleError);
    console.error('[goals] Error stack:', scheduleError instanceof Error ? scheduleError.stack : 'No stack trace');
    // Don't fail the request if notification scheduling fails
  }

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

  const { data: existing } = await admin
    .from('goals')
    .select('user_id, source')
    .eq('id', id)
    .single();
  if (!existing || existing.user_id !== user!.id) {
    res.status(404).json({ error: 'Goal not found' });
    return;
  }
  const existingSource = (existing as Record<string, unknown>).source;

  // Get user's timezone
  const { data: profile } = await admin
    .from('profiles')
    .select('timezone')
    .eq('id', user!.id)
    .single();
  const userTimezone = profile?.timezone || 'UTC';

  const updates: Record<string, unknown> = {};
  if (body.achieved !== undefined) updates.achieved = body.achieved;
  if (body.habitsDone !== undefined) updates.habits_done = body.habitsDone;
  if (body.tasksDone !== undefined) updates.tasks_done = body.tasksDone;
  if (body.title !== undefined) updates.title = body.title;
  if (body.category !== undefined) updates.category = body.category;
  
  let reminderUpdated = false;
  if (body.reminderDate !== undefined) {
    updates.reminder_date =
      body.reminderDate != null ? formatDateOnly(new Date(body.reminderDate)) : null;
    reminderUpdated = true;
  }
  if (body.reminderTime !== undefined) {
    updates.reminder_time = body.reminderTime;
    reminderUpdated = true;
  }
  
  // Recalculate UTC reminder if changed
  if (reminderUpdated && updates.reminder_date && updates.reminder_time) {
    try {
      updates.reminder_utc = convertLocalToUTC(
        updates.reminder_date as string,
        updates.reminder_time as string,
        userTimezone
      );
      updates.reminder_timezone = userTimezone;
    } catch (error) {
      console.error('[goals] Error converting reminder time to UTC:', error);
    }
  } else if (reminderUpdated && (!updates.reminder_date || !updates.reminder_time)) {
    updates.reminder_utc = null;
    updates.reminder_timezone = null;
  }
  
  let dueDateUpdated = false;
  if (body.dueDate !== undefined) {
    updates.due_date = body.dueDate != null ? formatDateOnly(new Date(body.dueDate)) : null;
    dueDateUpdated = true;
  }
  
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

  // Reschedule notifications if reminder or due date changed
  try {
    if (reminderUpdated) {
      if (updates.reminder_date && updates.reminder_time) {
        await scheduleGoalReminder(
          user!.id,
          id,
          updates.reminder_date as string,
          updates.reminder_time as string,
          userTimezone
        );
      }
    }

    if (dueDateUpdated && updates.due_date) {
      const dueTime = process.env.NOTIFICATION_DEFAULT_TIME || '09:00 AM';
      await scheduleGoalDue(user!.id, id, updates.due_date as string, userTimezone, dueTime);
    }
  } catch (scheduleError) {
    console.error('[goals] PATCH /goals — Error rescheduling notifications:', scheduleError);
  }

  res.json({ success: true });
});

/**
 * PATCH /goals/:goalId/items/:itemId
 * Body: partial goal item fields (title, reminderTime, note, selectedDays, dueDate, paused)
 */
router.patch('/:goalId/items/:itemId', async (req: Request, res: Response) => {
  const { user, error } = await getAuthenticatedUser(req, res);
  if (error) return;

  const admin = getAdminClient();
  const { goalId, itemId } = req.params;
  const body = req.body ?? {};

  const { data: goal } = await admin.from('goals').select('user_id, due_date').eq('id', goalId).single();
  if (!goal || goal.user_id !== user!.id) {
    res.status(404).json({ error: 'Goal not found' });
    return;
  }

  // Get user's timezone
  const { data: profile } = await admin
    .from('profiles')
    .select('timezone')
    .eq('id', user!.id)
    .single();
  const userTimezone = profile?.timezone || 'UTC';

  // Validate: if item is a task with dueDate, it cannot be after goal's due_date
  // NOTE: This is a soft validation - log warning but don't reject
  // Compare date strings directly to avoid timezone issues
  if (body.dueDate && goal.due_date) {
    // Ensure both are in YYYY-MM-DD format for comparison
    const taskDueDateStr = typeof body.dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.dueDate)
      ? body.dueDate
      : formatDateOnly(new Date(body.dueDate));
    
    if (taskDueDateStr > goal.due_date) {
      console.warn(`[goals] Warning: Task due date ${taskDueDateStr} is after goal due date ${goal.due_date}`);
      // Allow it anyway - user might have good reasons
      // res.status(400).json({ error: 'Task due date cannot be after the goal due date' });
      // return;
    }
  }

  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.reminderTime !== undefined) {
    updates.reminder_time = body.reminderTime;
    updates.reminder_timezone = body.reminderTime ? userTimezone : null;
  }
  if (body.note !== undefined) updates.note = body.note;
  if (body.selectedDays !== undefined) updates.selected_days = body.selectedDays;
  if (body.dueDate !== undefined) updates.due_date = body.dueDate;
  if (body.paused !== undefined) updates.paused = body.paused;

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: 'No updates provided' });
    return;
  }

  const { error: updErr, data: updatedItem } = await admin
    .from('goal_items')
    .update(updates)
    .eq('id', itemId)
    .eq('goal_id', goalId)
    .select('*')
    .single();

  if (updErr) {
    res.status(500).json({ error: 'Failed to update goal item' });
    return;
  }

  // Reschedule notifications if relevant fields changed
  try {
    if (updatedItem) {
      if (updatedItem.type === 'habit' && (body.reminderTime !== undefined || body.selectedDays !== undefined)) {
        const selectedDays = Array.isArray(updatedItem.selected_days)
          ? updatedItem.selected_days
          : JSON.parse(updatedItem.selected_days || '[]');
        
        if (updatedItem.reminder_time && selectedDays.length > 0) {
          await scheduleHabitReminders(
            user!.id,
            goalId,
            itemId,
            selectedDays,
            updatedItem.reminder_time,
            userTimezone
          );
        }
      } else if (updatedItem.type === 'task' && (body.dueDate !== undefined || body.reminderTime !== undefined)) {
        if (updatedItem.due_date && updatedItem.reminder_time) {
          await scheduleTaskDue(
            user!.id,
            goalId,
            itemId,
            updatedItem.due_date,
            updatedItem.reminder_time,
            userTimezone
          );
        }
      }
    }
  } catch (scheduleError) {
    console.error('[goals] PATCH items — Error rescheduling notifications:', scheduleError);
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

  const { data: existing } = await admin
    .from('goals')
    .select('user_id, source')
    .eq('id', id)
    .single();
  if (!existing || existing.user_id !== user!.id) {
    res.status(404).json({ error: 'Goal not found' });
    return;
  }
  const existingSource = (existing as Record<string, unknown>).source;

  const { data: goalItemRows } = await admin.from('goal_items').select('id').eq('goal_id', id);
  const itemIds = (goalItemRows ?? []).map((r: { id: string }) => r.id);
  if (itemIds.length > 0) {
    await admin.from('item_completions').delete().eq('user_id', user!.id).in('item_id', itemIds);
  }
  // Pre-made goals use shared template items in goal_items; keep them for other users.
  if (existingSource !== 'preMade') {
    const { error: itemsDelErr } = await admin.from('goal_items').delete().eq('goal_id', id);
    if (itemsDelErr) {
      console.error('[goals] DELETE goal_items failed:', itemsDelErr.message);
      res.status(500).json({ error: 'Failed to delete goal items' });
      return;
    }
  }
  const { error: delErr } = await admin.from('goals').delete().eq('id', id);
  if (delErr) {
    console.error('[goals] DELETE /goals failed:', delErr.message);
    res.status(500).json({ error: 'Failed to delete goal' });
    return;
  }

  // Cancel all notifications for this goal
  try {
    await cancelGoalNotifications(user!.id, id);
  } catch (scheduleError) {
    console.error('[goals] DELETE — Error cancelling notifications:', scheduleError);
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