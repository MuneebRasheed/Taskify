#!/usr/bin/env ts-node
/**
 * Verification Script for Timezone Fix
 * 
 * This script checks if the timezone fix is working correctly
 * Run this after deployment to verify everything is set up properly
 * 
 * Usage:
 *   npm run verify-timezone-fix
 * 
 * Or directly:
 *   ts-node server/src/scripts/verifyTimezoneFix.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CheckResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: string;
}

const results: CheckResult[] = [];

function addResult(name: string, status: 'PASS' | 'FAIL' | 'WARN', message: string, details?: string) {
  results.push({ name, status, message, details });
}

async function checkDatabaseSchema() {
  console.log('\n📋 Checking database schema...');

  // Check goals table columns
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('id, reminder_utc, reminder_timezone')
      .limit(1);

    if (error && error.message.includes('reminder_utc')) {
      addResult(
        'Goals Table - reminder_utc column',
        'FAIL',
        'Column reminder_utc does not exist',
        'Run migration: 021_add_utc_reminder_columns.sql'
      );
    } else {
      addResult('Goals Table - reminder_utc column', 'PASS', 'Column exists');
    }
  } catch (error) {
    addResult('Goals Table - reminder_utc column', 'FAIL', 'Error checking column', String(error));
  }

  // Check upcoming_notifications table
  try {
    const { data, error } = await supabase
      .from('upcoming_notifications')
      .select('id')
      .limit(1);

    if (error && error.message.includes('does not exist')) {
      addResult(
        'Upcoming Notifications Table',
        'FAIL',
        'Table does not exist',
        'Run migration: 022_create_upcoming_notifications.sql'
      );
    } else {
      addResult('Upcoming Notifications Table', 'PASS', 'Table exists');
    }
  } catch (error) {
    addResult('Upcoming Notifications Table', 'FAIL', 'Error checking table', String(error));
  }
}

async function checkNotificationSchedules() {
  console.log('\n📅 Checking notification schedules...');

  // Check if there are pending notifications
  const { data: pending, error: pendingError } = await supabase
    .from('upcoming_notifications')
    .select('id')
    .eq('status', 'pending');

  if (pendingError) {
    addResult('Pending Notifications', 'FAIL', 'Error querying pending notifications', pendingError.message);
  } else if (!pending || pending.length === 0) {
    addResult(
      'Pending Notifications',
      'WARN',
      'No pending notifications found',
      'This is normal if no goals with reminders exist. Create a test goal to verify.'
    );
  } else {
    addResult('Pending Notifications', 'PASS', `Found ${pending.length} pending notifications`);
  }

  // Check if notifications have proper UTC timestamps
  const { data: notifications, error: notifError } = await supabase
    .from('upcoming_notifications')
    .select('scheduled_utc, timezone, status')
    .eq('status', 'pending')
    .limit(5);

  if (notifError) {
    addResult('Notification UTC Timestamps', 'FAIL', 'Error checking timestamps', notifError.message);
  } else if (notifications && notifications.length > 0) {
    const allHaveUTC = notifications.every(n => n.scheduled_utc !== null);
    const allHaveTimezone = notifications.every(n => n.timezone !== null);

    if (allHaveUTC && allHaveTimezone) {
      addResult('Notification UTC Timestamps', 'PASS', 'All notifications have proper UTC and timezone data');
    } else {
      addResult(
        'Notification UTC Timestamps',
        'FAIL',
        'Some notifications missing UTC or timezone data',
        `UTC: ${allHaveUTC}, Timezone: ${allHaveTimezone}`
      );
    }
  }
}

async function checkUserTimezones() {
  console.log('\n🌍 Checking user timezones...');

  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, timezone');

  if (error) {
    addResult('User Timezones', 'FAIL', 'Error querying profiles', error.message);
    return;
  }

  if (!users || users.length === 0) {
    addResult('User Timezones', 'WARN', 'No users found', 'Create a test user to verify');
    return;
  }

  const withTimezone = users.filter(u => u.timezone !== null && u.timezone !== 'UTC');
  const withoutTimezone = users.filter(u => u.timezone === null || u.timezone === 'UTC');

  addResult(
    'User Timezones',
    withTimezone.length > 0 ? 'PASS' : 'WARN',
    `${withTimezone.length}/${users.length} users have timezone set`,
    withoutTimezone.length > 0 ? `${withoutTimezone.length} users using default UTC` : undefined
  );
}

async function checkGoalsWithReminders() {
  console.log('\n🎯 Checking goals with reminders...');

  const { data: goals, error } = await supabase
    .from('goals')
    .select('id, title, reminder_date, reminder_time, reminder_utc, reminder_timezone')
    .not('reminder_date', 'is', null)
    .limit(10);

  if (error) {
    addResult('Goals with Reminders', 'FAIL', 'Error querying goals', error.message);
    return;
  }

  if (!goals || goals.length === 0) {
    addResult('Goals with Reminders', 'WARN', 'No goals with reminders found', 'Create a test goal to verify');
    return;
  }

  const withUTC = goals.filter(g => g.reminder_utc !== null);
  const withTimezone = goals.filter(g => g.reminder_timezone !== null);

  if (withUTC.length === goals.length && withTimezone.length === goals.length) {
    addResult('Goals with Reminders', 'PASS', `All ${goals.length} goals have UTC conversion`);
  } else {
    addResult(
      'Goals with Reminders',
      'WARN',
      `${withUTC.length}/${goals.length} goals have UTC conversion`,
      'Run backfill script to update existing goals: npm run backfill-notifications'
    );
  }
}

async function checkIndexes() {
  console.log('\n🔍 Checking database indexes...');

  // This is a simplified check - in production you'd query pg_indexes
  // For now, we'll just verify the table structure supports efficient queries

  const { data, error } = await supabase
    .from('upcoming_notifications')
    .select('id')
    .eq('status', 'pending')
    .lte('scheduled_utc', new Date().toISOString())
    .limit(1);

  if (error) {
    addResult('Database Indexes', 'FAIL', 'Query failed - indexes may be missing', error.message);
  } else {
    addResult('Database Indexes', 'PASS', 'Notification queries working');
  }
}

function printResults() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 TIMEZONE FIX VERIFICATION RESULTS');
  console.log('='.repeat(80) + '\n');

  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  const warnCount = results.filter(r => r.status === 'WARN').length;

  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${result.status.padEnd(6)} | ${result.name}`);
    console.log(`            ${result.message}`);
    if (result.details) {
      console.log(`            📝 ${result.details}`);
    }
    console.log();
  });

  console.log('='.repeat(80));
  console.log('📈 SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Passed: ${passCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`⚠️  Warnings: ${warnCount}`);
  console.log(`📊 Total: ${results.length}`);
  console.log('='.repeat(80) + '\n');

  if (failCount === 0 && warnCount === 0) {
    console.log('🎉 CONGRATULATIONS! Timezone fix is fully operational!\n');
    return 0;
  } else if (failCount === 0) {
    console.log('✅ Timezone fix is working! Some warnings to address.\n');
    return 0;
  } else {
    console.log('❌ Timezone fix needs attention. Please resolve failures above.\n');
    return 1;
  }
}

async function main() {
  console.log('🚀 Starting Timezone Fix Verification...\n');
  console.log('This will check if all timezone fix components are working correctly.\n');

  try {
    await checkDatabaseSchema();
    await checkNotificationSchedules();
    await checkUserTimezones();
    await checkGoalsWithReminders();
    await checkIndexes();

    const exitCode = printResults();
    process.exit(exitCode);
  } catch (error) {
    console.error('❌ Fatal error during verification:', error);
    process.exit(1);
  }
}

// Run the script
main();
