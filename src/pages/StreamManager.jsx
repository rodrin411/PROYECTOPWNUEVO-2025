import { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client'; // 1. IMPORTAR SOCKET
import './StreamManager.css';

function StreamManager() {
  const { usuario, setUsuario } = useOutletContext();
  const navigate = useNavigate();
  const chatRef = useRef(null);
  const eventListRef = useRef(null);
  const [socket, setSocket] = useState(null); // 2. ESTADO DEL SOCKET

  // Estados de la transmisión
  const [enVivo, setEnVivo] = useState(false);
  const [tiempo, setTiempo] = useState(0);
  const [mensajes, setMensajes] = useState([]);
  const [regalosCola, setRegalosCola] = useState([]);
  const [historialEventos, setHistorialEventos] = useState([]);

  // Nuevos estados para el modal de configuración
  const [mostrarConfigStream, setMostrarConfigStream] = useState(false);
  const [configStream, setConfigStream] = useState({
    titulo: '',
    categoria: 'Juegos',
    etiquetas: ''
  });

  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [datosResumen, setDatosResumen] = useState({ duracion: '', horas: 0, xp: 0 });

 // --- Configuración de puntos por nivel ---
  const [puntosPorNivel, setPuntosPorNivel] = useState({});
  const [nuevoNivel, setNuevoNivel] = useState('');
  const [nuevoXP, setNuevoXP] = useState('');

   const actualizarNivel = (nivel, valor) => {
    if (!nivel) return;
    setPuntosPorNivel(prev => ({ ...prev, [nivel]: Number(valor) }));
  };

  const eliminarNivel = (nivel) => {
    setPuntosPorNivel(prev => {
      const copia = { ...prev };
      delete copia[nivel];
      return copia;
    });
  };

  useEffect(() => {
    let intervalo;
    if (enVivo) {
      intervalo = setInterval(() => setTiempo(t => t + 1), 1000);
    }
    return () => clearInterval(intervalo);
  }, [enVivo]);

  useEffect(() => { 
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; 
  }, [mensajes]);
  
  useEffect(() => { 
    if (eventListRef.current) eventListRef.current.scrollTop = 0; 
  }, [historialEventos]);
  
  // ---------------------------------------------------------
  // 3. LÓGICA HÍBRIDA: BOTS + SOCKET REAL
  // ---------------------------------------------------------
  useEffect(() => {
    if (!enVivo) return;

    // A) CONEXIÓN REAL (SOCKET.IO)
    // A) CONEXIÓN REAL (SOCKET.IO)
    const nuevoSocket = io('http://localhost:3000');
    setSocket(nuevoSocket);
    
    const streamId = "sala_general"; 
    nuevoSocket.emit('unirse_stream', streamId);

    // --- NUEVO: AVISAR QUE ESTOY EN VIVO ---
    nuevoSocket.emit('iniciar_transmision', {
        id: streamId,
        titulo: configStream.titulo || "Transmisión en Vivo",
        streamer: usuario.nombre,
        img: "https://picsum.photos/300/200?grayscale" // Imagen de portada
    });

    // Escuchar mensajes de humanos
    nuevoSocket.on('recibir_mensaje', (msj) => {
        setMensajes(prev => [...prev.slice(-19), msj]);
    });

    // Escuchar regalos de humanos (Para alertas)
    nuevoSocket.on('evento_regalo', (data) => {
         // data = { alertaId, user, regalo, emoji }
         setRegalosCola(prev => [...prev, data]);
         
         const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
         setHistorialEventos(prev => [{ 
            id: data.alertaId, 
            tipo: 'regalo', 
            user: data.user, 
            regalo: data.regalo, 
            emoji: data.emoji, 
            hora: timestamp 
         }, ...prev]);

         setTimeout(() => setRegalosCola(prev => prev.filter(a => a.alertaId !== data.alertaId)), 4000);
    });

    // B) SIMULACIÓN DE BOTS (Se mantiene para rellenar)
    const loopBots = setInterval(() => {
      const rand = Math.random();
      // Solo bots chat (30% prob)
      if (rand < 0.3) {
        const users = ["Viewer1", "GamerPro", "Fan_Kick", "Troll99"];
        const texts = ["Hola!", "GG", "Que pro", "Juega otra cosa", "Saludame!"];
        const randomColor = Math.random() > 0.5 ? '#00ffcc' : '#bbb';
        const randomLevel = Math.floor(Math.random() * 50) + 1;
        
        // Usamos la misma estructura de mensaje
        const mensajeBot = { 
            id: Date.now() + Math.random(), 
            autor: users[Math.floor(Math.random() * users.length)], 
            texto: texts[Math.floor(Math.random() * texts.length)], 
            esRegalo: false, 
            colorAutor: randomColor, 
            nivel: randomLevel 
        };
        setMensajes(prev => [...prev.slice(-19), mensajeBot]);
      }
      // Bots enviando regalos (15% prob) - Opcional
      else if (rand > 0.85 && (usuario.regalos && usuario.regalos.length > 0)) {
         // ... Puedes dejar la simulación de regalos de bots si quieres, o quitarla para ver solo reales
      }
    }, 2000); 

    return () => {
        clearInterval(loopBots);
        nuevoSocket.disconnect();
    };
  }, [enVivo, usuario.regalos]);
  // ---------------------------------------------------------

  // INICIAR STREAM CON CONFIGURACIÓN 
  const iniciarStream = () => {
    if (!configStream.titulo.trim()) {
      alert('Por favor ingresa un título para tu stream');
      return;
    }
    setEnVivo(true);
    setMostrarConfigStream(false);
  };

  // --- FINALIZAR STREAM ---
  const finalizarStream = () => {
    // --- NUEVO: AVISAR QUE TERMINÉ ---
    if (socket) {
        socket.emit('detener_transmision', "sala_general");
        socket.disconnect(); // Desconectar socket manualmente al parar
    }
    // --------------------------------

    setEnVivo(false);
    
    const horasGanadas = Math.ceil(tiempo / 10); 
    const statsActuales = usuario.estadisticasStreamer || { horasTotales: 0 };
    const nuevasHorasTotales = (statsActuales.horasTotales || 0) + horasGanadas;
    const nuevoNivel = Math.floor(nuevasHorasTotales / 10) + 1;

    setUsuario({
      ...usuario,
      nivelStreamer: nuevoNivel,
      estadisticasStreamer: {
        ...statsActuales,
        horasTotales: nuevasHorasTotales
      }
    });

    setDatosResumen({
      duracion: formatoTiempo(tiempo),
      horas: horasGanadas,
      xp: horasGanadas * 100 
    });

    setMostrarResumen(true);
    setConfigStream({
      titulo: '',
      categoria: 'Juegos',
      etiquetas: ''
    });
        if (nuevoNivel > (usuario.nivelStreamer || 0)) {
      const alerta = document.createElement('div');
      alerta.className = 'alerta-nivel-flotante';
      alerta.innerText = `🎉 ¡Subiste al nivel ${nuevoNivel}!`;
      document.body.appendChild(alerta);

      setTimeout(() => {
        document.body.removeChild(alerta);
      }, 4000);
    }
  };

  const irAlDashboard = () => {
    navigate('/dashboard-streamer');
  };

  const formatoTiempo = (s) => new Date(s * 1000).toISOString().substr(11, 8);

  return (
    <div className="stream-manager-ui">
      <header className="top-bar-obs">
        <div className="left-controls">
          <div className={`status-dot ${enVivo ? 'live' : ''}`}></div>
          <span>{enVivo ? `EN VIVO - ${formatoTiempo(tiempo)}` : 'OFFLINE'}</span>
        </div>
        <div className="right-controls">
          {!enVivo ? (
            <button className="btn-start" onClick={() => setMostrarConfigStream(true)}>EMITIR</button>
          ) : (
            <button className="btn-stop" onClick={finalizarStream}>DETENER</button>
          )}
        </div>
      </header>

      <div className="workspace-obs">
        {/* ACTIVIDAD */}
        <div className="left-dock">
          <div className="dock-title">🔔 Actividad Reciente</div>
          <div className="event-list" ref={eventListRef}>
            {historialEventos.map(evento => (
                <div key={evento.id} className="event-card">
                  <div><span className="user">{evento.user}</span><span className="action">envió un regalo</span></div>
                  <div className="detail">{evento.emoji} {evento.regalo}</div>
                  <div style={{fontSize: '0.7rem', color: '#555', marginTop: '4px'}}>{evento.hora}</div>
                </div>
            ))}
          </div>
        </div>

        {/* PREVIEW */}
        <div className="preview-area">
          <div className="video-placeholder">
            {enVivo ? (
              <>
                <div className="live-indicator">EN VIVO</div>
                <div className="game-screen">🎮 VISTA PREVIA</div>
                
                {/* PARTE INFERIOR */}
                <div className="stream-info-overlay">
                  <div className="stream-title">{configStream.titulo}</div>
                  <div className="stream-meta">
                    <span className="stream-category">{configStream.categoria}</span>
                    <span className="stream-viewers">👁 1.2k</span>
                  </div>
                </div>

                <div className="overlay-layer">
                  {regalosCola.map(alerta => (
                    <div key={alerta.alertaId} className="alerta-box">
                      <div className="alerta-emoji">{alerta.emoji}</div>
                      <div className="alerta-info">
                        <span className="alerta-user">{alerta.user} ENVIÓ:</span>
                        <span className="alerta-name">{alerta.nombre}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="offline-msg">
                <span>⚫</span>
                <span style={{fontSize:'0.9rem'}}>Stream Offline</span>
              </div>
            )}
          </div>
        </div>

        {/* CHAT */}
        <div className="side-dock">
          <div className="dock-title">💬 Chat del Stream</div>
          <div className="chat-feed" ref={chatRef}>
            {mensajes.map(m => (
              <div key={m.id} className={`chat-line ${m.esRegalo ? 'highlight' : ''}`}>
                <span className="insignia-nivel">{m.nivel || 1}</span>
                <span className="chat-user" style={{ color: m.colorAutor || (m.esRegalo ? '#a855f7' : '#bbb') }}>{m.autor}:</span>
                <span className="chat-text">{m.texto}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONFIGURAR PUNTOS POR NIVEL */}
      <div className="config-puntos-nivel">
        <h3>Configurar puntos requeridos por nivel</h3>

        {/* Lista de niveles existentes */}
        {Object.entries(puntosPorNivel).map(([nivel, puntos]) => (
          <div key={nivel} style={{ marginBottom: '5px' }}>
            <input
              type="number"
              value={nivel}
              disabled
              style={{ width: '50px', marginRight: '5px' }}
            />
            <input
              type="number"
              value={puntos}
              min={0}
              onChange={(e) => actualizarNivel(nivel, e.target.value)}
              style={{ width: '60px', marginRight: '5px' }}
            /> puntos
            <button onClick={() => eliminarNivel(nivel)}>❌</button>
          </div>
        ))}

        {/* Añadir nuevo nivel */}
        <div style={{ marginTop: '10px' }}>
          <input
            type="number"
            placeholder="Nivel"
            value={nuevoNivel}
            onChange={(e) => setNuevoNivel(e.target.value)}
            style={{ width: '50px', marginRight: '5px' }}
          />
          <input
            type="number"
            placeholder="XP requerida"
            value={nuevoXP}
            onChange={(e) => setNuevoXP(e.target.value)}
            style={{ width: '60px', marginRight: '5px' }}
          />
          <button onClick={() => {
            if (!nuevoNivel || !nuevoXP) return;
            actualizarNivel(nuevoNivel, nuevoXP);
            setNuevoNivel('');
            setNuevoXP('');
          }}>➕ Añadir</button>
        </div>
      </div>

      {/* MODAL DE CONFIGURACIÓN DE STREAM */}
      {mostrarConfigStream && (
        <div className="modal-overlay">
          <div className="modal-config-stream">
            <div className="modal-header">
              <h2>🎥 Configurar Stream</h2>
              <p>Prepara tu transmisión antes de salir en vivo</p>
            </div>

            <div className="config-form">
              <div className="form-group">
                <label>Título del Stream</label>
                <input
                  type="text"
                  placeholder="Ej: Jugando Fortnite con la comunidad - ¡Sígueme!"
                  value={configStream.titulo}
                  onChange={(e) => setConfigStream({...configStream, titulo: e.target.value})}
                  maxLength={100}
                />
                <div className="char-count">{configStream.titulo.length}/100</div>
              </div>

              <div className="form-group">
                <label>Categoría</label>
                <select 
                  value={configStream.categoria}
                  onChange={(e) => setConfigStream({...configStream, categoria: e.target.value})}
                >
                  <option value="Juegos">🎮 Juegos</option>
                  <option value="Música">🎵 Música</option>
                  <option value="Charla">💬 Charla</option>
                  <option value="Deportes">⚽ Deportes</option>
                  <option value="Arte">🎨 Arte</option>
                  <option value="Programación">💻 Programación</option>
                </select>
              </div>

              <div className="form-group">
                <label>Etiquetas (opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: fortnite, español, diversión"
                  value={configStream.etiquetas}
                  onChange={(e) => setConfigStream({...configStream, etiquetas: e.target.value})}
                />
              </div>

              <div className="preview-card">
                <div className="preview-label">Vista previa:</div>
                <div className="preview-content">
                  <div className="preview-title">{configStream.titulo || "Tu título aparecerá aquí"}</div>
                  <div className="preview-category">{configStream.categoria}</div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-cancel"
                onClick={() => setMostrarConfigStream(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-start-stream"
                onClick={iniciarStream}
                disabled={!configStream.titulo.trim()}
              >
                🎬 Iniciar Transmisión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE RESUMEN */}
      {mostrarResumen && (
        <div className="modal-overlay">
          <div className="modal-resumen">
            <h2>Stream Finalizado</h2>
            <p className="subtitulo">¡Buen trabajo hoy! Aquí tienes tus estadísticas.</p>
            
            <div className="resumen-stats">
              <div className="stat-item">
                <span className="label">Duración</span>
                <span className="value" style={{color: 'white'}}>{datosResumen.duracion}</span>
              </div>
              <div className="stat-item">
                <span className="label">Horas+</span>
                <span className="value">+{datosResumen.horas}</span>
              </div>
              <div className="stat-item">
                <span className="label">XP Ganada</span>
                <span className="value">+{datosResumen.xp}</span>
              </div>
            </div>

            <button className="btn-continuar" onClick={irAlDashboard}>
              Ir al Dashboard ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StreamManager;