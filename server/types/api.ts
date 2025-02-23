import { Request } from 'express';
import { User } from '../../src/types/auth';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export interface PaginationQuery {
  cursor?: string;
  limit?: string;
}

export interface ContentQuery extends PaginationQuery {
  isPrivate?: string;
  type?: string;
  tags?: string;
  search?: string;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}
