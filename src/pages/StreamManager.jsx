import { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import './StreamManager.css';

function StreamManager() {
  const { usuario, setUsuario } = useOutletContext();
  const navigate = useNavigate();
  const chatRef = useRef(null);
  const eventListRef = useRef(null);

  // Estados de la transmisión
  const [enVivo, setEnVivo] = useState(false);
  const [tiempo, setTiempo] = useState(0);
  const [mensajes, setMensajes] = useState([]);
  const [regalosCola, setRegalosCola] = useState([]);
  const [historialEventos, setHistorialEventos] = useState([]);

  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [datosResumen, setDatosResumen] = useState({ duracion: '', horas: 0, xp: 0 });

  useEffect(() => {
    let intervalo;
    if (enVivo) {
      intervalo = setInterval(() => setTiempo(t => t + 1), 1000);
    }
    return () => clearInterval(intervalo);
  }, [enVivo]);


  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [mensajes]);
  useEffect(() => { if (eventListRef.current) eventListRef.current.scrollTop = 0; }, [historialEventos]);
  useEffect(() => {
    if (!enVivo) return;
    const regalosDisponibles = usuario.regalos || []; 
    const loop = setInterval(() => {
      const rand = Math.random();
      if (rand < 0.3) {
        const users = ["Viewer1", "GamerPro", "Fan_Kick", "Troll99"];
        const texts = ["Hola!", "GG", "Que pro", "Juega otra cosa", "Saludame!"];
        const randomColor = Math.random() > 0.5 ? '#00ffcc' : '#bbb';
        const randomLevel = Math.floor(Math.random() * 50) + 1;
        agregarMensaje(users[Math.floor(Math.random() * users.length)], texts[Math.floor(Math.random() * texts.length)], false, randomColor, randomLevel);
      } else if (rand > 0.85 && regalosDisponibles.length > 0) {
        const regalo = regalosDisponibles[Math.floor(Math.random() * regalosDisponibles.length)];
        enviarRegaloSimulado(regalo);
      }
    }, 2000); 
    return () => clearInterval(loop);
  }, [enVivo, usuario.regalos]);

  const agregarMensaje = (autor, texto, esRegalo = false, colorAutor = '#bbb', nivel = 1) => {
    setMensajes(prev => [...prev.slice(-19), { id: Date.now(), autor, texto, esRegalo, colorAutor, nivel }]);
  };

  const enviarRegaloSimulado = (regalo) => {
    const user = "FanMisterioso";
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const randomLevel = Math.floor(Math.random() * 99) + 1;
    agregarMensaje(user, `ha enviado ${regalo.nombre} ${regalo.emoji}`, true, '#a855f7', randomLevel);
    const alertaId = Date.now();
    setRegalosCola(prev => [...prev, { ...regalo, user, alertaId }]);
    setHistorialEventos(prev => [{ id: alertaId, tipo: 'regalo', user, regalo: regalo.nombre, emoji: regalo.emoji, hora: timestamp }, ...prev]);
    setTimeout(() => setRegalosCola(prev => prev.filter(a => a.alertaId !== alertaId)), 4000);
  };

  // --- LÓGICA DE FINALIZAR STREAM ---
  const finalizarStream = () => {
    setEnVivo(false);
    
    // Cada 10 segundos reales = 1 hora simulada de stream
    const horasGanadas = Math.ceil(tiempo / 10); 
    const statsActuales = usuario.estadisticasStreamer || { horasTotales: 0 };
    const nuevasHorasTotales = (statsActuales.horasTotales || 0) + horasGanadas;
    
    // Cálculo de nivel (ejemplo: cada 10 horas subes 1 nivel)
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
            <button className="btn-start" onClick={() => setEnVivo(true)}>EMITIR</button>
          ) : (
            <button className="btn-stop" onClick={finalizarStream}>DETENER</button>
          )}
        </div>
      </header>

      <div className="workspace-obs">
        {/* IZQUIERDA: ACTIVIDAD */}
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

        {/* CENTRO: PREVIEW */}
        <div className="preview-area">
          <div className="video-placeholder">
            {enVivo ? (
              <>
                <div style={{position: 'absolute', top: '15px', left: '15px', background: '#ff0044', padding: '2px 8px', borderRadius: '3px', fontWeight: 'bold', fontSize: '0.7rem', color: 'white', zIndex: 5}}>EN VIVO</div>
                <div className="game-screen">🎮 VISTA PREVIA</div>
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
              <div className="offline-msg"><span>⚫</span><span style={{fontSize:'0.9rem'}}>Stream Offline</span></div>
            )}
          </div>
        </div>

        {/* DERECHA: CHAT */}
        <div className="side-dock">
          <div className="dock-title">💬 Chat del Stream</div>
          <div className="chat-feed" ref={chatRef}>
            {mensajes.map(m => (
              <div key={m.id} className={`chat-line ${m.esRegalo ? 'highlight' : ''}`}>
                <span className="insignia-nivel">{m.nivel || 1}</span>
                <span className="chat-user" style={{ color: m.colorAutor }}>{m.autor}:</span>
                <span className="chat-text">{m.texto}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL DE RESUMEN */}
      {mostrarResumen && (
        <div className="modal-resumen-overlay">
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