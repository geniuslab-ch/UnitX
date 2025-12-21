import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { query } from '../database/connection';
import { generateToken, generateRefreshToken } from '../middleware/auth';
import { UserRole, AuthProvider, EntityStatus } from '../types';

const router = Router();

/**
 * POST /auth/signup
 * Register new user
 */
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, first_name, last_name, club_code } = req.body;

    // Validate
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Check if email exists
    const existingUser = await query(
      'SELECT id FROM user_auth WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
    const passwordHash = await bcrypt.hash(password, rounds);

    // Create user
    const userResult = await query(
      `INSERT INTO user_auth (email, password_hash, provider, role, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, role`,
      [email, passwordHash, AuthProvider.EMAIL, UserRole.MEMBER, EntityStatus.ACTIVE]
    );

    const user = userResult.rows[0];

    // Find club by code if provided
    let clubId = null;
    if (club_code) {
      const clubResult = await query(
        'SELECT id FROM clubs WHERE external_club_id = $1 AND status = $2',
        [club_code, EntityStatus.ACTIVE]
      );
      if (clubResult.rows.length > 0) {
        clubId = clubResult.rows[0].id;
      }
    }

    // Create member profile
    const memberResult = await query(
      `INSERT INTO members (user_auth_id, club_id, first_name, last_name, email, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [user.id, clubId, first_name, last_name, email, EntityStatus.ACTIVE]
    );

    const memberId = memberResult.rows[0].id;

    // Generate tokens
    const token = generateToken({
      user_id: user.id,
      role: user.role,
      member_id: memberId,
    });

    const refreshToken = generateRefreshToken({
      user_id: user.id,
      role: user.role,
      member_id: memberId,
    });

    res.status(201).json({
      token,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        member_id: memberId,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /auth/login
 * Login with email/password
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Get user
    const userResult = await query(
      `SELECT ua.*, m.id as member_id
       FROM user_auth ua
       LEFT JOIN members m ON ua.id = m.user_auth_id
       WHERE ua.email = $1 AND ua.status = $2`,
      [email, EntityStatus.ACTIVE]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await query(
      'UPDATE user_auth SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate tokens
    const token = generateToken({
      user_id: user.id,
      role: user.role,
      member_id: user.member_id,
    });

    const refreshToken = generateRefreshToken({
      user_id: user.id,
      role: user.role,
      member_id: user.member_id,
    });

    res.json({
      token,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        member_id: user.member_id,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /auth/apple
 * Sign in with Apple (placeholder)
 */
router.post('/apple', async (req: Request, res: Response) => {
  try {
    const { identity_token, user_info } = req.body;

    // TODO: Verify Apple identity token
    // For MVP, implement simplified version

    res.status(501).json({ error: 'Apple Sign-In not yet implemented' });
  } catch (error) {
    console.error('Apple auth error:', error);
    res.status(500).json({ error: 'Apple authentication failed' });
  }
});

/**
 * POST /auth/google
 * Sign in with Google (placeholder)
 */
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { id_token } = req.body;

    // TODO: Verify Google ID token
    // For MVP, implement simplified version

    res.status(501).json({ error: 'Google Sign-In not yet implemented' });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

/**
 * POST /auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    // TODO: Verify refresh token and issue new access token
    res.status(501).json({ error: 'Token refresh not yet implemented' });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

export default router;
