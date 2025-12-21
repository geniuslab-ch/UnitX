import { query } from '../database/connection';
import { RulesetParams, MemberScoreDaily } from '../types';
import dayjs from 'dayjs';

/**
 * Service for calculating member and club scores
 */
export class ScoringService {
  /**
   * Calculate daily score for a member
   */
  static async calculateMemberDailyScore(
    memberId: string,
    date: Date,
    ruleset: RulesetParams
  ): Promise<MemberScoreDaily> {
    const dateStr = dayjs(date).format('YYYY-MM-DD');

    // Get check-in for the day
    const checkinResult = await query(
      `SELECT COUNT(*) as count 
       FROM checkins 
       WHERE member_id = $1 
       AND DATE(timestamp) = $2
       LIMIT 1`,
      [memberId, dateStr]
    );
    const hasCheckin = checkinResult.rows[0]?.count > 0;

    // Get health data for the day
    const healthResult = await query(
      `SELECT active_calories, anomaly_flag 
       FROM health_daily_summary 
       WHERE member_id = $1 AND date = $2`,
      [memberId, dateStr]
    );
    const healthData = healthResult.rows[0];

    // Calculate points
    let pointsCheckin = 0;
    let pointsCalories = 0;
    let pointsBonus = 0;

    // Check-in points
    if (hasCheckin) {
      pointsCheckin = ruleset.checkinPoints;
    }

    // Calorie points (if not anomaly)
    if (healthData && !healthData.anomaly_flag) {
      const caloriePoints = Math.floor(
        healthData.active_calories / ruleset.caloriePointsDivisor
      );
      pointsCalories = Math.min(caloriePoints, ruleset.maxCaloriePointsPerDay);
    }

    // Calculate streak
    const streakDays = await this.calculateStreak(memberId, date);

    // Streak bonus
    if (streakDays >= ruleset.streakDaysRequired) {
      pointsBonus = ruleset.streakBonusPoints;
    }

    const totalPoints = pointsCheckin + pointsCalories + pointsBonus;

    // Upsert member score
    const result = await query(
      `INSERT INTO member_score_daily 
       (member_id, date, points_checkin, points_calories, points_bonus, total_points, streak_days, calculated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (member_id, date) 
       DO UPDATE SET 
         points_checkin = EXCLUDED.points_checkin,
         points_calories = EXCLUDED.points_calories,
         points_bonus = EXCLUDED.points_bonus,
         total_points = EXCLUDED.total_points,
         streak_days = EXCLUDED.streak_days,
         calculated_at = NOW()
       RETURNING *`,
      [memberId, dateStr, pointsCheckin, pointsCalories, pointsBonus, totalPoints, streakDays]
    );

    return result.rows[0];
  }

  /**
   * Calculate streak days for a member
   */
  static async calculateStreak(memberId: string, endDate: Date): Promise<number> {
    let streakDays = 0;
    let currentDate = dayjs(endDate);

    // Check backwards day by day
    for (let i = 0; i < 30; i++) { // Max 30 days lookback
      const dateStr = currentDate.format('YYYY-MM-DD');
      
      const result = await query(
        `SELECT 
          (SELECT COUNT(*) FROM checkins WHERE member_id = $1 AND DATE(timestamp) = $2) > 0 as has_checkin,
          (SELECT active_calories FROM health_daily_summary WHERE member_id = $1 AND date = $2) as calories
        `,
        [memberId, dateStr]
      );

      const row = result.rows[0];
      const hasActivity = row.has_checkin || (row.calories && row.calories > 100);

      if (hasActivity) {
        streakDays++;
        currentDate = currentDate.subtract(1, 'day');
      } else {
        break; // Streak broken
      }
    }

    return streakDays;
  }

  /**
   * Calculate club weekly score using Top N contributors
   */
  static async calculateClubWeeklyScore(
    clubId: string,
    seasonId: string,
    weekStartDate: Date,
    ruleset: RulesetParams
  ): Promise<number> {
    const weekStart = dayjs(weekStartDate).format('YYYY-MM-DD');
    const weekEnd = dayjs(weekStartDate).add(6, 'days').format('YYYY-MM-DD');

    // Get all member scores for the week
    const result = await query(
      `SELECT m.id as member_id, SUM(msd.total_points) as weekly_points
       FROM members m
       LEFT JOIN member_score_daily msd ON m.id = msd.member_id
       WHERE m.club_id = $1
       AND m.status = 'ACTIVE'
       AND msd.date >= $2 AND msd.date <= $3
       GROUP BY m.id
       HAVING SUM(msd.total_points) > 0 
         OR EXISTS (
           SELECT 1 FROM checkins c 
           WHERE c.member_id = m.id 
           AND DATE(c.timestamp) >= $2 
           AND DATE(c.timestamp) <= $3
         )
       ORDER BY weekly_points DESC
       LIMIT $4`,
      [clubId, weekStart, weekEnd, ruleset.topNContributors]
    );

    // Sum top N contributors
    const totalPoints = result.rows.reduce((sum, row) => sum + (row.weekly_points || 0), 0);

    return totalPoints;
  }

  /**
   * Calculate and store club daily scores for a season
   */
  static async calculateClubDailyScore(
    clubId: string,
    seasonId: string,
    date: Date,
    ruleset: RulesetParams
  ): Promise<void> {
    const dateStr = dayjs(date).format('YYYY-MM-DD');
    const weekStart = dayjs(date).startOf('week').format('YYYY-MM-DD');

    // Calculate weekly score
    const weeklyPoints = await this.calculateClubWeeklyScore(
      clubId,
      seasonId,
      new Date(weekStart),
      ruleset
    );

    // Count contributors for the day
    const contributorsResult = await query(
      `SELECT COUNT(DISTINCT m.id) as count
       FROM members m
       JOIN member_score_daily msd ON m.id = msd.member_id
       WHERE m.club_id = $1
       AND msd.date = $2
       AND msd.total_points > 0`,
      [clubId, dateStr]
    );
    const contributorsCount = contributorsResult.rows[0]?.count || 0;

    // Store daily snapshot
    await query(
      `INSERT INTO club_score_daily 
       (club_id, season_id, date, total_points, contributors_count, top_n_used, calculated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (club_id, season_id, date)
       DO UPDATE SET
         total_points = EXCLUDED.total_points,
         contributors_count = EXCLUDED.contributors_count,
         calculated_at = NOW()`,
      [clubId, seasonId, dateStr, weeklyPoints, contributorsCount, ruleset.topNContributors]
    );
  }

  /**
   * Recalculate all scores for a specific day (used by cron job)
   */
  static async recalculateDailyScores(date: Date): Promise<void> {
    console.log(`🔄 Recalculating scores for ${dayjs(date).format('YYYY-MM-DD')}`);

    // Get default ruleset
    const rulesetResult = await query(
      `SELECT params FROM rulesets ORDER BY created_at DESC LIMIT 1`
    );
    const ruleset: RulesetParams = rulesetResult.rows[0]?.params;

    if (!ruleset) {
      throw new Error('No ruleset found');
    }

    // Get all active members
    const membersResult = await query(
      `SELECT id FROM members WHERE status = 'ACTIVE'`
    );

    // Calculate score for each member
    for (const member of membersResult.rows) {
      try {
        await this.calculateMemberDailyScore(member.id, date, ruleset);
      } catch (error) {
        console.error(`Error calculating score for member ${member.id}:`, error);
      }
    }

    // Get all active seasons
    const seasonsResult = await query(
      `SELECT s.id, sc.club_id 
       FROM seasons s
       JOIN season_clubs sc ON s.id = sc.season_id
       WHERE s.status = 'ACTIVE'
       AND s.start_date <= $1
       AND s.end_date >= $1`,
      [date]
    );

    // Calculate club scores
    for (const row of seasonsResult.rows) {
      try {
        await this.calculateClubDailyScore(row.club_id, row.id, date, ruleset);
      } catch (error) {
        console.error(`Error calculating club score for ${row.club_id}:`, error);
      }
    }

    console.log('✅ Daily score recalculation complete');
  }
}

export default ScoringService;
