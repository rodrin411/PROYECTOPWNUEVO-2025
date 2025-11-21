'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Regalo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Un regalo pertenece a un Streamer específico
      Regalo.belongsTo(models.Usuario, { foreignKey: 'streamerId' });
    }
  }
  Regalo.init({
    nombre: DataTypes.STRING,
    costo: DataTypes.INTEGER,
    xp: DataTypes.INTEGER,
    emoji: DataTypes.STRING,
    activo: DataTypes.BOOLEAN,
    streamerId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Regalo',
  });
  return Regalo;
};