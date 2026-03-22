'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('favorites', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'products',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      serviceId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'services',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      jobId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'jobs',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('favorites', ['userId']);
    await queryInterface.addIndex('favorites', ['productId']);
    await queryInterface.addIndex('favorites', ['serviceId']);
    await queryInterface.addIndex('favorites', ['jobId']);
    await queryInterface.addIndex('favorites', ['userId', 'productId'], {
      unique: true,
      where: { productId: { [Sequelize.Op.ne]: null } },
    });
    await queryInterface.addIndex('favorites', ['userId', 'serviceId'], {
      unique: true,
      where: { serviceId: { [Sequelize.Op.ne]: null } },
    });
    await queryInterface.addIndex('favorites', ['userId', 'jobId'], {
      unique: true,
      where: { jobId: { [Sequelize.Op.ne]: null } },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('favorites');
  },
};
