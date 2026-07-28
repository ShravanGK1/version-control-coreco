import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Role from './Role';

export interface UserAttributes {
  id: number;
  roleId: number;
  firstName: string;
  lastName: string;
  emailAddress: string;
  password?: string;
  passwordResetToken?: string | null;
  passwordResetExpiry?: Date | null;
  isActive: boolean;
  createdBy?: number | null;
  createdOn: Date;
  updatedBy?: number | null;
  updatedOn?: Date | null;
  role?: Role;
}

export interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    | 'id'
    | 'passwordResetToken'
    | 'passwordResetExpiry'
    | 'isActive'
    | 'createdBy'
    | 'createdOn'
    | 'updatedBy'
    | 'updatedOn'
  > {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public roleId!: number;
  public firstName!: string;
  public lastName!: string;
  public emailAddress!: string;
  public password!: string;
  public passwordResetToken!: string | null;
  public passwordResetExpiry!: Date | null;
  public isActive!: boolean;
  public createdBy!: number | null;
  public createdOn!: Date;
  public updatedBy!: number | null;
  public updatedOn!: Date | null;
  public role?: Role;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'role_id',
      references: {
        model: 'role_master',
        key: 'id',
      },
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'first_name',
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'last_name',
    },
    emailAddress: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'email_address',
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password',
    },
    passwordResetToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'password_reset_token',
    },
    passwordResetExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'password_reset_expiry',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'created_by',
    },
    createdOn: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_on',
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'updated_by',
    },
    updatedOn: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'updated_on',
    },
  },
  {
    sequelize,
    tableName: 'user_master',
    timestamps: false,
  }
);

export default User;
