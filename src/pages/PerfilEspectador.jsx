import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import "./PerfilEspectador.css";

function PerfilEspectador() {
  const { usuario } = useOutletContext(); 
  const navigate = useNavigate();

  // Estados locales 
  const [nivel, setNivel] = useState(usuario.nivel || 1);
  const [puntos, setPuntos] = useState(usuario.puntos || 0);
  const [monedas, setMonedas] = useState(usuario.monedas || 100);
  const [nivelSubido, setNivelSubido] = useState(false);

  // Sistema de niveles
  const puntosPorNivel = nivel * 10; 
  const progreso = Math.min((puntos / puntosPorNivel) * 100, 100);
  const puntosRestantes = Math.max(puntosPorNivel - puntos, 0);

  // Función para simular envío de mensaje
  const enviarMensaje = () => {
    const nuevosPuntos = puntos + 1; 
    setPuntos(nuevosPuntos);

    if (nuevosPuntos >= puntosPorNivel) {
      setNivel(nivel + 1);
      setNivelSubido(true);

      setPuntos(nuevosPuntos - puntosPorNivel);

      setTimeout(() => setNivelSubido(false), 2500);
    }
  };


  const comprarMonedas = () => {
    navigate("/comprar-monedas");
  };

  return (
    <div className="perfil-container">
      {nivelSubido && (
        <div className="level-up-notification">
          🎉 ¡Subiste al nivel {nivel}! 🎉
        </div>
      )}

      <div className="profile-card">
        <div className="profile-avatar">
          <img
            src={usuario.avatarUrl || "/avatar.png"}
            alt="Avatar del espectador"
          />
        </div>

        <h2 className="profile-name">{usuario.nombre}</h2>

        <ul className="profile-stats">
          <li>⭐ Nivel: {nivel}</li>
          <li>🏆 Puntos: {puntos}</li>
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
            Te faltan {puntosRestantes} puntos para subir al nivel {nivel + 1}.
          </p>
        </div>

        <div className="profile-actions">
          <button onClick={enviarMensaje}>Enviar mensaje (+1 pts)</button>
          <button onClick={comprarMonedas}>Comprar Monedas</button>
        </div>
      </div>
    </div>
  );
}

export default PerfilEspectador;

