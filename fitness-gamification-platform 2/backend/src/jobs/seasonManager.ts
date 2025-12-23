import { query } from '../database/db';

/**
 * Auto-start seasons that have reached their start date
 */
export async function autoStartSeasons() {
  try {
    console.log('🚀 Checking for seasons to auto-start...');
    
    const today = new Date().toISOString().split('T')[0];
    
    // Find DRAFT seasons where start_date is today or past
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
export async function autoCompleteSeasons() {
  try {
    console.log('🏁 Checking for seasons to auto-complete...');
    
    const today = new Date().toISOString().split('T')[0];
    
    // Find ACTIVE seasons where end_date is today or past
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
export async function calculateMonthlyStandings() {
  try {
    console.log('📊 Calculating monthly standings...');
    
    // Get all active seasons
    const seasonsResult = await query(
      `SELECT id, name, start_date 
       FROM seasons 
       WHERE status = 'ACTIVE'`
    );
    
    for (const season of seasonsResult.rows) {
      // Get all clubs in this season
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
      
      // Store rankings in weekly_standings table (monthly in this case)
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
            new Date().getMonth() + 1, // Month number
            club.total_checkins,
            club.total_points,
            i + 1 // Rank (1st, 2nd, 3rd, etc.)
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
