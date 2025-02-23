export type UserRole = 'member' | 'admin' | 'curator';

export interface Permission {
  action: 'create' | 'read' | 'update' | 'delete' | 'share' | 'annotate';
  resource: 'content' | 'comment' | 'annotation' | 'user' | 'settings';
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  email: string;
  familyBranch?: string;
  permissions: Permission[];
}

export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};
