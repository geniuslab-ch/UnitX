import cron from 'node-cron';
import dayjs from 'dayjs';
import { query } from '../database/db';

/**
 * Auto-start seasons that have reached their start date
 */
async function autoStartSeasons() {
  try {
    console.log('🚀 Checking for seasons to auto-start...');
    
    const today = new Date().toISOString().split('T')[0];
    
    const result = await query(
      `UPDATE seasons 
       SET status = 'ACTIVE', updated_at = NOW()
       WHERE status = 'DRAFT' 
       AND start_date <= $1
       RETURNING id, name, start_date`,
      [today]
    );
    
    if (result.rows.length > 0) {
      console.log(`✅ Auto-started ${result.rows.length} season(s):`);
      result.rows.forEach(season => {
        console.log(`   - ${season.name} (started: ${season.start_date})`);
      });
    } else {
      console.log('   No seasons to start today');
    }
    
    return result.rows;
  } catch (error) {
    console.error('❌ Error auto-starting seasons:', error);
    throw error;
  }
}

/**
 * Auto-complete seasons that have reached their end date
 */
async function autoCompleteSeasons() {
  try {
    console.log('🏁 Checking for seasons to auto-complete...');
    
    const today = new Date().toISOString().split('T')[0];
    
    const result = await query(
      `UPDATE seasons 
       SET status = 'COMPLETED', updated_at = NOW()
       WHERE status = 'ACTIVE' 
       AND end_date < $1
       RETURNING id, name, end_date`,
      [today]
    );
    
    if (result.rows.length > 0) {
      console.log(`✅ Auto-completed ${result.rows.length} season(s):`);
      result.rows.forEach(season => {
        console.log(`   - ${season.name} (ended: ${season.end_date})`);
      });
    } else {
      console.log('   No seasons to complete today');
    }
    
    return result.rows;
  } catch (error) {
    console.error('❌ Error auto-completing seasons:', error);
    throw error;
  }
}

/**
 * Calculate monthly standings for all active seasons
 */
async function calculateMonthlyStandings() {
  try {
    console.log('📊 Calculating monthly standings...');
    
    const seasonsResult = await query(
      `SELECT id, name, start_date 
       FROM seasons 
       WHERE status = 'ACTIVE'`
    );
    
    for (const season of seasonsResult.rows) {
      const clubsResult = await query(
        `SELECT c.id, c.name, 
                COUNT(DISTINCT ch.member_id) as active_members,
                COUNT(ch.id) as total_checkins,
                COALESCE(SUM(ds.total_points), 0) as total_points
         FROM season_clubs sc
         JOIN clubs c ON sc.club_id = c.id
         LEFT JOIN checkins ch ON ch.club_id = c.id 
                              AND ch.season_id = $1
                              AND ch.checked_in_at >= date_trunc('month', CURRENT_DATE)
         LEFT JOIN daily_scores ds ON ds.club_id = c.id 
                                   AND ds.season_id = $1
                                   AND ds.date >= date_trunc('month', CURRENT_DATE)
         WHERE sc.season_id = $1
         GROUP BY c.id, c.name
         ORDER BY total_points DESC, total_checkins DESC`,
        [season.id]
      );
      
      console.log(`   📈 ${season.name}: ${clubsResult.rows.length} clubs ranked`);
      
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      const weekStart = firstDayOfMonth.toISOString().split('T')[0];
      
      for (let i = 0; i < clubsResult.rows.length; i++) {
        const club = clubsResult.rows[i];
        
        await query(
          `INSERT INTO weekly_standings 
           (season_id, club_id, week_start, week_number, 
            total_checkins, total_points, club_rank, calculated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
           ON CONFLICT (season_id, club_id, week_start) 
           DO UPDATE SET 
             total_checkins = $5,
             total_points = $6,
             club_rank = $7,
             calculated_at = NOW()`,
          [
            season.id,
            club.id,
            weekStart,
            new Date().getMonth() + 1,
            club.total_checkins,
            club.total_points,
            i + 1
          ]
        );
      }
    }
    
    console.log('✅ Monthly standings calculated');
  } catch (error) {
    console.error('❌ Error calculating monthly standings:', error);
    throw error;
  }
}

/**
 * Setup all cron jobs for the platform
 */
export const setupCronJobs = () => {
  console.log('⏰ Setting up cron jobs...');

  /**
   * SEASON AUTO-START/COMPLETE JOB
   * Runs every day at 00:01 (1 minute after midnight)
   */
  cron.schedule('1 0 * * *', async () => {
    console.log('🕐 Running daily season status check...');
    try {
      await autoStartSeasons();
      await autoCompleteSeasons();
    } catch (error) {
      console.error('❌ Error in season status job:', error);
    }
  }, {
    timezone: 'UTC'
  });

  /**
   * MONTHLY STANDINGS JOB
   * Runs on the 1st of each month at 02:00
   */
  cron.schedule('0 2 1 * *', async () => {
    console.log('📊 Running monthly standings calculation...');
    try {
      await calculateMonthlyStandings();
    } catch (error) {
      console.error('❌ Error in monthly standings job:', error);
    }
  }, {
    timezone: 'UTC'
  });

  /**
   * DAILY STANDINGS UPDATE
   * Runs every day at 03:00
   */
  cron.schedule('0 3 * * *', async () => {
    console.log('📈 Running daily standings update...');
    try {
      await calculateMonthlyStandings();
    } catch (error) {
      console.error('❌ Error in daily standings job:', error);
    }
  }, {
    timezone: 'UTC'
  });

  /**
   * ANTI-CHEAT JOB: Flag anomalies in health data
   * Runs every day at 04:00
   */
  cron.schedule('0 4 * * *', async () => {
    console.log('🚨 Starting anti-cheat detection job');
    try {
      const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
      const maxCalories = parseInt(process.env.MAX_CALORIES_PER_DAY || '2500');

      await query(
        `UPDATE health_data
         SET flagged = true
         WHERE date = $1
         AND calories_burned > $2`,
        [yesterday, maxCalories]
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
   * Runs every Sunday at 05:00
   */
  cron.schedule('0 5 * * 0', async () => {
    console.log('🗑️ Starting data cleanup job');
    try {
      const cutoffDate = dayjs().subtract(90, 'day').format('YYYY-MM-DD');
      
      const result = await query(
        `DELETE FROM audit_logs WHERE created_at < $1`,
        [cutoffDate]
      );

      console.log(`✅ Deleted ${result.rowCount || 0} old audit log entries`);
    } catch (error) {
      console.error('❌ Error in cleanup job:', error);
    }
  }, {
    timezone: 'UTC'
  });

  console.log('✅ All cron jobs scheduled');
  console.log('   - Daily season status check: 00:01 UTC');
  console.log('   - Monthly standings: 1st of month at 02:00 UTC');
  console.log('   - Daily standings update: 03:00 UTC');
  console.log('   - Anti-cheat detection: 04:00 UTC');
  console.log('   - Data cleanup: Sunday at 05:00 UTC');
};

/**
 * Manual triggers for testing
 */
export const triggerSeasonStatusCheck = async () => {
  await autoStartSeasons();
  await autoCompleteSeasons();
};

export const triggerMonthlyStandings = async () => {
  await calculateMonthlyStandings();
};

export default { 
  setupCronJobs, 
  triggerSeasonStatusCheck, 
  triggerMonthlyStandings 
};
