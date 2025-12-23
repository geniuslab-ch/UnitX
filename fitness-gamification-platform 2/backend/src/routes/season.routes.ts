import { Router, Request, Response } from 'express';
import { query } from '../database/db';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Get all seasons
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { status, brand_id } = req.query;
    
    let sql = `
      SELECT s.*, b.name as brand_name,
             COUNT(DISTINCT sc.club_id) as club_count
      FROM seasons s
      LEFT JOIN brands b ON s.brand_id = b.id
      LEFT JOIN season_clubs sc ON s.id = sc.season_id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (status) {
      params.push(status);
      sql += ` AND s.status = $${params.length}`;
    }
    
    if (brand_id) {
      params.push(brand_id);
      sql += ` AND s.brand_id = $${params.length}`;
    }
    
    sql += ' GROUP BY s.id, b.name ORDER BY s.start_date DESC';
    
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get seasons error:', error);
    res.status(500).json({ error: 'Failed to fetch seasons' });
  }
});

// Get season by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT s.*, b.name as brand_name
       FROM seasons s
       LEFT JOIN brands b ON s.brand_id = b.id
       WHERE s.id = $1`,
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Season not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get season error:', error);
    res.status(500).json({ error: 'Failed to fetch season' });
  }
});

// Create season
router.post('/', authenticateToken, requireRole('SUPER_ADMIN', 'BRAND_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      scope, 
      brand_id, 
      start_date, 
      end_date, 
      min_checkins_per_week,
      max_checkins_per_week 
    } = req.body;
    
    if (!name || !scope || !start_date || !end_date) {
      return res.status(400).json({ error: 'Name, scope, start_date and end_date are required' });
    }
    
    const result = await query(
      `INSERT INTO seasons (
        name, scope, brand_id, start_date, end_date,
        min_checkins_per_week, max_checkins_per_week, 
        created_by, status
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        name, 
        scope, 
        brand_id, 
        start_date, 
        end_date,
        min_checkins_per_week || 1,
        max_checkins_per_week,
        req.user?.user_id,
        'DRAFT'
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create season error:', error);
    res.status(500).json({ error: 'Failed to create season' });
  }
});

// Update season
router.put('/:id', authenticateToken, requireRole('SUPER_ADMIN', 'BRAND_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      scope, 
      brand_id, 
      start_date, 
      end_date, 
      status,
      min_checkins_per_week,
      max_checkins_per_week 
    } = req.body;
    
    const result = await query(
      `UPDATE seasons 
       SET name = COALESCE($1, name),
           scope = COALESCE($2, scope),
           brand_id = COALESCE($3, brand_id),
           start_date = COALESCE($4, start_date),
           end_date = COALESCE($5, end_date),
           status = COALESCE($6, status),
           min_checkins_per_week = COALESCE($7, min_checkins_per_week),
           max_checkins_per_week = COALESCE($8, max_checkins_per_week),
           updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [name, scope, brand_id, start_date, end_date, status, min_checkins_per_week, max_checkins_per_week, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Season not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update season error:', error);
    res.status(500).json({ error: 'Failed to update season' });
  }
});

// Delete season
router.delete('/:id', authenticateToken, requireRole('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const result = await query(
      'UPDATE seasons SET status = $1 WHERE id = $2 RETURNING *',
      ['CANCELLED', req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Season not found' });
    }
    
    res.json({ message: 'Season cancelled successfully' });
  } catch (error) {
    console.error('Delete season error:', error);
    res.status(500).json({ error: 'Failed to cancel season' });
  }
});
// Get monthly standings for a season
router.get('/:id/standings', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { month, year } = req.query;
    
    let sql = `
      SELECT ws.*, c.name as club_name, c.city,
             ws.club_rank,
             ws.total_points,
             ws.total_checkins,
             ws.week_number as month_number
      FROM weekly_standings ws
      JOIN clubs c ON ws.club_id = c.id
      WHERE ws.season_id = $1
    `;
    
    const params: any[] = [req.params.id];
    
    if (month && year) {
      sql += ` AND EXTRACT(MONTH FROM ws.week_start) = $2 AND EXTRACT(YEAR FROM ws.week_start) = $3`;
      params.push(month, year);
    } else {
      // Current month by default
      sql += ` AND ws.week_start >= date_trunc('month', CURRENT_DATE)`;
    }
    
    sql += ` ORDER BY ws.club_rank ASC`;
    
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get standings error:', error);
    res.status(500).json({ error: 'Failed to fetch standings' });
  }
});

// Get season progress (percentage complete)
router.get('/:id/progress', authenticateToken, async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT 
         start_date, 
         end_date,
         status,
         CASE 
           WHEN status = 'DRAFT' THEN 0
           WHEN status = 'COMPLETED' THEN 100
           WHEN status = 'ACTIVE' THEN 
             ROUND(
               (EXTRACT(EPOCH FROM (CURRENT_DATE - start_date)) / 
                EXTRACT(EPOCH FROM (end_date - start_date))) * 100
             )
         END as progress_percentage,
         CASE 
           WHEN status = 'ACTIVE' THEN 
             EXTRACT(EPOCH FROM (end_date - CURRENT_DATE)) / 86400
         END as days_remaining
       FROM seasons
       WHERE id = $1`,
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Season not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});
export default router;
