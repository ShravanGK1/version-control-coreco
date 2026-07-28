'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    await queryInterface.bulkInsert('user_master', [
      {
        id: 1,
        role_id: 1,
        first_name: 'System',
        last_name: 'Admin',
        email_address: 'admin@example.com',
        password: hashedPassword,
        is_active: true,
        created_by: null,
        created_on: new Date(),
      },
      {
        id: 2,
        role_id: 2,
        first_name: 'John',
        last_name: 'Developer',
        email_address: 'john@example.com',
        password: hashedPassword,
        is_active: true,
        created_by: 1,
        created_on: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('user_master', null, {});
  },
};
