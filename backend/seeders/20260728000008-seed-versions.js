'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('version_control', [
      {
        id: 1,
        project_id: 1,
        version: 'major',
        version_number: '1.0.0',
        version_title: 'Initial Release',
        version_info: JSON.stringify({ description: 'Initial product baseline architecture release', features: ['Core API', 'Authentication'] }),
        is_active: true,
        created_by: 1,
        created_at: new Date('2026-07-01T10:00:00Z'),
      },
      {
        id: 2,
        project_id: 1,
        version: 'minor',
        version_number: '1.1.0',
        version_title: 'Added Analytics & Search',
        version_info: JSON.stringify({ description: 'Feature expansion with search filters', features: ['Search', 'Export'] }),
        is_active: true,
        created_by: 1,
        created_at: new Date('2026-07-15T14:30:00Z'),
      },
      {
        id: 3,
        project_id: 1,
        version: 'bug-fix',
        version_number: '1.1.1',
        version_title: 'Hotfix for Auth Expiry',
        version_info: JSON.stringify({ description: 'Fixed token expiration refresh calculation', fixes: ['Auth middleware token refresh'] }),
        is_active: true,
        created_by: 1,
        created_at: new Date('2026-07-20T16:00:00Z'),
      },
      {
        id: 4,
        project_id: 2,
        version: 'major',
        version_number: '1.0.0',
        version_title: 'Beta Launch Baseline',
        version_info: JSON.stringify({ description: 'First baseline release for Beta Project', features: ['Dashboard'] }),
        is_active: true,
        created_by: 1,
        created_at: new Date('2026-07-10T09:00:00Z'),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('version_control', null, {});
  },
};
