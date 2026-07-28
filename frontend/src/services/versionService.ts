import { apiClient } from './api';
import {
  CreateVersionRequest,
  NextVersionNumberResponse,
  UpdateVersionRequest,
  VersionFilters,
  VersionListResponse,
  VersionRecord,
  VersionType,
} from '../types/version';
import { INITIAL_MOCK_PROJECTS, INITIAL_MOCK_VERSIONS } from './mockData';

// Local memory store for offline fallback testing
let mockVersionsStore: VersionRecord[] = [...INITIAL_MOCK_VERSIONS];

export const versionService = {
  /**
   * GET /versions
   */
  async getVersions(filters: VersionFilters): Promise<VersionListResponse> {
    try {
      const params: Record<string, any> = {};

      if (filters.search && filters.search.trim()) params.search = filters.search.trim();
      if (filters.projectId !== undefined && filters.projectId !== '') params.projectId = filters.projectId;
      if (filters.versionType) params.versionType = filters.versionType;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.showDeleted !== undefined) params.showDeleted = filters.showDeleted;
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;

      const response = await apiClient.get('/versions', { params });
      
      // Support standard format `{ data: VersionRecord[], pagination: Pagination }` or wrapped `{ data: { data: [], pagination: {} } }`
      const payload = response.data?.data && response.data?.pagination ? response.data : (response.data?.data || response.data);

      return {
        data: payload.data || [],
        pagination: payload.pagination || {
          page: filters.page || 1,
          limit: filters.limit || 10,
          total: payload.data ? payload.data.length : 0,
          totalPages: 1,
        },
      };
    } catch (error: any) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        console.warn('Backend API unavailable. Returning filtered mock version data.');
        return getMockFilteredVersions(filters);
      }
      throw error;
    }
  },

  /**
   * GET /versions/next-number?projectId=<id>&versionType=<major|minor|bug-fix>
   */
  async getNextVersionNumber(projectId: number, versionType: VersionType): Promise<NextVersionNumberResponse> {
    try {
      const response = await apiClient.get('/versions/next-number', {
        params: {
          projectId,
          versionType,
        },
      });
      const data = response.data?.data || response.data;
      return { versionNumber: data.versionNumber || data };
    } catch (error: any) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        console.warn('Backend API unavailable. Computing mock next version number.');
        return { versionNumber: calculateMockNextNumber(projectId, versionType) };
      }
      throw error;
    }
  },

  /**
   * POST /versions
   */
  async createVersion(payload: CreateVersionRequest): Promise<VersionRecord> {
    try {
      const response = await apiClient.post('/versions', payload);
      return response.data?.data || response.data;
    } catch (error: any) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        console.warn('Backend API unavailable. Creating version in mock store.');
        const project = INITIAL_MOCK_PROJECTS.find((p) => p.id === Number(payload.projectId));
        const newRecord: VersionRecord = {
          id: Date.now(),
          projectId: Number(payload.projectId),
          projectName: project ? project.name : `Project #${payload.projectId}`,
          version: payload.version,
          versionNumber: calculateMockNextNumber(Number(payload.projectId), payload.version),
          versionTitle: payload.versionTitle,
          versionInfo: payload.versionInfo,
          isActive: true,
          createdBy: 1,
          createdAt: new Date().toISOString(),
          updatedBy: null,
          updatedAt: null,
        };
        mockVersionsStore.unshift(newRecord);
        return newRecord;
      }
      throw error;
    }
  },

  /**
   * GET /versions/:id
   */
  async getVersionById(id: number): Promise<VersionRecord> {
    try {
      const response = await apiClient.get(`/versions/${id}`);
      return response.data?.data || response.data;
    } catch (error: any) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        console.warn('Backend API unavailable. Getting version from mock store.');
        const found = mockVersionsStore.find((v) => v.id === Number(id));
        if (found) return found;
        throw new Error('Version record not found');
      }
      throw error;
    }
  },

  /**
   * PUT /versions/:id
   */
  async updateVersion(id: number, payload: UpdateVersionRequest): Promise<VersionRecord> {
    try {
      const response = await apiClient.put(`/versions/${id}`, payload);
      return response.data?.data || response.data;
    } catch (error: any) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        console.warn('Backend API unavailable. Updating version in mock store.');
        const idx = mockVersionsStore.findIndex((v) => v.id === Number(id));
        if (idx !== -1) {
          const project = INITIAL_MOCK_PROJECTS.find((p) => p.id === Number(payload.projectId));
          const existing = mockVersionsStore[idx];
          const updated: VersionRecord = {
            ...existing,
            projectId: Number(payload.projectId),
            projectName: project ? project.name : existing.projectName,
            version: payload.version,
            versionTitle: payload.versionTitle,
            versionInfo: payload.versionInfo,
            updatedBy: 1,
            updatedAt: new Date().toISOString(),
          };
          mockVersionsStore[idx] = updated;
          return updated;
        }
        throw new Error('Version record not found to update');
      }
      throw error;
    }
  },

  /**
   * PATCH /versions/:id/toggle-status
   */
  async toggleVersionStatus(id: number): Promise<VersionRecord> {
    try {
      const response = await apiClient.patch(`/versions/${id}/toggle-status`);
      return response.data?.data || response.data;
    } catch (error: any) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        console.warn('Backend API unavailable. Toggling status in mock store.');
        const idx = mockVersionsStore.findIndex((v) => v.id === Number(id));
        if (idx !== -1) {
          const existing = mockVersionsStore[idx];
          const updated: VersionRecord = {
            ...existing,
            isActive: !existing.isActive,
            updatedBy: 1,
            updatedAt: new Date().toISOString(),
          };
          mockVersionsStore[idx] = updated;
          return updated;
        }
        throw new Error('Version record not found to toggle status');
      }
      throw error;
    }
  },
};

// Helper function to simulate backend filtering offline
function getMockFilteredVersions(filters: VersionFilters): VersionListResponse {
  let list = [...mockVersionsStore];

  // Filter: showDeleted
  if (!filters.showDeleted) {
    list = list.filter((v) => v.isActive);
  }

  // Filter: search
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (v) =>
        v.versionTitle.toLowerCase().includes(q) ||
        v.versionNumber.toLowerCase().includes(q) ||
        v.projectName.toLowerCase().includes(q)
    );
  }

  // Filter: projectId
  if (filters.projectId !== undefined && filters.projectId !== '') {
    list = list.filter((v) => v.projectId === Number(filters.projectId));
  }

  // Filter: versionType
  if (filters.versionType) {
    list = list.filter((v) => v.version === filters.versionType);
  }

  // Filter: startDate & endDate
  if (filters.startDate) {
    const start = new Date(filters.startDate).getTime();
    list = list.filter((v) => new Date(v.createdAt).getTime() >= start);
  }

  if (filters.endDate) {
    const end = new Date(filters.endDate).getTime();
    list = list.filter((v) => new Date(v.createdAt).getTime() <= end + 86400000);
  }

  const limit = filters.limit || 10;
  const page = filters.page || 1;
  const total = list.length;
  const totalPages = Math.ceil(total / limit) || 1;

  const startIndex = (page - 1) * limit;
  const paginatedData = list.slice(startIndex, startIndex + limit);

  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

// Helper to simulate computed version numbers offline
function calculateMockNextNumber(projectId: number, versionType: VersionType): string {
  const projectVersions = mockVersionsStore.filter((v) => v.projectId === Number(projectId));

  if (projectVersions.length === 0) {
    if (versionType === 'major') return 'v1.0.0';
    if (versionType === 'minor') return 'v0.1.0';
    return 'v0.0.1';
  }

  // Parse highest existing version numbers
  let maxMajor = 1;
  let maxMinor = 0;
  let maxPatch = 0;

  projectVersions.forEach((v) => {
    const cleaned = v.versionNumber.replace(/^v/, '');
    const parts = cleaned.split('.').map(Number);
    if (parts.length === 3) {
      if (parts[0] > maxMajor) {
        maxMajor = parts[0];
        maxMinor = parts[1];
        maxPatch = parts[2];
      } else if (parts[0] === maxMajor && parts[1] > maxMinor) {
        maxMinor = parts[1];
        maxPatch = parts[2];
      } else if (parts[0] === maxMajor && parts[1] === maxMinor && parts[2] > maxPatch) {
        maxPatch = parts[2];
      }
    }
  });

  if (versionType === 'major') {
    return `v${maxMajor + 1}.0.0`;
  } else if (versionType === 'minor') {
    return `v${maxMajor}.${maxMinor + 1}.0`;
  } else {
    return `v${maxMajor}.${maxMinor}.${maxPatch + 1}`;
  }
}
