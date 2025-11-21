'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaccion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
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