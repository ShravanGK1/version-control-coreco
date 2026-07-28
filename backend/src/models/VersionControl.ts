import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { VersionType } from '../types';
import Project from './Project';
import User from './User';

export interface VersionControlAttributes {
  id: number;
  projectId: number;
  version: VersionType;
  versionNumber: string;
  versionTitle: string;
  versionInfo: unknown;
  isActive: boolean;
  createdBy: number;
  createdAt: Date;
  updatedBy?: number | null;
  updatedAt?: Date | null;
  project?: Project;
  creator?: User;
}

export interface VersionControlCreationAttributes
  extends Optional<VersionControlAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedBy' | 'updatedAt'> {}

export class VersionControl
  extends Model<VersionControlAttributes, VersionControlCreationAttributes>
  implements VersionControlAttributes
{
  public id!: number;
  public projectId!: number;
  public version!: VersionType;
  public versionNumber!: string;
  public versionTitle!: string;
  public versionInfo!: unknown;
  public isActive!: boolean;
  public createdBy!: number;
  public createdAt!: Date;
  public updatedBy!: number | null;
  public updatedAt!: Date | null;
  public project?: Project;
  public creator?: User;
}

VersionControl.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'project_id',
      references: {
        model: 'project_master',
        key: 'id',
      },
    },
    version: {
      type: DataTypes.ENUM('major', 'minor', 'bug-fix'),
      allowNull: false,
      field: 'version',
    },
    versionNumber: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: 'version_number',
    },
    versionTitle: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'version_title',
    },
    versionInfo: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'version_info',
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
      references: {
        model: 'user_master',
        key: 'id',
      },
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
    tableName: 'version_control',
    timestamps: false,
  }
);

export default VersionControl;
