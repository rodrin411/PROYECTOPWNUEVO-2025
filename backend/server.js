const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcrypt');
const db = require('./models');
const channelsRoutes = require('./routes/channels');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/channels', channelsRoutes);

// --- VARIABLES GLOBALES (RAM) ---
// Aquí guardamos quién está transmitiendo en vivo para avisar al Home
let streamsActivos = []; 

// --- LÓGICA DE MATEMÁTICA (NIVELES) ---
const calcularTechoNivel = (n) => (10 * n * (n + 1)) / 2;

const calcularNuevoNivel = (puntosActuales, nivelActual) => {
  let nuevoNivel = nivelActual;
  while (puntosActuales >= calcularTechoNivel(nuevoNivel)) {
    nuevoNivel++;
  }
  return nuevoNivel;
};

// --- SOCKET.IO (CHAT, REGALOS Y ESTADO DE STREAMS) ---
const io = new Server(server, {
  cors: { origin: "http://localhost:5173" }
});

io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado al socket:', socket.id);

  // 1. Al conectarse alguien, le enviamos la lista actual de streams
  socket.emit('lista_streams', streamsActivos);

  // 2. Unirse a una sala específica
  socket.on('unirse_stream', (streamId) => {
    socket.join(streamId);
  });

  // --- GESTIÓN DE STREAMS EN VIVO (NUEVO) ---
  
  // A) Streamer avisa que empezó
  socket.on('iniciar_transmision', (datosStream) => {
    // Evitar duplicados por si acaso
    streamsActivos = streamsActivos.filter(s => s.id !== datosStream.id);
    streamsActivos.push(datosStream);
    
    // Avisar a TODOS (Home) que actualicen su lista
    io.emit('lista_streams', streamsActivos);
    console.log("🔴 Nuevo Stream en vivo:", datosStream.titulo);
  });

  // B) Streamer avisa que terminó
  socket.on('detener_transmision', (streamId) => {
    streamsActivos = streamsActivos.filter(s => s.id !== streamId);
    // Avisar a todos que se apagó
    io.emit('lista_streams', streamsActivos);
    console.log("⚫ Stream finalizado:", streamId);
  });

  // --- CHAT Y COMUNIDAD ---

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
      
      // Verificamos saldo
      if (usuario && usuario.saldo >= data.regalo.costo) {

        const nuevoSaldo = parseFloat(usuario.saldo) - data.regalo.costo;
        const nuevosPuntos = usuario.puntos + data.regalo.xp;
        const nuevoNivel = calcularNuevoNivel(nuevosPuntos, usuario.nivel);

        await usuario.update({ saldo: nuevoSaldo, puntos: nuevosPuntos, nivel: nuevoNivel });

        // GUARDAR EN HISTORIAL
        const transaccion = await db.Transaccion.create({
            usuarioOrigenId: usuario.id,
            tipo: 'regalo',
            monto: data.regalo.costo
        });
        // Notificar al chat público
        io.to(data.streamId).emit('recibir_mensaje', {
          id: Date.now(),
          autor: usuario.nombre,
          texto: `ha enviado ${data.regalo.nombre} ${data.regalo.emoji}`,
          nivel: nuevoNivel,
          esRegalo: true,
          colorAutor: '#a855f7'
        });

        // Notificar al Streamer
        io.to(data.streamId).emit('evento_regalo', {
            alertaId: Date.now(),
            user: usuario.nombre,
            regalo: data.regalo.nombre,
            emoji: data.regalo.emoji
        });

        // Actualizar cliente
        socket.emit('actualizar_saldo', { nuevoSaldo, nuevoNivel, nuevosPuntos });
      } else {
        console.log("❌ Saldo insuficiente o usuario no encontrado"); // <--- LOG 4
      }
    } catch (error) {
      console.error("❌ Error CRÍTICO socket regalo:", error); // <--- LOG ERROR
    }
  });
});

// --- RUTAS API (ENDPOINTS) ---

// 1. REGISTRO (Sin Rol, por defecto espectador)
app.post('/api/register', async (req, res) => {
  console.log("📥 Petición de Registro:", req.body.email);
  try {
    const { nombre, email, password, fechaNacimiento } = req.body;

    // Validaciones de existencia...
    const existeEmail = await db.Usuario.findOne({ where: { email } });
    if (existeEmail) return res.status(400).json({ error: "El email ya existe" });
    const existeNombre = await db.Usuario.findOne({ where: { nombre } });
    if (existeNombre) return res.status(400).json({ error: "El nombre ya está en uso" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = await db.Usuario.create({
      nombre,
      email,
      password: hashedPassword,
      rol: 'espectador', // POR DEFECTO
      saldo: 500,
      nivel: 1,
      puntos: 0,
      avatarUrl: "https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
    });

    // Devolvemos 'monedas' en lugar de 'saldo' para el frontend
    res.json({ mensaje: "Usuario creado", usuario: { ...nuevoUsuario.dataValues, monedas: nuevoUsuario.saldo } });

  } catch (error) {
    console.error("❌ Error registro:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// 2. LOGIN (Con cambio de Rol Dinámico)
app.post('/api/login', async (req, res) => {
  console.log("📥 Petición de Login:", req.body.email);
  try {
    const { email, password, rolElegido } = req.body; // RECIBIMOS EL ROL DESEADO

    const usuario = await db.Usuario.findOne({ 
      where: db.Sequelize.or({ email: email }, { nombre: email }) 
    });

    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    const validPassword = await bcrypt.compare(password, usuario.password);
    if (!validPassword) return res.status(401).json({ error: "Contraseña incorrecta" });

    // --- ACTUALIZAMOS EL ROL AL QUE ELIGIÓ EL USUARIO ---
    if (rolElegido) {
        await usuario.update({ rol: rolElegido });
    }
    // ----------------------------------------------------

    res.json({
      mensaje: "Login exitoso",
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: rolElegido || usuario.rol, // Devolvemos el nuevo rol
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

// 4. CONSULTA: OBTENER HISTORIAL DE TRANSACCIONES
app.get('/api/historial/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { tipo } = req.query; // Permite filtrar por ?tipo=recarga o ?tipo=regalo

    // Construimos el filtro (WHERE)
    let filtro = { usuarioOrigenId: usuarioId };
    
    // Si el frontend manda un tipo específico, lo agregamos al filtro
    if (tipo) {
        filtro.tipo = tipo;
    }

    const historial = await db.Transaccion.findAll({
      where: filtro,
      order: [['createdAt', 'DESC']] // Ordenar: lo más reciente primero
    });

    res.json(historial);

  } catch (error) {
    console.error("Error obteniendo historial:", error);
    res.status(500).json({ error: "Error al obtener historial" });
  }
});

// INICIAR SERVIDOR
db.sequelize.sync().then(() => {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`🚀 Servidor Backend corriendo en puerto ${PORT}`);
  });
});