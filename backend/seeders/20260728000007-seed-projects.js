'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('project_master', [
      {
        id: 1,
        project_name: 'Project Alpha',
        is_active: true,
        created_by: 1,
        created_at: new Date(),
      },
      {
        id: 2,
        project_name: 'Project Beta',
        is_active: true,
        created_by: 1,
        created_at: new Date(),
      },
      {
        id: 3,
        project_name: 'Project Gamma',
        is_active: true,
        created_by: 1,
        created_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('project_master', null, {});
  },
};
