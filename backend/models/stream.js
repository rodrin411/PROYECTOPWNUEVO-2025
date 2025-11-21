'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Stream extends Model {
    static associate(models) {
      // define association aqui
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