import { useState, useEffect, useRef } from 'react';
import { useParams, useOutletContext, useLocation } from 'react-router-dom';
import './VistaTransmision.css';

function VistaTransmision() {
  const { usuario, setUsuario } = useOutletContext();
  const ubicacion = useLocation();
  const referenciaChat = useRef(null);
  
  const datosTransmision = ubicacion.state || {
     titulo: "Transmisión Desconocida",
     streamer: "Usuario",
  };

  const [mensajes, setMensajes] = useState([
    { id: 1, autor: 'Sistema', nivel: 99, texto: `Bienvenido al chat de ${datosTransmision.streamer}`, esMod: true },
    { id: 2, autor: 'Fanatico123', nivel: 5, texto: '¡Hola a todos!', esMod: false },
  ]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  
  // Estado para la notificación flotante
  const [notificacionNivel, setNotificacionNivel] = useState(null);

  useEffect(() => {
      if(referenciaChat.current) {
          referenciaChat.current.scrollTop = referenciaChat.current.scrollHeight;
      }
  }, [mensajes]);

  // --- LÓGICA DE MATEMÁTICA (Igual al Perfil) ---
  const calcularTechoNivel = (n) => (10 * n * (n + 1)) / 2;

  const enviarMensaje = (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;
    if (!usuario) return alert("Inicia sesión para chatear");

    const nivelActual = usuario.nivel || 1;
    const puntosActuales = usuario.puntos || 0;
    
    // Sumamos el punto hipotético
    const nuevosPuntos = puntosActuales + 1;
    const techoNivelActual = calcularTechoNivel(nivelActual);

    let nivelParaElMensaje = nivelActual;
    let huboSubidaDeNivel = false;

    // Verificamos si con este mensaje subimos de nivel
    if (nuevosPuntos >= techoNivelActual) {
        nivelParaElMensaje = nivelActual + 1; 
        huboSubidaDeNivel = true;
    }

    // 2. AGREGAMOS EL MENSAJE (Usando el nivel calculado)
    setMensajes([...mensajes, {
        id: Date.now(),
        autor: usuario.nombre,
        nivel: nivelParaElMensaje, 
        texto: nuevoMensaje,
        esYo: true
    }]);
    setNuevoMensaje("");

    // ACTUALIZAMOS EL ESTADO GLOBAL
    setUsuario({ 
        ...usuario, 
        puntos: nuevosPuntos,
        nivel: nivelParaElMensaje
    });

    if (huboSubidaDeNivel) {
        setNotificacionNivel(nivelParaElMensaje);
        // Ocultar después de 4 segundos
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
         
         {notificacionNivel && (
             <div className="alerta-nivel-flotante">
                 🎉 ¡Nivel {notificacionNivel} alcanzado!
             </div>
         )}

         <div className="caja-mensajes" ref={referenciaChat}>
            {mensajes.map(msg => (
                <div key={msg.id} className={`fila-mensaje ${msg.esYo ? 'propio' : ''}`}>
                    <span className="insignia-nivel">{msg.nivel}</span>
                    <span className="autor-mensaje" style={{color: msg.esMod ? '#00ffcc' : (msg.esYo ? '#00ffcc' : '#bbb')}}>
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
                placeholder="Enviar mensaje..."
            />
            <div className="pie-chat">
                <span className="mis-puntos">🏆 {usuario?.puntos || 0}</span>
                <button type="button" className="boton-regalo">🎁</button>
            </div>
         </form>
      </aside>
    </div>
  );
}

export default VistaTransmision;