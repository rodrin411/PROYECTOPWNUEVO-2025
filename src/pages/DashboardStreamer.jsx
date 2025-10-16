import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import './DashboardStreamer.css';

function DashboardStreamer() {
  const { usuario } = useOutletContext();

  const [nivel, setNivel] = useState(usuario.nivelStreamer || 1);
  const [horasActuales, setHorasActuales] = useState(usuario.estadisticasStreamer.horasTotales || 0);
  const [regalos, setRegalos] = useState([]);
  const [nivelSubido, setNivelSubido] = useState(false);

  const agregarHora = () => {
    const nuevasHoras = horasActuales + 1;

    // Calcular las horas necesarias para el nivel actual
    const horasNecesarias = nivel * 10; 
    const horasHastaNivelAnterior = ((nivel - 1) * nivel * 5); 

    const horasEnNivelActual = nuevasHoras - horasHastaNivelAnterior;

    if (horasEnNivelActual >= horasNecesarias) {
      setNivel(nivel + 1);
      setNivelSubido(true);

      setTimeout(() => setNivelSubido(false), 2500);
    }

    setHorasActuales(nuevasHoras);
  };

  const agregarRegalo = () => {
    const nuevo = { id: regalos.length + 1, nombre: `Regalo 🎁 #${regalos.length + 1}` };
    setRegalos([...regalos, nuevo]);
  };

  // Calcular progreso y horas restantes
  const horasNecesarias = nivel * 10;
  const horasHastaNivelAnterior = ((nivel - 1) * nivel * 5);
  const horasEnNivelActual = horasActuales - horasHastaNivelAnterior;

  const progresoHoras = Math.min((horasEnNivelActual / horasNecesarias) * 100, 100);
  const horasRestantes = Math.max(horasNecesarias - horasEnNivelActual, 0);

  return (
    <div className="dashboard-container">
      {nivelSubido && (
        <div className="overlay-streamer">
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

        <div className="stat-card">
          <div className="stat-card-icon">📡</div>
          <div className="stat-card-value">{usuario.estadisticasStreamer.sesiones}</div>
          <div className="stat-card-label">Sesiones de Stream</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">👥</div>
          <div className="stat-card-value">{usuario.estadisticasStreamer.picoEspectadores}</div>
          <div className="stat-card-label">Pico de Espectadores</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">❤️</div>
          <div className="stat-card-value">{usuario.estadisticasStreamer.subsActuales}</div>
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
