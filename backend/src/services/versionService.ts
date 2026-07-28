import { Op } from 'sequelize';
import sequelize from '../config/database';
import { VersionControl, Project } from '../models';
import { FormattedVersionRecord, VersionType } from '../types';
import { calculateNextVersionNumber } from '../utils/versionNumber';

export interface GetVersionsParams {
  page?: number;
  limit?: number;
  projectId?: number | string;
  versionType?: VersionType | string;
  startDate?: string;
  endDate?: string;
  search?: string;
  showDeleted?: boolean | string;
}

export class VersionService {
  static async getVersions(params: GetVersionsParams) {
    const page = Math.max(1, parseInt(String(params.page || 1), 10));
    const limit = Math.max(1, parseInt(String(params.limit || 10), 10));
    const offset = (page - 1) * limit;

    const whereClause: any = {};

    // Filter showDeleted
    const showDeleted = String(params.showDeleted) === 'true';
    if (!showDeleted) {
      whereClause.isActive = true;
    }

    // Filter projectId
    if (params.projectId !== undefined && params.projectId !== '') {
      whereClause.projectId = Number(params.projectId);
    }

    // Filter versionType
    if (params.versionType && ['major', 'minor', 'bug-fix'].includes(String(params.versionType))) {
      whereClause.version = params.versionType;
    }

    // Filter Date Range
    if (params.startDate || params.endDate) {
      whereClause.createdAt = {};
      if (params.startDate) {
        whereClause.createdAt[Op.gte] = new Date(params.startDate);
      }
      if (params.endDate) {
        const end = new Date(params.endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.createdAt[Op.lte] = end;
      }
    }

    // Filter Search (searches version_title and version_info)
    if (params.search && params.search.trim() !== '') {
      const searchTerm = `%${params.search.trim()}%`;
      const searchConditions: any[] = [
        { versionTitle: { [Op.like]: searchTerm } },
        { versionNumber: { [Op.like]: searchTerm } },
        // MySQL JSON search via raw text cast / string comparison
        sequelize.where(
          sequelize.fn('LOWER', sequelize.cast(sequelize.col('version_info'), 'CHAR')),
          { [Op.like]: `%${params.search.trim().toLowerCase()}%` }
        ),
      ];

      if (whereClause[Op.or]) {
        whereClause[Op.and] = [{ [Op.or]: searchConditions }];
      } else {
        whereClause[Op.or] = searchConditions;
      }
    }

    const { count, rows } = await VersionControl.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'projectName'],
        },
      ],
      order: [
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ],
      limit,
      offset,
    });

    const formattedData: FormattedVersionRecord[] = rows.map((v) => ({
      id: v.id,
      projectId: v.projectId,
      projectName: v.project ? v.project.projectName : '',
      version: v.version,
      versionNumber: v.versionNumber,
      versionTitle: v.versionTitle,
      versionInfo: v.versionInfo,
      isActive: v.isActive,
      createdBy: v.createdBy,
      createdAt: v.createdAt.toISOString(),
      updatedBy: v.updatedBy || null,
      updatedAt: v.updatedAt ? v.updatedAt.toISOString() : null,
    }));

    const totalPages = Math.ceil(count / limit) || 1;

    return {
      data: formattedData,
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
      },
    };
  }

  static async getVersionById(id: number): Promise<FormattedVersionRecord> {
    const versionRecord = await VersionControl.findByPk(id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'projectName'],
        },
      ],
    });

    if (!versionRecord) {
      const error: any = new Error(`Version record with ID ${id} not found`);
      error.statusCode = 404;
      throw error;
    }

    return {
      id: versionRecord.id,
      projectId: versionRecord.projectId,
      projectName: versionRecord.project ? versionRecord.project.projectName : '',
      version: versionRecord.version,
      versionNumber: versionRecord.versionNumber,
      versionTitle: versionRecord.versionTitle,
      versionInfo: versionRecord.versionInfo,
      isActive: versionRecord.isActive,
      createdBy: versionRecord.createdBy,
      createdAt: versionRecord.createdAt.toISOString(),
      updatedBy: versionRecord.updatedBy || null,
      updatedAt: versionRecord.updatedAt ? versionRecord.updatedAt.toISOString() : null,
    };
  }

  static async createVersion(
    userId: number,
    payload: {
      projectId: number;
      version: VersionType;
      versionTitle: string;
      versionInfo: unknown;
    }
  ): Promise<FormattedVersionRecord> {
    const { projectId, version, versionTitle, versionInfo } = payload;

    // Validate Project
    const project = await Project.findByPk(projectId);
    if (!project) {
      const error: any = new Error(`Project with ID ${projectId} does not exist`);
      error.statusCode = 400;
      throw error;
    }

    if (!project.isActive) {
      const error: any = new Error(`Project with ID ${projectId} is inactive`);
      error.statusCode = 400;
      throw error;
    }

    if (!['major', 'minor', 'bug-fix'].includes(version)) {
      const error: any = new Error('Invalid version type. Allowed values: major, minor, bug-fix');
      error.statusCode = 400;
      throw error;
    }

    if (!versionTitle || !versionTitle.trim()) {
      const error: any = new Error('Version title is required');
      error.statusCode = 400;
      throw error;
    }

    // Execute in transaction to prevent race conditions during version calculation
    const result = await sequelize.transaction(async (t) => {
      const versionNumber = await calculateNextVersionNumber(projectId, version, t);

      const created = await VersionControl.create(
        {
          projectId,
          version,
          versionNumber,
          versionTitle: versionTitle.trim(),
          versionInfo,
          isActive: true,
          createdBy: userId,
          createdAt: new Date(),
        },
        { transaction: t }
      );

      return created;
    });

    return this.getVersionById(result.id);
  }

  static async updateVersion(
    id: number,
    userId: number,
    payload: {
      projectId: number;
      version: VersionType;
      versionTitle: string;
      versionInfo: unknown;
    }
  ): Promise<FormattedVersionRecord> {
    const { projectId, version, versionTitle, versionInfo } = payload;

    const versionRecord = await VersionControl.findByPk(id);
    if (!versionRecord) {
      const error: any = new Error(`Version record with ID ${id} not found`);
      error.statusCode = 404;
      throw error;
    }

    const project = await Project.findByPk(projectId);
    if (!project) {
      const error: any = new Error(`Project with ID ${projectId} does not exist`);
      error.statusCode = 400;
      throw error;
    }

    if (!['major', 'minor', 'bug-fix'].includes(version)) {
      const error: any = new Error('Invalid version type. Allowed values: major, minor, bug-fix');
      error.statusCode = 400;
      throw error;
    }

    if (!versionTitle || !versionTitle.trim()) {
      const error: any = new Error('Version title is required');
      error.statusCode = 400;
      throw error;
    }

    // Recompute version_number if projectId or version type changed
    let updatedVersionNumber = versionRecord.versionNumber;
    if (versionRecord.projectId !== Number(projectId) || versionRecord.version !== version) {
      updatedVersionNumber = await calculateNextVersionNumber(Number(projectId), version);
    }

    versionRecord.projectId = Number(projectId);
    versionRecord.version = version;
    versionRecord.versionNumber = updatedVersionNumber;
    versionRecord.versionTitle = versionTitle.trim();
    versionRecord.versionInfo = versionInfo;
    versionRecord.updatedBy = userId;
    versionRecord.updatedAt = new Date();

    await versionRecord.save();

    return this.getVersionById(versionRecord.id);
  }

  static async toggleVersionStatus(id: number, userId: number): Promise<FormattedVersionRecord> {
    const versionRecord = await VersionControl.findByPk(id);
    if (!versionRecord) {
      const error: any = new Error(`Version record with ID ${id} not found`);
      error.statusCode = 404;
      throw error;
    }

    versionRecord.isActive = !versionRecord.isActive;
    versionRecord.updatedBy = userId;
    versionRecord.updatedAt = new Date();

    await versionRecord.save();

    return this.getVersionById(versionRecord.id);
  }
}
