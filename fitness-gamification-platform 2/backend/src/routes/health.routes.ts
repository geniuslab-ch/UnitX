import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { query } from '../database/connection';
import { QRService } from '../services/qr.service';
import dayjs from 'dayjs';
import { HealthDataSource } from '../types';

const router = Router();

/**
 * POST /health/sync
 * Sync health data from mobile app
 */
router.post('/sync', authenticateToken, async (req: Request, res: Response) => {
  try {
    const memberId = req.user?.member_id;
    if (!memberId) {
      return res.status(400).json({ error: 'Member ID required' });
    }

    const {
      date,
      active_calories,
      steps,
      workout_minutes,
      source,
      timezone,
      device_info,
    } = req.body;

    // Validate
    if (!date || active_calories === undefined) {
      return res.status(400).json({ error: 'Date and active_calories required' });
    }

    // Check for anomalies
    let anomalyFlag = false;
    let anomalyReason = null;

    const maxCalories = parseInt(process.env.MAX_CALORIES_PER_DAY || '2500');
    if (active_calories > maxCalories) {
      anomalyFlag = true;
      anomalyReason = 'Exceeds maximum daily calories';
    }

    // Check for spike from previous day
    const previousDay = dayjs(date).subtract(1, 'day').format('YYYY-MM-DD');
    const prevResult = await query(
      'SELECT active_calories FROM health_daily_summary WHERE member_id = $1 AND date = $2',
      [memberId, previousDay]
    );

    if (prevResult.rows.length > 0) {
      const prevCalories = prevResult.rows[0].active_calories;
      const spike = active_calories - prevCalories;
      const maxSpike = parseInt(process.env.MAX_CALORIES_SPIKE_30MIN || '1000');

      if (spike > maxSpike) {
        anomalyFlag = true;
        anomalyReason = anomalyReason 
          ? `${anomalyReason}; Unusual spike from previous day`
          : 'Unusual spike from previous day';
      }
    }

    // Upsert health data
    const result = await query(
      `INSERT INTO health_daily_summary 
       (member_id, date, active_calories, steps, workout_minutes, source, device_info, anomaly_flag, anomaly_reason, last_sync_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       ON CONFLICT (member_id, date)
       DO UPDATE SET
         active_calories = EXCLUDED.active_calories,
         steps = EXCLUDED.steps,
         workout_minutes = EXCLUDED.workout_minutes,
         source = EXCLUDED.source,
         device_info = EXCLUDED.device_info,
         anomaly_flag = EXCLUDED.anomaly_flag,
         anomaly_reason = EXCLUDED.anomaly_reason,
         last_sync_at = NOW()
       RETURNING *`,
      [
        memberId,
        date,
        active_calories,
        steps || 0,
        workout_minutes || 0,
        source || HealthDataSource.MANUAL,
        device_info ? JSON.stringify(device_info) : null,
        anomalyFlag,
        anomalyReason,
      ]
    );

    res.json({
      success: true,
      data: result.rows[0],
      anomaly_detected: anomalyFlag,
    });
  } catch (error) {
    console.error('Health sync error:', error);
    res.status(500).json({ error: 'Failed to sync health data' });
  }
});

/**
 * POST /checkin
 * Check in to a club using QR code
 */
router.post('/checkin', authenticateToken, async (req: Request, res: Response) => {
  try {
    const memberId = req.user?.member_id;
    if (!memberId) {
      return res.status(400).json({ error: 'Member ID required' });
    }

    const { club_id, qr_token, timestamp, device_info } = req.body;

    if (!club_id || !qr_token || !timestamp) {
      return res.status(400).json({ error: 'club_id, qr_token, and timestamp required' });
    }

    // Check in using QR service
    const checkin = await QRService.checkInMember(
      memberId,
      club_id,
      qr_token,
      timestamp,
      device_info
    );

    // Update member's club if different
    await query(
      'UPDATE members SET club_id = $1 WHERE id = $2 AND (club_id IS NULL OR club_id != $1)',
      [club_id, memberId]
    );

    res.json({
      success: true,
      checkin: {
        id: checkin.id,
        timestamp: checkin.timestamp,
        club_id: checkin.club_id,
      },
    });
  } catch (error: any) {
    console.error('Check-in error:', error);
    res.status(400).json({ error: error.message || 'Check-in failed' });
  }
});

/**
 * GET /members/me/score
 * Get member's score for a date range
 */
router.get('/members/me/score', authenticateToken, async (req: Request, res: Response) => {
  try {
    const memberId = req.user?.member_id;
    if (!memberId) {
      return res.status(400).json({ error: 'Member ID required' });
    }

    const range = req.query.range as string || 'week';
    let startDate: string;
    let endDate: string;

    if (range === 'today') {
      startDate = dayjs().format('YYYY-MM-DD');
      endDate = startDate;
    } else if (range === 'week') {
      startDate = dayjs().startOf('week').format('YYYY-MM-DD');
      endDate = dayjs().endOf('week').format('YYYY-MM-DD');
    } else if (range === 'month') {
      startDate = dayjs().startOf('month').format('YYYY-MM-DD');
      endDate = dayjs().endOf('month').format('YYYY-MM-DD');
    } else {
      startDate = req.query.start_date as string;
      endDate = req.query.end_date as string;
    }

    // Get scores
    const result = await query(
      `SELECT * FROM member_score_daily
       WHERE member_id = $1
       AND date >= $2
       AND date <= $3
       ORDER BY date DESC`,
      [memberId, startDate, endDate]
    );

    // Calculate totals
    const totals = result.rows.reduce(
      (acc, row) => ({
        checkin: acc.checkin + row.points_checkin,
        calories: acc.calories + row.points_calories,
        bonus: acc.bonus + row.points_bonus,
        total: acc.total + row.total_points,
      }),
      { checkin: 0, calories: 0, bonus: 0, total: 0 }
    );

    res.json({
      range,
      start_date: startDate,
      end_date: endDate,
      daily_scores: result.rows,
      totals,
      current_streak: result.rows[0]?.streak_days || 0,
    });
  } catch (error) {
    console.error('Score fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
});

/**
 * GET /members/me/stats
 * Get member's overall statistics
 */
router.get('/members/me/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const memberId = req.user?.member_id;
    if (!memberId) {
      return res.status(400).json({ error: 'Member ID required' });
    }

    // Get total points
    const pointsResult = await query(
      'SELECT SUM(total_points) as total FROM member_score_daily WHERE member_id = $1',
      [memberId]
    );

    // Get check-in count
    const checkinResult = await query(
      'SELECT COUNT(*) as count FROM checkins WHERE member_id = $1',
      [memberId]
    );

    // Get current streak
    const streakResult = await query(
      'SELECT streak_days FROM member_score_daily WHERE member_id = $1 ORDER BY date DESC LIMIT 1',
      [memberId]
    );

    // Get club rank (if applicable)
    const memberResult = await query(
      'SELECT club_id FROM members WHERE id = $1',
      [memberId]
    );
    const clubId = memberResult.rows[0]?.club_id;

    let rank = null;
    if (clubId) {
      const rankResult = await query(
        `WITH ranked AS (
          SELECT member_id, SUM(total_points) as total,
                 RANK() OVER (ORDER BY SUM(total_points) DESC) as rank
          FROM member_score_daily
          WHERE member_id IN (SELECT id FROM members WHERE club_id = $1 AND status = 'ACTIVE')
          GROUP BY member_id
        )
        SELECT rank FROM ranked WHERE member_id = $2`,
        [clubId, memberId]
      );
      rank = rankResult.rows[0]?.rank || null;
    }

    res.json({
      total_points: parseInt(pointsResult.rows[0]?.total || '0'),
      total_checkins: parseInt(checkinResult.rows[0]?.count || '0'),
      current_streak: streakResult.rows[0]?.streak_days || 0,
      club_rank: rank,
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

/**
 * POST /members/me/health-consent
 * Grant or revoke health data consent
 */
router.post('/members/me/health-consent', authenticateToken, async (req: Request, res: Response) => {
  try {
    const memberId = req.user?.member_id;
    if (!memberId) {
      return res.status(400).json({ error: 'Member ID required' });
    }

    const { granted } = req.body;

    if (granted === undefined) {
      return res.status(400).json({ error: 'granted field required (boolean)' });
    }

    await query(
      `UPDATE members 
       SET health_consent_granted = $1,
           health_consent_date = NOW()
       WHERE id = $2`,
      [granted, memberId]
    );

    res.json({ success: true, consent_granted: granted });
  } catch (error) {
    console.error('Consent update error:', error);
    res.status(500).json({ error: 'Failed to update consent' });
  }
});

export default router;
