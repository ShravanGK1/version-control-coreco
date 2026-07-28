import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, VersionType } from '../types';
import { VersionService } from '../services/versionService';
import { calculateNextVersionNumber } from '../utils/versionNumber';
import { Project } from '../models';

export const getNextVersionNumber = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId, versionType } = req.query;

    if (!projectId) {
      res.status(400).json({
        success: false,
        message: 'projectId query parameter is required',
      });
      return;
    }

    const pId = Number(projectId);
    if (isNaN(pId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid projectId query parameter',
      });
      return;
    }

    const project = await Project.findByPk(pId);
    if (!project) {
      res.status(404).json({
        success: false,
        message: `Project with ID ${pId} not found`,
      });
      return;
    }

    const validVersionTypes: VersionType[] = ['major', 'minor', 'bug-fix'];
    const vType = String(versionType) as VersionType;

    if (!validVersionTypes.includes(vType)) {
      res.status(400).json({
        success: false,
        message: 'versionType must be exactly: major, minor, or bug-fix',
      });
      return;
    }

    const nextNumber = await calculateNextVersionNumber(pId, vType);

    res.status(200).json({
      success: true,
      data: {
        versionNumber: nextNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getVersions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await VersionService.getVersions(req.query);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getVersionById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const versionId = Number(id);

    if (isNaN(versionId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid version ID parameter',
      });
      return;
    }

    const data = await VersionService.getVersionById(versionId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const createVersion = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User authentication required',
      });
      return;
    }

    const data = await VersionService.createVersion(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Version created successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const updateVersion = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const versionId = Number(id);
    const userId = req.user?.userId;

    if (isNaN(versionId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid version ID parameter',
      });
      return;
    }

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User authentication required',
      });
      return;
    }

    const data = await VersionService.updateVersion(versionId, userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Version updated successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleVersionStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const versionId = Number(id);
    const userId = req.user?.userId;

    if (isNaN(versionId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid version ID parameter',
      });
      return;
    }

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User authentication required',
      });
      return;
    }

    const data = await VersionService.toggleVersionStatus(versionId, userId);

    res.status(200).json({
      success: true,
      message: 'Version status updated successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};
