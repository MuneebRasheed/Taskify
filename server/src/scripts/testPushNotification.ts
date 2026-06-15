#!/usr/bin/env ts-node
/**
 * Test Push Notification Script
 * 
 * Sends a test notification to verify your push token works
 * 
 * Usage:
 *   ts-node server/src/scripts/testPushNotification.ts <your-push-token>
 * 
 * Or to test your own token:
 *   ts-node server/src/scripts/testPushNotification.ts
 */

import 'dotenv/config';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const expo = new Expo();

async function testPushNotification(token?: string) {
  let pushToken = token;
  
  if (!pushToken) {
    // Get the most recent push token from database
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, expo_push_token')
      .not('expo_push_token', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(1);
    
    if (error || !profiles || profiles.length === 0) {
      console.error('❌ No push tokens found in database');
      console.log('\nMake sure:');
      console.log('1. You have logged in to the app');
      console.log('2. The app has requested notification permissions');
      console.log('3. Your push token was saved to the database');
      process.exit(1);
    }
    
    pushToken = profiles[0].expo_push_token;
    console.log(`Found push token for user: ${profiles[0].id}`);
  }
  
  console.log(`\n🔔 Testing push notification...`);
  console.log(`Token: ${pushToken?.substring(0, 50)}...`);
  
  if (!Expo.isExpoPushToken(pushToken!)) {
    console.error('❌ Invalid Expo push token format');
    console.log('Expected format: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]');
    process.exit(1);
  }
  
  try {
    const messages: ExpoPushMessage[] = [
      {
        to: pushToken!,
        sound: 'default',
        title: '🧪 Test Notification',
        body: 'If you see this, push notifications are working! ✅',
        data: { test: true, timestamp: new Date().toISOString() },
        priority: 'high',
        channelId: 'default',
      },
    ];
    
    console.log('\n📤 Sending test notification...');
    
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];
    
    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }
    
    console.log(`\n📬 Received ${tickets.length} ticket(s)\n`);
    
    for (const ticket of tickets) {
      console.log('Ticket:', JSON.stringify(ticket, null, 2));
      
      if (ticket.status === 'error') {
        console.error('\n❌ Push notification failed!');
        console.error('Error:', ticket.message);
        console.error('Details:', ticket.details);
        
        console.log('\n🔍 Common issues:');
        console.log('1. Token expired - User needs to re-login to get new token');
        console.log('2. App uninstalled - Token is no longer valid');
        console.log('3. Notifications disabled - Check device settings');
        console.log('4. Development vs Production - Make sure token matches environment');
        
        process.exit(1);
      } else if (ticket.status === 'ok') {
        console.log('\n✅ Push notification sent successfully!');
        console.log(`Ticket ID: ${ticket.id}`);
        
        console.log('\n📱 Check your device now!');
        console.log('\n⚠️  Note:');
        console.log('- Close the app completely (background it or force quit)');
        console.log('- Notification should appear in ~5-10 seconds');
        console.log('- If app is in foreground, notification may not display');
        console.log('- Check notification center/tray');
      }
    }
    
    // Wait a bit for delivery
    console.log('\n⏳ Waiting 10 seconds for delivery...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log('\n✅ Test complete!');
    console.log('\nDid you receive the notification?');
    console.log('- YES: Push notifications are working! 🎉');
    console.log('- NO: Check the troubleshooting steps below\n');
    
    console.log('🔧 Troubleshooting:');
    console.log('1. Make sure app is closed/backgrounded');
    console.log('2. Check notification permissions in device settings');
    console.log('3. On iOS: Settings > Taskify > Notifications > Allow Notifications');
    console.log('4. On Android: Settings > Apps > Taskify > Notifications > All notifications');
    console.log('5. Try restarting the app and getting a new push token');
    console.log('6. Check if other apps (like email) can send you notifications');
    
  } catch (error) {
    console.error('\n❌ Error sending push notification:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Get token from command line or database
const token = process.argv[2];
testPushNotification(token)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
