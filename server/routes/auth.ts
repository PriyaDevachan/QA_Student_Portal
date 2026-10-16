import { Router, Request, Response } from 'express';
import { AdminUser } from '../types.ts';

export const authRouter = Router();

const DEFAULT_ADMIN: AdminUser = {
  id: 'usr_admin_001',
  name: 'Dr. Sarah Lin',
  email: 'admin@academy.edu',
  role: 'System Administrator',
  department: 'Office of the Registrar & Admissions',
  avatarUrl: '/src/assets/images/admin_avatar_1792176986607.jpg'
};

/**
 * POST /api/auth/login
 * Administrator sign-in
 */
authRouter.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please enter both an administrative email and password.'
    });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Allow standard admin credentials or any edu/admin credentials for demo flexibility
  if (
    (cleanEmail === 'admin@academy.edu' && password === 'admin123') ||
    (cleanEmail.includes('admin') && password.length >= 6) ||
    password === 'admin123'
  ) {
    const user: AdminUser = {
      ...DEFAULT_ADMIN,
      email: cleanEmail,
      name: cleanEmail === 'admin@academy.edu' ? DEFAULT_ADMIN.name : cleanEmail.split('@')[0].replace(/[._]/g, ' ')
    };

    const token = `adm_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return res.json({
      success: true,
      message: 'Authentication successful. Welcome to Student Management Portal.',
      token,
      user
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Invalid administrative credentials. Use admin@academy.edu with password admin123.'
  });
});

/**
 * GET /api/auth/me
 * Check current logged in user
 */
authRouter.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      authenticated: false,
      error: 'No active administrative session token provided.'
    });
  }

  res.json({
    success: true,
    authenticated: true,
    user: DEFAULT_ADMIN
  });
});

/**
 * POST /api/auth/logout
 */
authRouter.post('/logout', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Administrator signed out successfully.'
  });
});
