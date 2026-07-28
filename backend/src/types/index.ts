import { Request } from 'express';

export interface JwtPayload {
  userId: number;
  roleId: number;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export type VersionType = 'major' | 'minor' | 'bug-fix';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FormattedUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface FormattedProject {
  id: number;
  name: string;
  isActive: boolean;
  createdBy: number;
  createdAt: string;
  updatedBy: number | null;
  updatedAt: string | null;
}

export interface FormattedVersionRecord {
  id: number;
  projectId: number;
  projectName: string;
  version: VersionType;
  versionNumber: string;
  versionTitle: string;
  versionInfo: unknown;
  isActive: boolean;
  createdBy: number;
  createdAt: string;
  updatedBy: number | null;
  updatedAt: string | null;
}
