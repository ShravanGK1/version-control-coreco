import { Request, Response, NextFunction } from 'express';
import { Project } from '../models';
import { FormattedProject } from '../types';

export const getProjects = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projects = await Project.findAll({
      where: { isActive: true },
      order: [['projectName', 'ASC']],
    });

    const formattedProjects: FormattedProject[] = projects.map((p) => ({
      id: p.id,
      name: p.projectName,
      isActive: p.isActive,
      createdBy: p.createdBy,
      createdAt: p.createdAt.toISOString(),
      updatedBy: p.updatedBy || null,
      updatedAt: p.updatedAt ? p.updatedAt.toISOString() : null,
    }));

    res.status(200).json({
      success: true,
      data: formattedProjects,
    });
  } catch (error) {
    next(error);
  }
};
