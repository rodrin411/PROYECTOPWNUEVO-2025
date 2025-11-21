'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Stream extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Stream.init({
    titulo: DataTypes.STRING,
    duracionMinutos: DataTypes.INTEGER,
    xpGanada: DataTypes.INTEGER,
    streamerId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Stream',
  });
  return Stream;
};