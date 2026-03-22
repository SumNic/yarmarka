'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'about', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'phone', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'contactEmail', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'about');
    await queryInterface.removeColumn('users', 'phone');
    await queryInterface.removeColumn('users', 'contactEmail');
  },
};
