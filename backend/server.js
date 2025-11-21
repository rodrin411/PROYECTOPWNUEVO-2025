const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcrypt');
const db = require('./models');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// --- LÓGICA DE MATEMÁTICA (NIVELES) ---
const calcularTechoNivel = (n) => (10 * n * (n + 1)) / 2;

const calcularNuevoNivel = (puntosActuales, nivelActual) => {
  let nuevoNivel = nivelActual;
  while (puntosActuales >= calcularTechoNivel(nuevoNivel)) {
    nuevoNivel++;
  }
  return nuevoNivel;
};

// --- SOCKET.IO (CHAT Y REGALOS) ---
const io = new Server(server, {
  cors: { origin: "http://localhost:5173" }
});

io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado al socket:', socket.id);

  socket.on('unirse_stream', (streamId) => {
    socket.join(streamId);
  });

  // CHAT
  socket.on('enviar_mensaje', async (data) => {
    try {
      const usuario = await db.Usuario.findByPk(data.usuarioId);
      if (usuario) {
        const nuevosPuntos = usuario.puntos + 1;
        const nuevoNivel = calcularNuevoNivel(nuevosPuntos, usuario.nivel);
        
        await usuario.update({ puntos: nuevosPuntos, nivel: nuevoNivel });

        io.to(data.streamId).emit('recibir_mensaje', {
          id: Date.now(),
          autor: usuario.nombre,
          texto: data.texto,
          nivel: nuevoNivel,
          esRegalo: false
        });
      }
    } catch (error) {
      console.error("Error socket chat:", error);
    }
  });

  // REGALOS
  socket.on('enviar_regalo', async (data) => {
    try {
      const usuario = await db.Usuario.findByPk(data.usuarioId);
      if (usuario && usuario.saldo >= data.regalo.costo) {
        const nuevoSaldo = parseFloat(usuario.saldo) - data.regalo.costo;
        const nuevosPuntos = usuario.puntos + data.regalo.xp;
        const nuevoNivel = calcularNuevoNivel(nuevosPuntos, usuario.nivel);

        await usuario.update({ saldo: nuevoSaldo, puntos: nuevosPuntos, nivel: nuevoNivel });

        // Notificar al chat
        io.to(data.streamId).emit('recibir_mensaje', {
          id: Date.now(),
          autor: usuario.nombre,
          texto: `ha enviado ${data.regalo.nombre} ${data.regalo.emoji}`,
          nivel: nuevoNivel,
          esRegalo: true,
          colorAutor: '#a855f7'
        });

        // Actualizar cliente específico
        socket.emit('actualizar_saldo', { nuevoSaldo, nuevoNivel, nuevosPuntos });
      }
    } catch (error) {
      console.error("Error socket regalo:", error);
    }
  });
});

// --- RUTAS API (ENDPOINTS) ---

// 1. REGISTRO
app.post('/api/register', async (req, res) => {
  console.log("📥 Petición de Registro recibida:", req.body.email);
  try {
    const { nombre, email, password, rol, fechaNacimiento } = req.body;

    const existeEmail = await db.Usuario.findOne({ where: { email } });
    if (existeEmail) return res.status(400).json({ error: "El email ya existe" });

    const existeNombre = await db.Usuario.findOne({ where: { nombre } });
    if (existeNombre) return res.status(400).json({ error: "El nombre ya está en uso" });

    const hashedPassword = await bcrypt.hash(password, 10);

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

    console.log("✅ Usuario creado:", nuevoUsuario.id);
    
    // CAMBIO AQUÍ: Construimos la respuesta manual
    res.json({ 
        mensaje: "Usuario creado", 
        usuario: {
            id: nuevoUsuario.id,
            nombre: nuevoUsuario.nombre,
            email: nuevoUsuario.email,
            rol: nuevoUsuario.rol,
            monedas: nuevoUsuario.saldo, // <--- AQUÍ ESTÁ LA MAGIA
            nivel: nuevoUsuario.nivel,
            puntos: nuevoUsuario.puntos,
            avatarUrl: nuevoUsuario.avatarUrl
        }
    });

  } catch (error) {
    console.error("❌ Error en registro:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// 2. LOGIN
app.post('/api/login', async (req, res) => {
  console.log("📥 Petición de Login recibida:", req.body.email);
  try {
    const { email, password } = req.body;

    const usuario = await db.Usuario.findOne({ 
      where: db.Sequelize.or({ email: email }, { nombre: email }) 
    });

    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    const validPassword = await bcrypt.compare(password, usuario.password);
    if (!validPassword) return res.status(401).json({ error: "Contraseña incorrecta" });

    res.json({
      mensaje: "Login exitoso",
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        
        // CAMBIO AQUÍ: Enviamos 'saldo' pero le ponemos la etiqueta 'monedas'
        monedas: usuario.saldo, 
        
        nivel: usuario.nivel,
        puntos: usuario.puntos,
        avatarUrl: usuario.avatarUrl
      }
    });

  } catch (error) {
    console.error("❌ Error login:", error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

// 3. COMPRAR MONEDAS
app.post('/api/comprar-monedas', async (req, res) => {
  console.log("📥 Petición de Compra recibida");
  try {
    const { usuarioId, monto } = req.body;
    
    const usuario = await db.Usuario.findByPk(usuarioId);
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    const nuevoSaldo = parseFloat(usuario.saldo) + parseFloat(monto);
    await usuario.update({ saldo: nuevoSaldo });

    await db.Transaccion.create({
      usuarioOrigenId: usuarioId,
      tipo: 'recarga',
      monto: monto
    });

    console.log("✅ Compra exitosa. Nuevo saldo:", nuevoSaldo);
    res.json({ mensaje: "Compra exitosa", nuevoSaldo });
  } catch (error) {
    console.error("❌ Error compra:", error);
    res.status(500).json({ error: "Error en la compra" });
  }
});

// INICIAR
db.sequelize.sync().then(() => {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`🚀 Servidor Backend corriendo en puerto ${PORT}`);
  });
});