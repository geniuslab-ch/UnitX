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
 * Calculate monthly standings with HYBRID scoring system (70/30)
 * - 70% points from home members (even if they visit other clubs)
 * - 30% points from visitors at this club
 */
async function calculateMonthlyStandings() {
  try {
    console.log('📊 Calculating monthly standings with hybrid 70/30 system...');
    
    const seasonsResult = await query(
      `SELECT id, name, start_date 
       FROM seasons 
       WHERE status = 'ACTIVE'`
    );
    
    for (const season of seasonsResult.rows) {
      // Get all clubs participating in this season
      const clubsResult = await query(
        `SELECT 
           c.id, 
           c.name,
           -- Membres du club (home members) qui font des check-ins n'importe où
           COUNT(DISTINCT CASE WHEN m.club_id = c.id AND ch.id IS NOT NULL THEN m.id END) as active_home_members,
           COUNT(CASE WHEN m.club_id = c.id THEN ch.id END) as checkins_by_home_members,
           COALESCE(SUM(CASE WHEN m.club_id = c.id THEN ds.total_points END), 0) as points_by_home_members,
           
           -- Visiteurs (tous les check-ins dans CE club)
           COUNT(DISTINCT CASE WHEN ch.club_id = c.id THEN ch.member_id END) as visitors_count,
           COUNT(CASE WHEN ch.club_id = c.id THEN ch.id END) as checkins_at_club,
           COALESCE(SUM(CASE WHEN ch.club_id = c.id THEN ds.total_points END), 0) as points_at_club
           
         FROM season_clubs sc
         JOIN clubs c ON sc.club_id = c.id
         LEFT JOIN members m ON m.status = 'ACTIVE'
         LEFT JOIN checkins ch ON ch.member_id = m.id
                              AND ch.season_id = $1
                              AND ch.checked_in_at >= date_trunc('month', CURRENT_DATE)
         LEFT JOIN daily_scores ds ON ds.member_id = m.id
                                   AND ds.season_id = $1
                                   AND ds.date >= date_trunc('month', CURRENT_DATE)
         WHERE sc.season_id = $1
         GROUP BY c.id, c.name`,
        [season.id]
      );
      
      // Calculate hybrid scores (70% home members + 30% visitors)
      const clubScores = clubsResult.rows.map(club => {
        // 70% des points des membres du club (même s'ils visitent ailleurs)
        const homePoints = Math.round(parseFloat(club.points_by_home_members) * 0.7);
        
        // 30% des points des visiteurs dans ce club
        const visitPoints = Math.round(parseFloat(club.points_at_club) * 0.3);
        
        // Total hybride
        const totalPoints = homePoints + visitPoints;
        
        return {
          id: club.id,
          name: club.name,
          active_home_members: parseInt(club.active_home_members) || 0,
          checkins_by_home_members: parseInt(club.checkins_by_home_members) || 0,
          points_by_home_members: parseFloat(club.points_by_home_members) || 0,
          home_points: homePoints,
          visitors_count: parseInt(club.visitors_count) || 0,
          checkins_at_club: parseInt(club.checkins_at_club) || 0,
          points_at_club: parseFloat(club.points_at_club) || 0,
          visit_points: visitPoints,
          total_checkins: parseInt(club.checkins_by_home_members) + parseInt(club.checkins_at_club),
          total_points: totalPoints
        };
      });
      
      // Sort by total points (descending)
      clubScores.sort((a, b) => b.total_points - a.total_points);
      
      console.log(`   📈 ${season.name}: ${clubScores.length} clubs ranked`);
      clubScores.forEach((club, index) => {
        console.log(`      ${index + 1}. ${club.name}: ${club.total_points} pts (Home: ${club.home_points} + Visit: ${club.visit_points})`);
      });
      
      // Store standings in database
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      const weekStart = firstDayOfMonth.toISOString().split('T')[0];
      
      for (let i = 0; i < clubScores.length; i++) {
        const club = clubScores[i];
        
        await query(
          `INSERT INTO weekly_standings 
           (season_id, club_id, week_start, week_number, 
            total_checkins, total_points, club_rank, 
            top_contributors, calculated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
           ON CONFLICT (season_id, club_id, week_start) 
           DO UPDATE SET 
             total_checkins = $5,
             total_points = $6,
             club_rank = $7,
             top_contributors = $8,
             calculated_at = NOW()`,
          [
            season.id,
            club.id,
            weekStart,
            new Date().getMonth() + 1,
            club.total_checkins,
            club.total_points,
            i + 1, // Rank
            JSON.stringify({
              system: 'hybrid_70_30',
              home_members: {
                count: club.active_home_members,
                checkins: club.checkins_by_home_members,
                raw_points: club.points_by_home_members,
                weighted_points: club.home_points
              },
              visitors: {
                count: club.visitors_count,
                checkins: club.checkins_at_club,
                raw_points: club.points_at_club,
                weighted_points: club.visit_points
              }
            })
          ]
        );
      }
    }
    
    console.log('✅ Monthly standings calculated with hybrid system');
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
  console.log('   - Monthly standings: 1st of month at 02:00 UTC (Hybrid 70/30)');
  console.log('   - Daily standings update: 03:00 UTC (Hybrid 70/30)');
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
