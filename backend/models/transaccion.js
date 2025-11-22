'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaccion extends Model {
    static associate(models) {
    }
  }
  Transaccion.init({
    tipo: DataTypes.STRING,
    monto: DataTypes.FLOAT,
    usuarioOrigenId: DataTypes.INTEGER,
    usuarioDestinoId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Transaccion',
  });
  return Transaccion;
};