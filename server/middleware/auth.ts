import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types/api';
import { User } from '../../src/types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'Authentication required',
      code: 'AUTH_REQUIRED',
      status: 401,
    });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET) as User;
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({
      message: 'Invalid or expired token',
      code: 'INVALID_TOKEN',
      status: 403,
    });
  }
}

export function requirePermission(action: string, resource: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
        status: 401,
      });
    }

    const hasPermission = user.permissions.some(
      (p) => p.action === action && p.resource === resource
    );

    if (!hasPermission) {
      return res.status(403).json({
        message: 'Permission denied',
        code: 'PERMISSION_DENIED',
        status: 403,
      });
    }

    next();
  };
}
