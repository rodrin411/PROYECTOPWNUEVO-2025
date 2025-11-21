import { useState, useEffect, useRef } from 'react';
import { useOutletContext, useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import './VistaTransmision.css';

function VistaTransmision() {
  const { usuario, setUsuario } = useOutletContext();
  const ubicacion = useLocation();
  const referenciaChat = useRef(null);
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null); // Estado para guardar la conexión

  const datosTransmision = ubicacion.state || {
    titulo: "Transmisión Desconocida",
    streamer: "Usuario",
    id: "global"
  };

  const streamId = datosTransmision.id || "sala_general";

  // Estado de mensajes
  const [mensajes, setMensajes] = useState([
    { id: 1, autor: 'Sistema', nivel: 99, texto: `Bienvenido al chat de ${datosTransmision.streamer}`, esMod: true }
  ]);
  
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [notificacionNivel, setNotificacionNivel] = useState(null);
  const [mostrarModalRegalos, setMostrarModalRegalos] = useState(false);
  const [regaloSeleccionado, setRegaloSeleccionado] = useState(null);
  const [errorSaldo, setErrorSaldo] = useState(false);

  // Catálogo de Regalos
  const catalogoRegalos = [
    { id: 1, nombre: 'Like', costo: 10, xp: 5, emoji: '👍' },
    { id: 2, nombre: 'Corazón', costo: 20, xp: 10, emoji: '❤️' },
    { id: 3, nombre: 'Aplausos', costo: 30, xp: 15, emoji: '👏' },
    { id: 4, nombre: 'Estrella', costo: 50, xp: 25, emoji: '⭐' },
    { id: 5, nombre: 'Fuego', costo: 100, xp: 60, emoji: '🔥' },
    { id: 6, nombre: 'Corona', costo: 500, xp: 300, emoji: '👑' },
  ];

  // --- 1. CONEXIÓN CON EL BACKEND (SOCKET) ---
  useEffect(() => {
    // Conectar al servidor (puerto 3000)
    const nuevoSocket = io('http://localhost:3000');
    setSocket(nuevoSocket);

    // Unirse a la sala específica de este stream
    nuevoSocket.emit('unirse_stream', streamId);

    // A) Escuchar mensajes que llegan del servidor
    nuevoSocket.on('recibir_mensaje', (msj) => {
      setMensajes((prev) => [
        ...prev.slice(-49), // Mantener solo los últimos 50
        { 
          ...msj, 
          esYo: msj.autor === usuario?.nombre // Identificar si fui yo
        }
      ]);
    });

    // B) Escuchar actualización de saldo/nivel
    nuevoSocket.on('actualizar_saldo', (data) => {
       if (usuario) {
         const usuarioActualizado = { 
            ...usuario, 
            monedas: data.nuevoSaldo, 
            nivel: data.nuevoNivel, 
            puntos: data.nuevosPuntos 
         };
         
         // Si subió de nivel, mostrar notificación
         if (data.nuevoNivel > usuario.nivel) {
            setNotificacionNivel(data.nuevoNivel);
            setTimeout(() => setNotificacionNivel(null), 4000);
         }

         setUsuario(usuarioActualizado);
         localStorage.setItem('usuario_sesion', JSON.stringify(usuarioActualizado));
       }
    });

    // Limpieza al salir de la página
    return () => nuevoSocket.disconnect();
  }, [streamId, usuario?.nombre]); // Se reconecta si cambia el usuario o el stream

  useEffect(() => {
    if(referenciaChat.current) {
      referenciaChat.current.scrollTop = referenciaChat.current.scrollHeight;
    }
  }, [mensajes]);


  // --- 2. ENVIAR MENSAJE ---
  const enviarMensaje = (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;
    if (!usuario) return alert("Inicia sesión para chatear");

    // Emitir evento al servidor
    socket.emit('enviar_mensaje', {
      usuarioId: usuario.id,
      nombre: usuario.nombre,
      texto: nuevoMensaje,
      streamId: streamId
    });

    setNuevoMensaje("");
  };

  // --- 3. ENVIAR REGALO ---
  const enviarRegalo = () => {
    if (!regaloSeleccionado) return;
    if (!usuario) return alert("Inicia sesión para enviar regalos");

    // Validación visual rápida
    if (usuario.monedas < regaloSeleccionado.costo) {
      setErrorSaldo(true); 
      return;
    }

    // Emitir evento de regalo al servidor
    socket.emit('enviar_regalo', {
      usuarioId: usuario.id,
      streamId: streamId,
      regalo: regaloSeleccionado
    });
    
    setMostrarModalRegalos(false);
    setRegaloSeleccionado(null);
  };

  const cerrarModal = () => {
    setMostrarModalRegalos(false);
    setRegaloSeleccionado(null);
    setErrorSaldo(false);
  };

  const irATienda = () => {
    navigate('/comprar-monedas');
  };

  return (
    <div className="contenedor-transmision">
      <main className="escenario-principal">
        <div className="reproductor-video">
           <div className="indicador-vivo">EN VIVO</div>
           <div className="boton-reproducir">▶</div>
           {/* Overlay de regalo */}
        </div>

        <div className="barra-info-transmision">
            <div className="perfil-streamer">
                <div className="circulo-avatar">{datosTransmision.streamer.charAt(0)}</div>
                <div>
                    <h1>{datosTransmision.titulo}</h1>
                    <p className="nombre-streamer">
                        {datosTransmision.streamer} <span className="verificado">✔</span> 
                    </p>
                </div>
            </div>
            <div className="acciones-transmision">
                <button className="boton-seguir">Seguir</button>
                <div className="contador-vistas">👁 12.4k</div>
            </div>
        </div>
      </main>

      <aside className="barra-lateral-chat">
         <div className="encabezado-chat">Chat de la transmisión</div>
         
         {/* Notificación de Nivel */}
         {notificacionNivel && <div className="alerta-nivel-flotante">🎉 ¡Nivel {notificacionNivel} alcanzado!</div>}

         <div className="caja-mensajes" ref={referenciaChat}>
            {mensajes.map(msg => (
                <div key={msg.id} className={`fila-mensaje ${msg.esYo ? 'propio' : ''} ${msg.esRegalo ? 'mensaje-regalo' : ''}`}>
                    <span className="insignia-nivel">{msg.nivel || 1}</span>
                    <span className="autor-mensaje" style={{color: msg.esMod ? '#00ffcc' : (msg.esYo ? '#00ffcc' : (msg.colorAutor || '#bbb'))}}>
                        {msg.autor}:
                    </span>
                    <span className="texto-mensaje">{msg.texto}</span>
                </div>
            ))}
         </div>
         
         <form className="area-input-chat" onSubmit={enviarMensaje}>
            <input 
              value={nuevoMensaje} 
              onChange={e => setNuevoMensaje(e.target.value)} 
              placeholder={usuario ? "Enviar mensaje..." : "Inicia sesión para chatear"} 
              disabled={!usuario}
            />
            <div className="pie-chat">
                {usuario?.rol === 'espectador' || usuario?.rol === 'streamer' ? (
                    <>
                      <span className="mis-puntos">🏆 {usuario?.puntos || 0}</span>
                      <button type="button" className="boton-regalo" onClick={() => setMostrarModalRegalos(true)}>🎁</button>
                    </>
                ) : (
                    <span className="identidad-streamer" style={{color: '#aaa', fontSize: '0.8rem'}}>Invitado</span>
                )}
            </div>
         </form>
      </aside>

      {/* --- MODAL DE REGALOS --- */}
      {mostrarModalRegalos && (
          <div className="overlay-regalos">
              <div className="modal-regalos">
                  {!errorSaldo ? (
                    <>
                        <div className="encabezado-regalos">
                            <h3>🎁 Enviar un regalo</h3>
                            <button onClick={cerrarModal}>✕</button>
                        </div>
                        
                        <p className="saldo-disponible">Monedas disponibles: <span>{usuario?.monedas || 0} 🟡</span></p>

                        <div className="grid-regalos">
                            {catalogoRegalos.map(regalo => (
                                <div 
                                    key={regalo.id} 
                                    className={`tarjeta-regalo ${regaloSeleccionado?.id === regalo.id ? 'seleccionada' : ''}`}
                                    onClick={() => setRegaloSeleccionado(regalo)}
                                >
                                    <div className="emoji-regalo">{regalo.emoji}</div>
                                    <div className="nombre-regalo">{regalo.nombre}</div>
                                    <div className="costo-regalo">{regalo.costo}</div>
                                    <div className="xp-regalo">+{regalo.xp} XP</div>
                                </div>
                            ))}
                        </div>

                        <button 
                            className="btn-enviar-regalo" 
                            disabled={!regaloSeleccionado}
                            onClick={enviarRegalo}
                        >
                            Enviar Regalo
                        </button>
                    </>
                  ) : (
                    <div className="vista-error-saldo">
                        <div className="icono-triste">😓</div>
                        <h3>Saldo Insuficiente</h3>
                        <p>
                            Te faltan monedas para enviar este regalo.
                            <br/>
                            ¿Quieres recargar ahora?
                        </p>
                        <div className="acciones-error">
                            <button className="btn-recargar" onClick={irATienda}>Ir a Tienda 🛒</button>
                            <button className="btn-volver" onClick={() => setErrorSaldo(false)}>Volver</button>
                        </div>
                    </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
}

export default VistaTransmision;