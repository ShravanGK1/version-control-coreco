export type VersionType = "major" | "minor" | "bug-fix";

export interface VersionRecord {
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

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface VersionListResponse {
  data: VersionRecord[];
  pagination: Pagination;
}

export interface VersionFilters {
  search?: string;
  projectId?: number | string;
  versionType?: VersionType | "";
  startDate?: string;
  endDate?: string;
  showDeleted?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateVersionRequest {
  projectId: number;
  version: VersionType;
  versionTitle: string;
  versionInfo: unknown;
}

export interface UpdateVersionRequest {
  projectId: number;
  version: VersionType;
  versionTitle: string;
  versionInfo: unknown;
}

export interface NextVersionNumberResponse {
  versionNumber: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}
