'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idTrip: {
        type: Sequelize.UUID,
        references:{
          model: 'trips',
          key : 'id'
        },
        onUpdate:"CASCADE",
        onDelete:"CASCADE"
      },
      idUser: {
        type: Sequelize.INTEGER,
        references:{
          model:'users',
          key: 'id'
        },
        onUpdate:"CASCADE",
        onDelete:"CASCADE"
      },
      counterQty: {
        type: Sequelize.INTEGER
      },
      total: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.STRING
      },
      attachment: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('transactions');
  }
};