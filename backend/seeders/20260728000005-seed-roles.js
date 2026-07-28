'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('role_master', [
      {
        id: 1,
        role_name: 'Admin',
        description: 'System Administrator with full access',
        is_active: true,
        created_on: new Date(),
      },
      {
        id: 2,
        role_name: 'Developer',
        description: 'Software Developer role',
        is_active: true,
        created_on: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('role_master', null, {});
  },
};
