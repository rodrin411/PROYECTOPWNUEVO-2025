const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcrypt'); // Asegúrate de tener esto instalado
const db = require('./models'); // Importa Sequelize
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors()); // Permite conexión desde el Frontend
app.use(express.json()); // Permite leer JSON del Frontend

// --- SOCKET.IO (Lo usaremos luego) ---
const io = new Server(server, {
  cors: { origin: "http://localhost:5173" }
});

// --- RUTAS (AQUÍ ES DONDE TE FALTABA CÓDIGO) ---

// 1. RUTA DE REGISTRO
app.post('/api/register', async (req, res) => {
  console.log("Intentando registrar usuario:", req.body.email); // Log para depurar
  try {
    const { nombre, email, password, rol, fechaNacimiento } = req.body;

    // Validar si ya existe
    const existeEmail = await db.Usuario.findOne({ where: { email } });
    if (existeEmail) return res.status(400).json({ error: "El email ya existe" });

    const existeNombre = await db.Usuario.findOne({ where: { nombre } });
    if (existeNombre) return res.status(400).json({ error: "El nombre ya está en uso" });

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear en BD
    const nuevoUsuario = await db.Usuario.create({
      nombre,
      email,
      password: hashedPassword,
      rol: rol || 'espectador',
      saldo: 500,
      nivel: 1,
      puntos: 0,
      avatarUrl: "https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
    });

    res.json({ mensaje: "Usuario creado", usuario: nuevoUsuario });

  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: "Error en el servidor: " + error.message });
  }
});

// 2. RUTA DE LOGIN
app.post('/api/login', async (req, res) => {
  console.log("Intentando login:", req.body.email);
  try {
    const { email, password } = req.body;

    // Buscar por email o nombre
    const usuario = await db.Usuario.findOne({ 
      where: db.Sequelize.or({ email: email }, { nombre: email }) 
    });

    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    // Comparar contraseñas
    const validPassword = await bcrypt.compare(password, usuario.password);
    if (!validPassword) return res.status(401).json({ error: "Contraseña incorrecta" });

    res.json({
      mensaje: "Login exitoso",
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        saldo: usuario.saldo,
        nivel: usuario.nivel,
        puntos: usuario.puntos,
        avatarUrl: usuario.avatarUrl
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

// Iniciar servidor
db.sequelize.sync().then(() => {
  const PUERTO = process.env.PORT || 3000;
  server.listen(PUERTO, () => {
    console.log(`🚀 Servidor Backend corriendo en puerto ${PUERTO}`);
    console.log(`   - Ruta de registro activa: POST http://localhost:${PUERTO}/api/register`);
    console.log(`   - Ruta de login activa:    POST http://localhost:${PUERTO}/api/login`);
  });
});