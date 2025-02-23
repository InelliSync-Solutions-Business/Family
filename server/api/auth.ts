import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest } from '../types/api';
import { User, LoginCredentials } from '../../src/types/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Hardcoded users for demo (replace with database in production)
const users: (User & { password: string })[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@family.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    permissions: [
      { action: 'create', resource: 'content' },
      { action: 'read', resource: 'content' },
      { action: 'update', resource: 'content' },
      { action: 'delete', resource: 'content' },
      { action: 'share', resource: 'content' },
    ],
  },
  {
    id: '2',
    name: 'Family Member',
    email: 'member@family.com',
    password: bcrypt.hashSync('member123', 10),
    role: 'member',
    permissions: [
      { action: 'read', resource: 'content' },
      { action: 'create', resource: 'content' },
      { action: 'share', resource: 'content' },
    ],
  },
];

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password }: LoginCredentials = req.body;

    const user = users.find((u) => u.email === email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
        status: 401,
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = jwt.sign(userWithoutPassword, JWT_SECRET, {
      expiresIn: '24h',
    });

    res.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      code: 'SERVER_ERROR',
      status: 500,
    });
  }
});

// Logout route
router.post('/logout', authenticateToken, (req, res) => {
  // In a real implementation, you might want to invalidate the token
  // For now, we'll just return a success response
  res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      message: 'Authentication required',
      code: 'AUTH_REQUIRED',
      status: 401,
    });
  }
  res.json({ user });
});

export default router;
