#!/usr/bin/env ts-node
/**
 * Backfill Script for Existing Goals
 * 
 * This script processes existing goals in the database and:
 * 1. Calculates reminder_utc for goals with reminders
 * 2. Creates entries in upcoming_notifications table
 * 
 * Run this ONCE after deploying the timezone fix migrations
 * 
 * Usage:
 *   npm run backfill-notifications
 * 
 * Or directly:
 *   ts-node server/src/scripts/backfillNotifications.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import {
  scheduleGoalReminder,
  scheduleGoalDue,
  scheduleHabitReminders,
  scheduleTaskDue,
} from '../services/notificationScheduler';
import { convertLocalToUTC } from '../services/timezoneHelper';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function backfillNotifications() {
  console.log('🚀 Starting notification backfill...\n');

  try {
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, timezone')
      .not('timezone', 'is', null);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    if (!users || users.length === 0) {
      console.log('No users found with timezone set');
      return;
    }

    console.log(`Found ${users.length} users to process\n`);

    let processedGoals = 0;
    let processedItems = 0;
    let errors = 0;

    for (const user of users) {
      console.log(`\n👤 Processing user: ${user.id}`);
      console.log(`   Timezone: ${user.timezone}`);

      const userTimezone = user.timezone || 'UTC';

      // Get all goals for user
      const { data: goals, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id);

      if (goalsError) {
        console.error(`   ❌ Error fetching goals: ${goalsError.message}`);
        errors++;
        continue;
      }

      if (!goals || goals.length === 0) {
        console.log('   No goals found');
        continue;
      }

      console.log(`   Found ${goals.length} goals`);

      // Get all goal items
      const goalIds = goals.map(g => g.id);
      const { data: items, error: itemsError } = await supabase
        .from('goal_items')
        .select('*')
        .in('goal_id', goalIds);

      if (itemsError) {
        console.error(`   ❌ Error fetching items: ${itemsError.message}`);
        errors++;
        continue;
      }

      // Process each goal
      for (const goal of goals) {
        try {
          let goalUpdated = false;

          // Update reminder_utc if goal has reminder
          if (goal.reminder_date && goal.reminder_time && !goal.reminder_utc) {
            try {
              const reminderUTC = convertLocalToUTC(
                goal.reminder_date,
                goal.reminder_time,
                userTimezone
              );

              await supabase
                .from('goals')
                .update({
                  reminder_utc: reminderUTC,
                  reminder_timezone: userTimezone,
                })
                .eq('id', goal.id);

              console.log(`   ✅ Updated reminder_utc for goal: ${goal.title}`);
              goalUpdated = true;
            } catch (error) {
              console.error(`   ❌ Error updating goal ${goal.id}:`, error);
              errors++;
            }
          }

          // Schedule goal reminder notification
          if (goal.reminder_date && goal.reminder_time) {
            try {
              await scheduleGoalReminder(
                user.id,
                goal.id,
                goal.reminder_date,
                goal.reminder_time,
                userTimezone
              );
              console.log(`   📅 Scheduled goal reminder: ${goal.title}`);
            } catch (error) {
              console.error(`   ❌ Error scheduling goal reminder:`, error);
              errors++;
            }
          }

          // Schedule goal due date notification
          if (goal.due_date) {
            try {
              const dueTime = process.env.NOTIFICATION_DEFAULT_TIME || '09:00 AM';
              await scheduleGoalDue(user.id, goal.id, goal.due_date, userTimezone, dueTime);
              console.log(`   📅 Scheduled goal due: ${goal.title}`);
            } catch (error) {
              console.error(`   ❌ Error scheduling goal due:`, error);
              errors++;
            }
          }

          processedGoals++;
        } catch (error) {
          console.error(`   ❌ Error processing goal ${goal.id}:`, error);
          errors++;
        }
      }

      // Process goal items (habits and tasks)
      if (items && items.length > 0) {
        for (const item of items) {
          try {
            // Update reminder_timezone if not set
            if (item.reminder_time && !item.reminder_timezone) {
              await supabase
                .from('goal_items')
                .update({
                  reminder_timezone: userTimezone,
                })
                .eq('id', item.id);
            }

            // Schedule habit reminders
            if (item.type === 'habit' && item.reminder_time && item.selected_days) {
              try {
                const selectedDays = Array.isArray(item.selected_days)
                  ? item.selected_days
                  : JSON.parse(item.selected_days);

                await scheduleHabitReminders(
                  user.id,
                  item.goal_id,
                  item.id,
                  selectedDays,
                  item.reminder_time,
                  userTimezone
                );

                console.log(`   ✅ Scheduled habit: ${item.title}`);
              } catch (error) {
                console.error(`   ❌ Error scheduling habit ${item.id}:`, error);
                errors++;
              }
            }

            // Schedule task due notifications
            if (item.type === 'task' && item.due_date && item.reminder_time) {
              try {
                await scheduleTaskDue(
                  user.id,
                  item.goal_id,
                  item.id,
                  item.due_date,
                  item.reminder_time,
                  userTimezone
                );

                console.log(`   ✅ Scheduled task: ${item.title}`);
              } catch (error) {
                console.error(`   ❌ Error scheduling task ${item.id}:`, error);
                errors++;
              }
            }

            processedItems++;
          } catch (error) {
            console.error(`   ❌ Error processing item ${item.id}:`, error);
            errors++;
          }
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ BACKFILL COMPLETE');
    console.log('='.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   - Users processed: ${users.length}`);
    console.log(`   - Goals processed: ${processedGoals}`);
    console.log(`   - Items processed: ${processedItems}`);
    console.log(`   - Errors: ${errors}`);
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('❌ Fatal error during backfill:', error);
    process.exit(1);
  }
}

// Run the script
backfillNotifications()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
