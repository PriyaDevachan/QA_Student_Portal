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
 * GET /api/auth/login
 * Status and diagnostic info
 */
authRouter.get('/login', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Authentication service active. Send POST with credentials to log in.',
    defaultCredentials: {
      email: 'admin@academy.edu',
      password: 'admin123'
    }
  });
});

/**
 * POST /api/auth/login
 * Administrator sign-in
 */
authRouter.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body || {};

  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Please enter an administrator email address.'
    });
  }

  if (!password || typeof password !== 'string' || !password.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Please enter your administrator password.'
    });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();

  // Accept standard default credentials and administrative variations
  const isDefaultAdmin = 
    cleanEmail === 'admin@academy.edu' ||
    cleanEmail === 'admin' ||
    cleanEmail.startsWith('admin') ||
    cleanEmail.endsWith('@academy.edu');

  const isAcceptedPass = 
    cleanPass === 'admin123' ||
    cleanPass === 'admin' ||
    cleanPass === 'password' ||
    cleanPass === 'admin@123' ||
    cleanPass.length >= 4;

  if (isDefaultAdmin && isAcceptedPass) {
    const user: AdminUser = {
      ...DEFAULT_ADMIN,
      email: cleanEmail.includes('@') ? cleanEmail : 'admin@academy.edu',
      name: cleanEmail === 'admin@academy.edu' ? DEFAULT_ADMIN.name : 'Administrator'
    };

    const token = `adm_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return res.json({
      success: true,
      message: 'Authentication successful. Welcome to Student Management Portal.',
      token,
      user
    });
  }

  // Also allow any valid email with password "admin123" or demo length >= 6
  if (cleanPass === 'admin123' || (cleanEmail.includes('@') && cleanPass.length >= 6)) {
    const user: AdminUser = {
      ...DEFAULT_ADMIN,
      email: cleanEmail,
      name: cleanEmail.split('@')[0].replace(/[._]/g, ' ')
    };

    const token = `adm_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return res.json({
      success: true,
      message: 'Authentication successful.',
      token,
      user
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Invalid credentials. Please use admin@academy.edu with password admin123.'
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
