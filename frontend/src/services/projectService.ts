import { apiClient } from './api';
import { Project } from '../types/project';
import { INITIAL_MOCK_PROJECTS } from './mockData';

export const projectService = {
  /**
   * GET /projects
   */
  async getProjects(): Promise<Project[]> {
    try {
      const response = await apiClient.get('/projects');
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      if (!error.response || error.code === 'ERR_NETWORK') {
        console.warn('Backend API unavailable. Returning mock projects.');
        return INITIAL_MOCK_PROJECTS;
      }
      throw error;
    }
  },
};
