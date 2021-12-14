
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('trips', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID,
        validate: {
          notNull: true
        }
      },
      title: {
        type: Sequelize.STRING
      },
      accomodation: {
        type: Sequelize.STRING
      },
      transportation: {
        type: Sequelize.STRING
      },
      eat: {
        type: Sequelize.STRING
      },
      day: {
        type: Sequelize.STRING
      },
      night: {
        type: Sequelize.STRING
      },
      dateTrip: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.INTEGER
      },
      quota: {
        type: Sequelize.INTEGER
      },
      quotaFilled: {
        type: Sequelize.INTEGER
      },
      description: {
        type: Sequelize.TEXT
      },
      images: {
        type: Sequelize.STRING(1000)
      },
      idUser: {
        type: Sequelize.INTEGER,
        references:{
          model:'users',
          key:'id'
        },
        onUpdate:"CASCADE",
        onDelete:"CASCADE"
      },
      idCountry: {
        type: Sequelize.INTEGER,
        references:{
          model:'countries',
          key:'id'
        },
        onUpdate:"CASCADE",
        onDelete:"CASCADE"
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
    await queryInterface.dropTable('trips');
  }
};