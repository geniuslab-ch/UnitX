import { query } from '../database/connection';
import { LeagueTier, RulesetParams } from '../types';
import dayjs from 'dayjs';

/**
 * Service for managing league standings and promotions/demotions
 */
export class LeagueService {
  /**
   * Calculate and update league standings for a week
   */
  static async calculateWeeklyStandings(
    seasonId: string,
    weekStartDate: Date
  ): Promise<void> {
    console.log(`🏆 Calculating standings for week ${dayjs(weekStartDate).format('YYYY-MM-DD')}`);

    const weekStart = dayjs(weekStartDate).format('YYYY-MM-DD');
    const weekEnd = dayjs(weekStartDate).add(6, 'days').format('YYYY-MM-DD');

    // Get all clubs in the season grouped by tier
    const clubsResult = await query(
      `SELECT sc.club_id, sc.league_tier, c.name as club_name
       FROM season_clubs sc
       JOIN clubs c ON sc.club_id = c.id
       WHERE sc.season_id = $1
       ORDER BY sc.league_tier, sc.club_id`,
      [seasonId]
    );

    // Group by tier
    const tierClubs: { [key: string]: any[] } = {
      GOLD: [],
      SILVER: [],
      BRONZE: [],
    };

    for (const club of clubsResult.rows) {
      if (!tierClubs[club.league_tier]) {
        tierClubs[club.league_tier] = [];
      }
      tierClubs[club.league_tier].push(club);
    }

    // Calculate points for each tier
    for (const [tier, clubs] of Object.entries(tierClubs)) {
      if (clubs.length === 0) continue;

      const clubIds = clubs.map(c => c.club_id);

      // Get weekly points for all clubs in this tier
      const pointsResult = await query(
        `SELECT 
          csd.club_id,
          SUM(csd.total_points) as weekly_points
         FROM club_score_daily csd
         WHERE csd.season_id = $1
         AND csd.club_id = ANY($2)
         AND csd.date >= $3
         AND csd.date <= $4
         GROUP BY csd.club_id
         ORDER BY weekly_points DESC`,
        [seasonId, clubIds, weekStart, weekEnd]
      );

      // Create standings with ranking
      const standings = pointsResult.rows.map((row, index) => ({
        ...row,
        rank: index + 1,
        tier: tier as LeagueTier,
      }));

      // Determine promotions and demotions
      const promotionCount = parseInt(process.env.PROMOTION_COUNT || '2');
      const demotionCount = parseInt(process.env.DEMOTION_COUNT || '2');

      for (let i = 0; i < standings.length; i++) {
        const standing = standings[i];
        let promotion = false;
        let demotion = false;

        // Top N get promoted (except if already in GOLD)
        if (i < promotionCount && tier !== LeagueTier.GOLD) {
          promotion = true;
        }

        // Bottom N get demoted (except if already in BRONZE)
        if (i >= standings.length - demotionCount && tier !== LeagueTier.BRONZE) {
          demotion = true;
        }

        // Insert standing
        await query(
          `INSERT INTO league_standings 
           (season_id, club_id, week_start_date, tier, rank, points, promotion, demotion, calculated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
           ON CONFLICT (season_id, club_id, week_start_date)
           DO UPDATE SET
             tier = EXCLUDED.tier,
             rank = EXCLUDED.rank,
             points = EXCLUDED.points,
             promotion = EXCLUDED.promotion,
             demotion = EXCLUDED.demotion,
             calculated_at = NOW()`,
          [
            seasonId,
            standing.club_id,
            weekStart,
            tier,
            standing.rank,
            standing.weekly_points || 0,
            promotion,
            demotion,
          ]
        );
      }
    }

    console.log('✅ Weekly standings calculated');
  }

  /**
   * Apply promotions and demotions after a week ends
   */
  static async applyPromotionsDemotions(
    seasonId: string,
    weekStartDate: Date
  ): Promise<void> {
    console.log(`⬆️⬇️ Applying promotions/demotions for week ${dayjs(weekStartDate).format('YYYY-MM-DD')}`);

    const weekStart = dayjs(weekStartDate).format('YYYY-MM-DD');

    // Get all standings with promotions
    const promotionsResult = await query(
      `SELECT club_id, tier 
       FROM league_standings
       WHERE season_id = $1
       AND week_start_date = $2
       AND promotion = true`,
      [seasonId, weekStart]
    );

    // Promote clubs
    for (const row of promotionsResult.rows) {
      const newTier = this.getNextTierUp(row.tier);
      if (newTier) {
        await query(
          `UPDATE season_clubs 
           SET league_tier = $1 
           WHERE season_id = $2 AND club_id = $3`,
          [newTier, seasonId, row.club_id]
        );
        console.log(`📈 Club ${row.club_id} promoted to ${newTier}`);
      }
    }

    // Get all standings with demotions
    const demotionsResult = await query(
      `SELECT club_id, tier 
       FROM league_standings
       WHERE season_id = $1
       AND week_start_date = $2
       AND demotion = true`,
      [seasonId, weekStart]
    );

    // Demote clubs
    for (const row of demotionsResult.rows) {
      const newTier = this.getNextTierDown(row.tier);
      if (newTier) {
        await query(
          `UPDATE season_clubs 
           SET league_tier = $1 
           WHERE season_id = $2 AND club_id = $3`,
          [newTier, seasonId, row.club_id]
        );
        console.log(`📉 Club ${row.club_id} demoted to ${newTier}`);
      }
    }

    console.log('✅ Promotions/demotions applied');
  }

  /**
   * Get next tier up
   */
  static getNextTierUp(currentTier: LeagueTier): LeagueTier | null {
    switch (currentTier) {
      case LeagueTier.BRONZE:
        return LeagueTier.SILVER;
      case LeagueTier.SILVER:
        return LeagueTier.GOLD;
      case LeagueTier.GOLD:
        return null; // Already at top
      default:
        return null;
    }
  }

  /**
   * Get next tier down
   */
  static getNextTierDown(currentTier: LeagueTier): LeagueTier | null {
    switch (currentTier) {
      case LeagueTier.GOLD:
        return LeagueTier.SILVER;
      case LeagueTier.SILVER:
        return LeagueTier.BRONZE;
      case LeagueTier.BRONZE:
        return null; // Already at bottom
      default:
        return null;
    }
  }

  /**
   * Get current standings for a season
   */
  static async getCurrentStandings(
    seasonId: string,
    tier?: LeagueTier
  ): Promise<any[]> {
    // Get most recent week
    const weekResult = await query(
      `SELECT MAX(week_start_date) as latest_week
       FROM league_standings
       WHERE season_id = $1`,
      [seasonId]
    );

    const latestWeek = weekResult.rows[0]?.latest_week;
    if (!latestWeek) {
      return [];
    }

    // Get standings
    let queryStr = `
      SELECT 
        ls.*,
        c.name as club_name,
        c.city
      FROM league_standings ls
      JOIN clubs c ON ls.club_id = c.id
      WHERE ls.season_id = $1
      AND ls.week_start_date = $2
    `;
    const params: any[] = [seasonId, latestWeek];

    if (tier) {
      queryStr += ' AND ls.tier = $3';
      params.push(tier);
    }

    queryStr += ' ORDER BY ls.tier DESC, ls.rank ASC';

    const result = await query(queryStr, params);
    return result.rows;
  }

  /**
   * Get club's position in standings
   */
  static async getClubStanding(
    seasonId: string,
    clubId: string
  ): Promise<any | null> {
    const weekResult = await query(
      `SELECT MAX(week_start_date) as latest_week
       FROM league_standings
       WHERE season_id = $1`,
      [seasonId]
    );

    const latestWeek = weekResult.rows[0]?.latest_week;
    if (!latestWeek) {
      return null;
    }

    const result = await query(
      `SELECT 
        ls.*,
        c.name as club_name
      FROM league_standings ls
      JOIN clubs c ON ls.club_id = c.id
      WHERE ls.season_id = $1
      AND ls.club_id = $2
      AND ls.week_start_date = $3`,
      [seasonId, clubId, latestWeek]
    );

    return result.rows[0] || null;
  }
}

export default LeagueService;
