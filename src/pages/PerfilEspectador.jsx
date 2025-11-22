import { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import "./PerfilEspectador.css";

function PerfilEspectador() {
  const { usuario, setUsuario } = useOutletContext(); 
  const navigate = useNavigate();
  
  // --- ESTADOS PARA EL HISTORIAL ---
  const [historial, setHistorial] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState("todos"); // 'todos', 'recarga', 'regalo'

  // --- CONSULTA AL BACKEND (QUERY) ---
  useEffect(() => {
    if (!usuario) return;

    const obtenerHistorial = async () => {
        try {
            // Construimos la URL con parámetros
            let url = `http://localhost:3000/api/historial/${usuario.id}`;
            if (filtroTipo !== 'todos') {
                url += `?tipo=${filtroTipo}`;
            }

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setHistorial(data);
            }
        } catch (error) {
            console.error("Error cargando historial:", error);
        }
    };

    obtenerHistorial();
  }, [usuario, filtroTipo]); 

  if (!usuario) {
     return <div className="perfil-container">Cargando perfil...</div>;
  }

  // Lógica de Niveles
  const nivel = usuario.nivel || 1;
  const puntos = usuario.puntos || 0;
  const monedas = usuario.monedas || 0;

  const calcularTechoNivel = (n) => (10 * n * (n + 1)) / 2;
  const techoNivelActual = calcularTechoNivel(nivel);       
  const techoNivelAnterior = calcularTechoNivel(nivel - 1); 
  const puntosEnEsteNivel = puntos - techoNivelAnterior;
  const rangoDelNivel = techoNivelActual - techoNivelAnterior;
  const progreso = Math.min((puntosEnEsteNivel / rangoDelNivel) * 100, 100);
  const puntosRestantes = Math.max(techoNivelActual - puntos, 0);

  // Sincronización de nivel visual
  useEffect(() => {
    if (puntos >= techoNivelActual) {
      setUsuario({
        ...usuario,
        nivel: nivel + 1,
        puntos: puntos 
      });
    }
  }, [puntos, nivel, techoNivelActual, usuario, setUsuario]);

  const comprarMonedas = () => {
    navigate("/comprar-monedas");
  };

  return (
    <div className="perfil-container">
      <div className="profile-card">
        <div className="profile-header-row">
            <div className="profile-avatar">
              <img
                src={usuario.avatarUrl || "https://cdn-icons-png.flaticon.com/512/4140/4140048.png"}
                alt="Avatar"
              />
            </div>
            <div>
                <h2 className="profile-name">{usuario.nombre}</h2>
                <span className="rol-badge">👀 Espectador</span>
            </div>
        </div>

        <ul className="profile-stats">
          <li>⭐ Nivel: {nivel}</li>
          <li>🏆 Puntos Totales: {puntos}</li> 
          <li>🟡 Monedas: {monedas}</li>
        </ul>

        <div className="progress-section">
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${progreso}%` }}
            >
              <span className="progress-text">{Math.floor(progreso)}%</span>
            </div>
          </div>
          <p className="remaining">
            {puntosEnEsteNivel} / {rangoDelNivel} XP (Faltan {puntosRestantes} para Nivel {nivel + 1})
          </p>
        </div>

        <div className="profile-actions">
          <button onClick={comprarMonedas}>+ Recargar Monedas</button>
        </div>

        {/* --- SECCIÓN DE HISTORIAL --- */}
        <div className="historial-section">
            <h3>📜 Historial de Movimientos</h3>
            
            <div className="filtros-historial">
                <button className={filtroTipo === 'todos' ? 'activo' : ''} onClick={() => setFiltroTipo('todos')}>Todos</button>
                <button className={filtroTipo === 'recarga' ? 'activo' : ''} onClick={() => setFiltroTipo('recarga')}>Recargas</button>
                <button className={filtroTipo === 'regalo' ? 'activo' : ''} onClick={() => setFiltroTipo('regalo')}>Regalos</button>
            </div>

            <div className="lista-transacciones">
                {historial.length === 0 ? (
                    <p className="vacio">No hay movimientos registrados.</p>
                ) : (
                    <ul>
                        {historial.map(tx => (
                            <li key={tx.id} className={`tx-item ${tx.tipo}`}>
                                <div className="tx-info">
                                    <span className="tx-tipo">
                                        {tx.tipo === 'recarga' ? '💰 Recarga' : '🎁 Regalo Enviado'}
                                    </span>
                                    <span className="tx-fecha">
                                        {new Date(tx.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="tx-monto">
                                    {tx.tipo === 'recarga' ? '+' : '-'}{tx.monto}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}

export default PerfilEspectador;
