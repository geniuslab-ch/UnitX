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

    // Get member directly (no user_auth table)
    const result = await query(
      `SELECT id, email, password_hash, role, first_name, last_name
       FROM members
       WHERE email = $1 AND status = $2`,
      [email, 'ACTIVE']
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const member = result.rows[0];

    // Verify password
    const isValid = await bcrypt.compare(password, member.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const token = generateToken({
      user_id: member.id,
      role: member.role,
      member_id: member.id,
    });

    const refreshToken = generateRefreshToken({
      user_id: member.id,
      role: member.role,
      member_id: member.id,
    });

    res.json({
      token,
      refresh_token: refreshToken,
      user: {
        id: member.id,
        email: member.email,
        role: member.role,
        first_name: member.first_name,
        last_name: member.last_name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});
```

**Commit sur GitHub**

---

## Railway Rebuild Automatique

Railway va détecter le changement et rebuild le backend automatiquement (2-3 min).

---

## Après le Rebuild

**Retestez le login:**
```
Email: admin@unitx.com
Password: admin123
