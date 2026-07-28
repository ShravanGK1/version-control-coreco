import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface RoleAttributes {
  id: number;
  roleName: string;
  description?: string | null;
  isActive: boolean;
  createdOn: Date;
}

export interface RoleCreationAttributes extends Optional<RoleAttributes, 'id' | 'description' | 'isActive' | 'createdOn'> {}

export class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public id!: number;
  public roleName!: string;
  public description!: string | null;
  public isActive!: boolean;
  public createdOn!: Date;
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    roleName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'role_name',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
    createdOn: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_on',
    },
  },
  {
    sequelize,
    tableName: 'role_master',
    timestamps: false,
  }
);

export default Role;
