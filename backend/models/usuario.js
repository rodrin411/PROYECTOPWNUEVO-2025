'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Un usuario (si es streamer) tiene muchos regalos creados
      Usuario.hasMany(models.Regalo, { foreignKey: 'streamerId' });
      
      // Un usuario hace muchas transacciones (compras o envíos)
      Usuario.hasMany(models.Transaccion, { foreignKey: 'usuarioOrigenId' });
    }
  }
  Usuario.init({
    nombre: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    rol: DataTypes.STRING,
    avatarUrl: DataTypes.STRING,
    saldo: DataTypes.FLOAT,
    nivel: DataTypes.INTEGER,
    puntos: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Usuario',
  });
  return Usuario;
};