import { useState, useEffect, useRef } from 'react';
import { useParams, useOutletContext, useLocation, useNavigate } from 'react-router-dom';
import './VistaTransmision.css';

function VistaTransmision() {
  const { usuario, setUsuario } = useOutletContext();
  const ubicacion = useLocation();
  const referenciaChat = useRef(null);
  const navigate = useNavigate();
  
  const datosTransmision = ubicacion.state || {
     titulo: "Transmisión Desconocida",
     streamer: "Usuario",
  };

  const [mensajes, setMensajes] = useState([
    { id: 1, autor: 'Sistema', nivel: 99, texto: `Bienvenido al chat de ${datosTransmision.streamer}`, esMod: true },
    { id: 2, autor: 'Fanatico123', nivel: 5, texto: '¡Hola a todos!', esMod: false },
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

  useEffect(() => {
      if(referenciaChat.current) {
          referenciaChat.current.scrollTop = referenciaChat.current.scrollHeight;
      }
  }, [mensajes]);

  const calcularTechoNivel = (n) => (10 * n * (n + 1)) / 2;

  // --- FUNCIÓN ENVIAR REGALO  ---
  const enviarRegalo = () => {
      if (!regaloSeleccionado) return;
      if (!usuario) return alert("Inicia sesión para enviar regalos");

      if (usuario.monedas < regaloSeleccionado.costo) {
          setErrorSaldo(true); 
          return;
      }

      // Lógica de Niveles
      const nivelActual = usuario.nivel || 1;
      const puntosActuales = usuario.puntos || 0;
      
      const monedasRestantes = usuario.monedas - regaloSeleccionado.costo;
      const nuevosPuntos = puntosActuales + regaloSeleccionado.xp;
      
      let nuevoNivelCalculado = nivelActual;

      //Mientras tengas puntos, sigue subiendo
      while (nuevosPuntos >= calcularTechoNivel(nuevoNivelCalculado)) {
          nuevoNivelCalculado++;
      }

      let huboSubidaDeNivel = nuevoNivelCalculado > nivelActual;

      // Mensaje en el Chat
      const mensajeRegalo = {
          id: Date.now(),
          autor: usuario.nombre,
          nivel: nuevoNivelCalculado, 
          texto: `ha enviado un regalo: ${regaloSeleccionado.nombre} ${regaloSeleccionado.emoji}`,
          esYo: true,
          esRegalo: true 
      };

      setMensajes([...mensajes, mensajeRegalo]);

      // Actualizar Usuario Global
      setUsuario({ 
          ...usuario, 
          monedas: monedasRestantes,
          puntos: nuevosPuntos,
          nivel: nuevoNivelCalculado
      });

      if (huboSubidaDeNivel) {
          setNotificacionNivel(nuevoNivelCalculado);
          setTimeout(() => setNotificacionNivel(null), 4000);
      }
      
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

  // --- FUNCIÓN ENVIAR MENSAJE  ---
  const enviarMensaje = (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;
    if (!usuario) return alert("Inicia sesión para chatear");

    const nivelActual = usuario.nivel || 1;
    const puntosActuales = usuario.puntos || 0;
    const nuevosPuntos = puntosActuales + 1;
    
    let nuevoNivelCalculado = nivelActual;

    while (nuevosPuntos >= calcularTechoNivel(nuevoNivelCalculado)) {
        nuevoNivelCalculado++;
    }

    let huboSubidaDeNivel = nuevoNivelCalculado > nivelActual;

    setMensajes([...mensajes, {
        id: Date.now(),
        autor: usuario.nombre,
        nivel: nuevoNivelCalculado, 
        texto: nuevoMensaje,
        esYo: true
    }]);
    setNuevoMensaje("");

    setUsuario({ 
        ...usuario, 
        puntos: nuevosPuntos, 
        nivel: nuevoNivelCalculado 
    });

    if (huboSubidaDeNivel) {
        setNotificacionNivel(nuevoNivelCalculado);
        setTimeout(() => setNotificacionNivel(null), 4000);
    }
  };

  return (
    <div className="contenedor-transmision">
      <main className="escenario-principal">
        <div className="reproductor-video">
           <div className="indicador-vivo">EN VIVO</div>
           <div className="boton-reproducir">▶</div>
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
         
         {notificacionNivel && <div className="alerta-nivel-flotante">🎉 ¡Nivel {notificacionNivel} alcanzado!</div>}

         <div className="caja-mensajes" ref={referenciaChat}>
            {mensajes.map(msg => (
                <div key={msg.id} className={`fila-mensaje ${msg.esYo ? 'propio' : ''} ${msg.esRegalo ? 'mensaje-regalo' : ''}`}>
                    <span className="insignia-nivel">{msg.nivel}</span>
                    <span className="autor-mensaje" style={{color: msg.esMod ? '#00ffcc' : (msg.esYo ? '#00ffcc' : '#bbb')}}>
                        {msg.autor}:
                    </span>
                    <span className="texto-mensaje">{msg.texto}</span>
                </div>
            ))}
         </div>
         
         <form className="area-input-chat" onSubmit={enviarMensaje}>
            <input value={nuevoMensaje} onChange={e => setNuevoMensaje(e.target.value)} placeholder="Enviar mensaje..." />
            <div className="pie-chat">
                <span className="mis-puntos">🏆 {usuario?.puntos || 0}</span>
                <button type="button" className="boton-regalo" onClick={() => setMostrarModalRegalos(true)}>🎁</button>
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