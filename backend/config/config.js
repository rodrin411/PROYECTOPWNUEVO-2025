const dotenv = require('dotenv');
const path = require('path');

// CORRECCIÓN AQUÍ: Cambiamos '../datos.env' por '../.env'
// Esto le dice: "Sal de la carpeta config (..) y busca el archivo .env"
dotenv.config({ path: path.resolve(__dirname, '../.env') });

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "postgres"
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "postgres"
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "postgres"
  }
};
