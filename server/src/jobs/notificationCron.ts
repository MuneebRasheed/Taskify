// Notification Cron Job - Runs every 15 minutes to check and send due notifications
import cron from 'node-cron';
import { processNotifications } from '../services/notificationService';

// Run every 5 minutes for resource-efficient notification delivery (0-5 minute delay)
// Cron format: minute hour day month dayOfWeek
// Can be overridden with CRON_SCHEDULE env var (e.g., '*/3 * * * *' for every 3 minutes, '*/1 * * * *' for every minute)
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '*/5 * * * *';

console.log(`[Cron] Notification cron job scheduled: ${CRON_SCHEDULE}`);

// Start the cron job
cron.schedule(CRON_SCHEDULE, async () => {
  const timestamp = new Date().toISOString();
  console.log(`\n[Cron] ========== Notification Job Started at ${timestamp} ==========`);
  
  try {
    await processNotifications();
  } catch (error) {
    console.error('[Cron] Critical error in notification job:', error);
  }
  
  console.log('[Cron] ========== Notification Job Completed ==========\n');
}, {
  timezone: 'UTC', // Cron runs on UTC, but notifications handle user timezones
});

console.log('[Cron] Notification cron job is now running');

// Export for testing purposes
export { processNotifications };
