'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class trip extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    
    static associate(models) {
      trip.belongsTo(models.country,{
        as:'country',
        foreignKey:'idCountry'
        
      })

      trip.hasMany(models.transaction
        ,{
        as : 'tripTransactions',
        foreignKey:'idTrip',
        onUpdate:'cascade',
        onDelete:'cascade',
        hook: true
      }
      )

    }
  };
  trip.init({
    id : {
      allowNull: false,
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      validate: {
        notNull: true
      }
    },
    title: DataTypes.STRING,
    accomodation: DataTypes.STRING,
    transportation: DataTypes.STRING,
    eat: DataTypes.STRING,
    day: DataTypes.STRING,
    night: DataTypes.STRING,
    dateTrip: DataTypes.STRING,
    price: DataTypes.INTEGER,
    quota: DataTypes.INTEGER,
    quotaFilled: DataTypes.INTEGER,
    description: DataTypes.TEXT,
    images: DataTypes.STRING,
    idUser: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'trip',
  });


  return trip;
};