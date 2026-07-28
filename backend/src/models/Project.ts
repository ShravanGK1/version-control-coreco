import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface ProjectAttributes {
  id: number;
  projectName: string;
  isActive: boolean;
  createdBy: number;
  createdAt: Date;
  updatedBy?: number | null;
  updatedAt?: Date | null;
}

export interface ProjectCreationAttributes
  extends Optional<ProjectAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedBy' | 'updatedAt'> {}

export class Project extends Model<ProjectAttributes, ProjectCreationAttributes> implements ProjectAttributes {
  public id!: number;
  public projectName!: string;
  public isActive!: boolean;
  public createdBy!: number;
  public createdAt!: Date;
  public updatedBy!: number | null;
  public updatedAt!: Date | null;
}

Project.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    projectName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'project_name',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'created_by',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'updated_by',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'project_master',
    timestamps: false,
  }
);

export default Project;
