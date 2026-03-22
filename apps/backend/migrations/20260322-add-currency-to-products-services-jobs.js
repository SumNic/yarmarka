'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add currency column to products
    await queryInterface.addColumn('products', 'currency', {
      type: Sequelize.ENUM('RUB', 'BYN', 'UAH', 'KZT'),
      allowNull: false,
      defaultValue: 'RUB',
    });

    // Add currency column to services
    await queryInterface.addColumn('services', 'currency', {
      type: Sequelize.ENUM('RUB', 'BYN', 'UAH', 'KZT'),
      allowNull: false,
      defaultValue: 'RUB',
    });

    // Add currency column to jobs
    await queryInterface.addColumn('jobs', 'currency', {
      type: Sequelize.ENUM('RUB', 'BYN', 'UAH', 'KZT'),
      allowNull: false,
      defaultValue: 'RUB',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('products', 'currency');
    await queryInterface.removeColumn('services', 'currency');
    await queryInterface.removeColumn('jobs', 'currency');
  },
};
