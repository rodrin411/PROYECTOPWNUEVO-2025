import { useState } from 'react';
// 1. IMPORTAMOS 'setUsuario' DESDE EL CONTEXTO
import { useOutletContext } from 'react-router-dom';
import './DashboardStreamer.css';

function DashboardStreamer() {
  // 2. OBTENEMOS 'setUsuario' JUNTO CON 'usuario'
  const { usuario, setUsuario } = useOutletContext();

  // 3. ELIMINAMOS LOS 'useState' PARA 'nivel' y 'horasActuales'
  //    Mantenemos los que SÍ son locales (regalos y notificación)
  const [nivelSubido, setNivelSubido] = useState(false);

  // 4. LEEMOS LOS DATOS DIRECTAMENTE DEL 'usuario' GLOBAL
  const nivel = usuario.nivelStreamer || 1;
  const horasActuales = usuario.estadisticasStreamer.horasTotales || 0;
  // Guardamos las stats para usarlas fácil
  const stats = usuario.estadisticasStreamer;
  const regalos = usuario.regalos || [];


  // 5. MODIFICAMOS 'agregarHora' PARA USAR 'setUsuario'
  const agregarHora = () => {
    const nuevasHoras = horasActuales + 1;
    let nuevoNivel = nivel; // Por defecto, el nivel no cambia

    // Mantenemos tu lógica de niveles
    const horasNecesarias = nivel * 10;
    const horasHastaNivelAnterior = ((nivel - 1) * nivel * 5);
    const horasEnNivelActual = nuevasHoras - horasHastaNivelAnterior;

    if (horasEnNivelActual >= horasNecesarias) {
      // Sube de nivel
      nuevoNivel = nivel + 1;
      setNivelSubido(true); // Esto es local y está bien
      setTimeout(() => setNivelSubido(false), 2500);
    }

    // 6. ¡AQUÍ ESTÁ LA MAGIA!
    // Actualizamos el estado GLOBAL con 'setUsuario'
    setUsuario({
      ...usuario, // Mantenemos los datos (nombre, avatar, rol...)
      nivelStreamer: nuevoNivel, // Guardamos el nuevo nivel
      estadisticasStreamer: { // Creamos un nuevo objeto de stats
        ...stats, // Mantenemos las stats viejas (sesiones, pico, etc.)
        horasTotales: nuevasHoras, // Sobrescribimos solo las horas
      },
    });
  };

  // Esta función es local y no cambia
  const agregarRegalo = () => {
    const nuevo = { id: regalos.length + 1, nombre: `Regalo 🎁 #${regalos.length + 1}` };
    
    // Actualizamos el estado GLOBAL
    setUsuario({
      ...usuario, // Mantenemos los datos (nombre, rol, stats...)
      regalos: [...regalos, nuevo] // Añadimos el nuevo regalo al array
    });
  };

  // 7. EL RESTO DE TU CÓDIGO (CÁLCULOS Y RETURN) FUNCIONA PERFECTO
  //    Ya que 'nivel' y 'horasActuales' ahora vienen del 'usuario' global,
  //    se recalcularán solos cada vez que 'usuario' cambie.
  const horasNecesarias = nivel * 10;
  const horasHastaNivelAnterior = ((nivel - 1) * nivel * 5);
  const horasEnNivelActual = horasActuales - horasHastaNivelAnterior;

  const progresoHoras = Math.min((horasEnNivelActual / horasNecesarias) * 100, 100);
  const horasRestantes = Math.max(horasNecesarias - horasEnNivelActual, 0);

  return (
    <div className="dashboard-container">
      {nivelSubido && (
        <div className="overlay-streamer">
          {/* 'nivel' se toma del estado global actualizado */}
          🎉 ¡Has subido al nivel {nivel}! 🎉
        </div>
      )}

      <h2>Dashboard de {usuario.nombre}</h2>
      <p>Resumen de tu actividad como streamer:</p>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-card-icon">⭐</div>
          <div className="stat-card-value">{nivel}</div>
          <div className="stat-card-label">Nivel Streamer</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">⏰</div>
          <div className="stat-card-value">{horasActuales}</div>
          <div className="stat-card-label">Horas Transmitidas</div>
          <button onClick={agregarHora}>+1 hora</button>
        </div>

        {/* El resto de las cards leen de 'usuario', lo cual está perfecto */}
        <div className="stat-card">
          <div className="stat-card-icon">📡</div>
          <div className="stat-card-value">{stats.sesiones}</div>
          <div className="stat-card-label">Sesiones de Stream</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">👥</div>
          <div className="stat-card-value">{stats.picoEspectadores}</div>
          <div className="stat-card-label">Pico de Espectadores</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">❤️</div>
          <div className="stat-card-value">{stats.subsActuales}</div>
          <div className="stat-card-label">Suscriptores</div>
        </div>
      </div>
      
      <div className="progress-section-streamer">
        <div className="progress-bar-streamer">
          <div
            className="progress-bar-fill-streamer"
            style={{ width: `${progresoHoras}%` }}
          >
            <span className="progress-text-streamer">{Math.floor(progresoHoras)}%</span>
          </div>
        </div>
        <p className="remaining-streamer">
          {horasRestantes > 0
            ? `Faltan ${horasRestantes} horas para el siguiente nivel. ¡Planifica tus transmisiones!`
            : `¡Has alcanzado el siguiente nivel! 🎉`}
        </p>
      </div>

      <div className="regalos-section">
        <h3>🎁 Regalos recibidos ({regalos.length})</h3>
        <button onClick={agregarRegalo}>Agregar regalo</button>
        <ul>
          {regalos.map((r) => (
            <li key={r.id}>{r.nombre}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default DashboardStreamer;
