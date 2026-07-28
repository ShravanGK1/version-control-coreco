import sequelize from '../config/database';
import Role from './Role';
import User from './User';
import Project from './Project';
import VersionControl from './VersionControl';

// Role <-> User
Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

// Project <-> VersionControl
Project.hasMany(VersionControl, { foreignKey: 'projectId', as: 'versions' });
VersionControl.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// User <-> VersionControl
User.hasMany(VersionControl, { foreignKey: 'createdBy', as: 'createdVersions' });
VersionControl.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

export { sequelize, Role, User, Project, VersionControl };
