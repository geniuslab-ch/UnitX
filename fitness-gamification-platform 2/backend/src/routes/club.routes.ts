import { Router, Request, Response } from 'express';
import { query } from '../database/db';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Get all clubs
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { brand_id, search } = req.query;
    
    let sql = `
      SELECT c.*, b.name as brand_name 
      FROM clubs c
      LEFT JOIN brands b ON c.brand_id = b.id
      WHERE c.status = 'ACTIVE'
    `;
    const params: any[] = [];
    
    if (brand_id) {
      params.push(brand_id);
      sql += ` AND c.brand_id = $${params.length}`;
    }
    
    if (search) {
      params.push(`%${search}%`);
      sql += ` AND c.name ILIKE $${params.length}`;
    }
    
    sql += ' ORDER BY c.name';
    
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get clubs error:', error);
    res.status(500).json({ error: 'Failed to fetch clubs' });
  }
});

// Get club by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT c.*, b.name as brand_name 
       FROM clubs c
       LEFT JOIN brands b ON c.brand_id = b.id
       WHERE c.id = $1`,
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Club not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get club error:', error);
    res.status(500).json({ error: 'Failed to fetch club' });
  }
});

// Create club
router.post('/', authenticateToken, requireRole('SUPER_ADMIN', 'BRAND_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { brand_id, external_club_id, name, city, address, timezone } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const result = await query(
      `INSERT INTO clubs (brand_id, external_club_id, name, city, address, timezone, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [brand_id, external_club_id, name, city, address, timezone || 'UTC', 'ACTIVE']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create club error:', error);
    res.status(500).json({ error: 'Failed to create club' });
  }
});

// Update club
router.put('/:id', authenticateToken, requireRole('SUPER_ADMIN', 'BRAND_ADMIN', 'CLUB_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { brand_id, external_club_id, name, city, address, timezone, status } = req.body;
    
    const result = await query(
      `UPDATE clubs 
       SET brand_id = COALESCE($1, brand_id),
           external_club_id = COALESCE($2, external_club_id),
           name = COALESCE($3, name),
           city = COALESCE($4, city),
           address = COALESCE($5, address),
           timezone = COALESCE($6, timezone),
           status = COALESCE($7, status),
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [brand_id, external_club_id, name, city, address, timezone, status, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Club not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update club error:', error);
    res.status(500).json({ error: 'Failed to update club' });
  }
});

// Delete club
router.delete('/:id', authenticateToken, requireRole('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const result = await query(
      'UPDATE clubs SET status = $1 WHERE id = $2 RETURNING *',
      ['DELETED', req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Club not found' });
    }
    
    res.json({ message: 'Club deleted successfully' });
  } catch (error) {
    console.error('Delete club error:', error);
    res.status(500).json({ error: 'Failed to delete club' });
  }
});

export default router;
