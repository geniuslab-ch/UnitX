import { Router, Request, Response } from 'express';
import { query } from '../database/db';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Get all brands
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM brands WHERE status = $1 ORDER BY name',
      ['ACTIVE']
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// Get brand by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM brands WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get brand error:', error);
    res.status(500).json({ error: 'Failed to fetch brand' });
  }
});

// Create brand
router.post('/', authenticateToken, requireRole('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { name, country, logo_url, primary_color } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const result = await query(
      `INSERT INTO brands (name, country, logo_url, primary_color, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, country, logo_url, primary_color, 'ACTIVE']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create brand error:', error);
    res.status(500).json({ error: 'Failed to create brand' });
  }
});

// Update brand
router.put('/:id', authenticateToken, requireRole('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const { name, country, logo_url, primary_color, status } = req.body;
    
    const result = await query(
      `UPDATE brands 
       SET name = COALESCE($1, name),
           country = COALESCE($2, country),
           logo_url = COALESCE($3, logo_url),
           primary_color = COALESCE($4, primary_color),
           status = COALESCE($5, status),
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [name, country, logo_url, primary_color, status, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update brand error:', error);
    res.status(500).json({ error: 'Failed to update brand' });
  }
});

// Delete brand
router.delete('/:id', authenticateToken, requireRole('SUPER_ADMIN'), async (req: Request, res: Response) => {
  try {
    const result = await query(
      'UPDATE brands SET status = $1 WHERE id = $2 RETURNING *',
      ['DELETED', req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Delete brand error:', error);
    res.status(500).json({ error: 'Failed to delete brand' });
  }
});

export default router;
