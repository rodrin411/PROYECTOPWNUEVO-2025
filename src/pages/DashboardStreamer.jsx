import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import './DashboardStreamer.css';

function DashboardStreamer() {
  const { usuario, setUsuario } = useOutletContext();
  const navigate = useNavigate();

  // --- ESTADOS DEL MODAL DE REGALOS ---
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoRegalo, setNuevoRegalo] = useState({ nombre: '', costo: '', xp: '', emoji: '🎁' });

  const catalogoEmojis = ['🎁', '👋', '🔥', '⭐', '👑', '💎', '🎉', '👻', '🎮', '💩', '🌹', '🍕'];
  
  // Definir defaults
  const regalosDefault = [
    { id: 'def-1', nombre: 'Like', costo: 10, xp: 5, emoji: '👍' },
    { id: 'def-2', nombre: 'Rosas', costo: 50, xp: 20, emoji: '🌹' },
    { id: 'def-3', nombre: 'Fuego', costo: 100, xp: 50, emoji: '🔥' }
  ];

  // --- INICIALIZAR DEFAULTS ---
  useEffect(() => {
    if (!usuario.regalos) {
      setUsuario(prev => ({
        ...prev,
        regalos: regalosDefault
      }));
    }
  }, [usuario.regalos, setUsuario]);

  const regalos = usuario.regalos || []; 
  const nivel = usuario.nivelStreamer || 1;
  const horas = usuario.estadisticasStreamer?.horasTotales || 0;
  const progreso = Math.min((horas % 10) * 10, 100); 

  // --- FUNCIONES DE REGALOS ---
  const handleInputChange = (e) => {
    setNuevoRegalo({ ...nuevoRegalo, [e.target.name]: e.target.value });
  };

  const agregarRegalo = (e) => {
    e.preventDefault();
    if (!nuevoRegalo.nombre || !nuevoRegalo.costo) return;

    const regaloCreado = {
      id: Date.now(),
      nombre: nuevoRegalo.nombre,
      costo: parseInt(nuevoRegalo.costo),
      xp: parseInt(nuevoRegalo.xp) || 10,
      emoji: nuevoRegalo.emoji
    };

    setUsuario({
      ...usuario,
      regalos: [...regalos, regaloCreado]
    });

    setNuevoRegalo({ nombre: '', costo: '', xp: '', emoji: '🎁' });
  };

  const eliminarRegalo = (id) => {
    const regalosFiltrados = regalos.filter(r => r.id !== id);
    setUsuario({ ...usuario, regalos: regalosFiltrados });
  };

  return (
    <div className="dashboard-container">
      <div className="welcome-banner">
        <h1>Hola, {usuario.nombre} 👋</h1>
        <p>Panel de Control y Gestión</p>
      </div>

      <div className="actions-grid">
        <div className="action-card primary" onClick={() => navigate('/stream-manager')}>
          <div className="icon-circle">🎥</div>
          <h3>Panel de Transmisión</h3>
          <p>Inicia tu directo, simula chat y alertas.</p>
          <button className="btn-action">Abrir Panel</button>
        </div>

        <div className="action-card secondary" onClick={() => setMostrarModal(true)}>
          <div className="icon-circle">🎁</div>
          <h3>Gestionar Regalos</h3>
          <p>Configura {regalos.length} recompensas activas.</p>
          <button className="btn-action outline">Configurar</button>
        </div>
      </div>

      <h3 className="section-title">Tus Estadísticas</h3>
      <div className="stats-row">
        <div className="stat-box">
          <span className="stat-label">Nivel</span>
          <span className="stat-value">{nivel}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Horas Totales</span>
          <span className="stat-value">{horas}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Progreso Nivel {nivel + 1}</span>
          <div className="mini-progress">
            <div style={{width: `${progreso}%`}}></div>
          </div>
          <span className="stat-sub">{progreso}% completado</span>
        </div>
      </div>

      {mostrarModal && (
        <div className="modal-overlay-dashboard">
          <div className="modal-content-dashboard">
            <div className="modal-header">
              <h2>🎁 Configurar Tienda</h2>
              <button className="close-btn" onClick={() => setMostrarModal(false)}>×</button>
            </div>

            <div className="modal-body-split">
              <div className="form-section">
                <h3>Crear Nuevo</h3>
                <form onSubmit={agregarRegalo}>
                  <input 
                    type="text" name="nombre" placeholder="Nombre (ej. Saludo)" 
                    value={nuevoRegalo.nombre} onChange={handleInputChange} maxLength="15" required 
                  />
                  <div className="row-inputs">
                    <input 
                      type="number" name="costo" placeholder="Costo" 
                      value={nuevoRegalo.costo} onChange={handleInputChange} required 
                    />
                    <input 
                      type="number" name="xp" placeholder="XP" 
                      value={nuevoRegalo.xp} onChange={handleInputChange} 
                    />
                  </div>
                  <div className="emoji-picker">
                    {catalogoEmojis.map(em => (
                      <span key={em} 
                        className={nuevoRegalo.emoji === em ? 'selected' : ''}
                        onClick={() => setNuevoRegalo({...nuevoRegalo, emoji: em})}
                      >{em}</span>
                    ))}
                  </div>
                  <button type="submit" className="btn-save">Añadir Regalo</button>
                </form>
              </div>

              <div className="list-section">
                <h3>Activos ({regalos.length})</h3>
                {regalos.length === 0 ? (
                  <p className="empty-msg">Sin regalos configurados.</p>
                ) : (
                  <ul className="regalos-list">
                    {regalos.map(r => (
                      <li key={r.id} className="regalo-item-mini">
                        <span className="emoji">{r.emoji}</span>
                        <div className="info">
                          <strong>{r.nombre}</strong>
                          <small>🟡{r.costo} | ⚡{r.xp}</small>
                        </div>
                        {/* a */}
                        <button onClick={() => eliminarRegalo(r.id)}>🗑️</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardStreamer;
