'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('products', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('products', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('services', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('services', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('jobs', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('jobs', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Заполним существующие записи текущим временем
    await queryInterface.sequelize.query(`
      UPDATE products SET createdAt = NOW(), updatedAt = NOW() WHERE createdAt IS NULL;
    `);
    await queryInterface.sequelize.query(`
      UPDATE services SET createdAt = NOW(), updatedAt = NOW() WHERE createdAt IS NULL;
    `);
    await queryInterface.sequelize.query(`
      UPDATE jobs SET createdAt = NOW(), updatedAt = NOW() WHERE createdAt IS NULL;
    `);

    // Теперь сделаем поля NOT NULL
    await queryInterface.changeColumn('products', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
    });
    await queryInterface.changeColumn('products', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
    });

    await queryInterface.changeColumn('services', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
    });
    await queryInterface.changeColumn('services', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
    });

    await queryInterface.changeColumn('jobs', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
    });
    await queryInterface.changeColumn('jobs', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('products', 'createdAt');
    await queryInterface.removeColumn('products', 'updatedAt');

    await queryInterface.removeColumn('services', 'createdAt');
    await queryInterface.removeColumn('services', 'updatedAt');

    await queryInterface.removeColumn('jobs', 'createdAt');
    await queryInterface.removeColumn('jobs', 'updatedAt');
  },
};
