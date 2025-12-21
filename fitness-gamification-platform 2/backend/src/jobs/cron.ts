import cron from 'node-cron';
import dayjs from 'dayjs';
import { ScoringService } from '../services/scoring.service';
import { LeagueService } from '../services/league.service';
import { query } from '../database/connection';

/**
 * Setup all cron jobs for the platform
 */
export const setupCronJobs = () => {
  console.log('⏰ Setting up cron jobs...');

  /**
   * DAILY JOB: Recalculate member and club scores
   * Runs every day at 00:30 (after midnight)
   */
  cron.schedule('30 0 * * *', async () => {
    console.log('🌙 Starting daily score recalculation job');
    try {
      const yesterday = dayjs().subtract(1, 'day').toDate();
      await ScoringService.recalculateDailyScores(yesterday);
      console.log('✅ Daily score recalculation completed');
    } catch (error) {
      console.error('❌ Error in daily score job:', error);
    }
  }, {
    timezone: 'UTC'
  });

  /**
   * WEEKLY JOB: Calculate standings and apply promotions/demotions
   * Runs every Monday at 00:10 (just after week ends)
   */
  cron.schedule('10 0 * * 1', async () => {
    console.log('📊 Starting weekly league standings job');
    try {
      // Get previous week's Monday
      const lastMonday = dayjs().subtract(1, 'week').startOf('week').toDate();

      // Get all active seasons
      const seasonsResult = await query(
        `SELECT id FROM seasons WHERE status = 'ACTIVE'`
      );

      for (const season of seasonsResult.rows) {
        // Calculate standings
        await LeagueService.calculateWeeklyStandings(season.id, lastMonday);
        
        // Apply promotions/demotions
        await LeagueService.applyPromotionsDemotions(season.id, lastMonday);
      }

      console.log('✅ Weekly standings job completed');
    } catch (error) {
      console.error('❌ Error in weekly standings job:', error);
    }
  }, {
    timezone: 'UTC'
  });

  /**
   * ANTI-CHEAT JOB: Flag anomalies in health data
   * Runs every day at 02:00
   */
  cron.schedule('0 2 * * *', async () => {
    console.log('🚨 Starting anti-cheat detection job');
    try {
      const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
      
      const maxCalories = parseInt(process.env.MAX_CALORIES_PER_DAY || '2500');

      // Flag excessive calories
      await query(
        `UPDATE health_daily_summary
         SET anomaly_flag = true,
             anomaly_reason = 'Excessive calories for one day'
         WHERE date = $1
         AND active_calories > $2
         AND anomaly_flag = false`,
        [yesterday, maxCalories]
      );

      // Flag sudden spikes (compare with previous day)
      const spikeThreshold = parseInt(process.env.MAX_CALORIES_SPIKE_30MIN || '1000');
      
      await query(
        `UPDATE health_daily_summary hds
         SET anomaly_flag = true,
             anomaly_reason = 'Unusual spike in calories'
         WHERE hds.date = $1
         AND hds.anomaly_flag = false
         AND EXISTS (
           SELECT 1 FROM health_daily_summary prev
           WHERE prev.member_id = hds.member_id
           AND prev.date = $1::date - INTERVAL '1 day'
           AND hds.active_calories - prev.active_calories > $2
         )`,
        [yesterday, spikeThreshold]
      );

      console.log('✅ Anti-cheat detection completed');
    } catch (error) {
      console.error('❌ Error in anti-cheat job:', error);
    }
  }, {
    timezone: 'UTC'
  });

  /**
   * CLEANUP JOB: Archive old data
   * Runs every Sunday at 03:00
   */
  cron.schedule('0 3 * * 0', async () => {
    console.log('🗑️  Starting data cleanup job');
    try {
      // Delete old audit logs (older than 90 days)
      const cutoffDate = dayjs().subtract(90, 'day').format('YYYY-MM-DD');
      
      const result = await query(
        `DELETE FROM audit_logs WHERE created_at < $1`,
        [cutoffDate]
      );

      console.log(`✅ Deleted ${result.rowCount} old audit log entries`);
    } catch (error) {
      console.error('❌ Error in cleanup job:', error);
    }
  }, {
    timezone: 'UTC'
  });

  /**
   * SEASON STATUS JOB: Update season statuses
   * Runs every hour
   */
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();

      // Start seasons that should be active
      await query(
        `UPDATE seasons 
         SET status = 'ACTIVE' 
         WHERE status = 'DRAFT' 
         AND start_date <= $1`,
        [now]
      );

      // Complete seasons that have ended
      await query(
        `UPDATE seasons 
         SET status = 'COMPLETED' 
         WHERE status = 'ACTIVE' 
         AND end_date < $1`,
        [now]
      );
    } catch (error) {
      console.error('❌ Error in season status job:', error);
    }
  }, {
    timezone: 'UTC'
  });

  console.log('✅ All cron jobs scheduled');
};

/**
 * Manual trigger for testing
 */
export const triggerDailyScoreJob = async () => {
  const yesterday = dayjs().subtract(1, 'day').toDate();
  await ScoringService.recalculateDailyScores(yesterday);
};

export const triggerWeeklyStandingsJob = async () => {
  const lastMonday = dayjs().subtract(1, 'week').startOf('week').toDate();
  const seasonsResult = await query(
    `SELECT id FROM seasons WHERE status = 'ACTIVE'`
  );

  for (const season of seasonsResult.rows) {
    await LeagueService.calculateWeeklyStandings(season.id, lastMonday);
    await LeagueService.applyPromotionsDemotions(season.id, lastMonday);
  }
};

export default { setupCronJobs, triggerDailyScoreJob, triggerWeeklyStandingsJob };
