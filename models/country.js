'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class country extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      //one country can have many trips
      country.hasMany(models.trip,{
        as : "trips",
        foreignKey : {
          name : 'idCountry'
        },
        onUpdate:"CASCADE",
        onDelete: 'CASCADE'
      })

    }
  };
  country.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'country',
  });
  return country;
};