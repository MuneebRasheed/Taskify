#!/usr/bin/env ts-node
/**
 * Quick Debug Script - Check Notifications
 * 
 * This script checks what notifications are scheduled
 * 
 * Usage:
 *   ts-node server/src/scripts/checkNotifications.ts
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

async function main() {
  console.log('🔍 Checking Notifications...\n');
  
  // Check upcoming_notifications table
  const { data: notifications, error } = await supabase
    .from('upcoming_notifications')
    .select('*')
    .order('scheduled_utc', { ascending: true })
    .limit(20);
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  if (!notifications || notifications.length === 0) {
    console.log('⚠️  No notifications found in upcoming_notifications table');
    console.log('\nThis means:');
    console.log('1. Either you haven\'t created any goals/habits with reminders');
    console.log('2. Or the scheduling logic isn\'t being called');
    console.log('\nNext steps:');
    console.log('- Create a habit with reminder time');
    console.log('- Check server logs for "Scheduled habit reminders" message');
    return;
  }
  
  console.log(`✅ Found ${notifications.length} notifications\n`);
  console.log('Current UTC Time:', new Date().toISOString());
  console.log('\n' + '='.repeat(80));
  
  notifications.forEach((n, idx) => {
    console.log(`\n📋 Notification #${idx + 1}`);
    console.log(`   Type: ${n.notification_type}`);
    console.log(`   Status: ${n.status}`);
    console.log(`   Scheduled UTC: ${n.scheduled_utc}`);
    console.log(`   Scheduled Local: ${n.scheduled_date} ${n.scheduled_time} (${n.timezone})`);
    console.log(`   User ID: ${n.user_id}`);
    console.log(`   Goal ID: ${n.goal_id}`);
    if (n.item_id) console.log(`   Item ID: ${n.item_id}`);
    
    // Check if it should have fired already
    const scheduledTime = new Date(n.scheduled_utc);
    const now = new Date();
    const diffMinutes = (now.getTime() - scheduledTime.getTime()) / (1000 * 60);
    
    if (diffMinutes > 0 && diffMinutes < 60 && n.status === 'pending') {
      console.log(`   ⚠️  OVERDUE by ${diffMinutes.toFixed(1)} minutes!`);
    } else if (diffMinutes < 0 && Math.abs(diffMinutes) < 60) {
      console.log(`   ⏰  Due in ${Math.abs(diffMinutes).toFixed(1)} minutes`);
    }
  });
  
  console.log('\n' + '='.repeat(80));
  
  // Check profiles with push tokens
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, timezone, expo_push_token')
    .not('expo_push_token', 'is', null);
  
  if (profileError) {
    console.error('\n❌ Error fetching profiles:', profileError);
  } else {
    console.log(`\n👤 Found ${profiles?.length || 0} users with push tokens`);
    if (profiles && profiles.length > 0) {
      profiles.forEach((p, idx) => {
        console.log(`   ${idx + 1}. User ${p.id.substring(0, 8)}... | Timezone: ${p.timezone || 'UTC'}`);
      });
    }
  }
  
  // Check recent notification logs
  const { data: logs, error: logsError } = await supabase
    .from('notification_logs')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(10);
  
  if (!logsError && logs && logs.length > 0) {
    console.log(`\n📜 Recent Notification Logs (last ${logs.length}):`);
    logs.forEach((log, idx) => {
      console.log(`   ${idx + 1}. ${log.notification_type} | Status: ${log.status} | At: ${log.sent_at}`);
    });
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
