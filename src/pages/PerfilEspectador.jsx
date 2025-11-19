import { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import "./PerfilEspectador.css";

function PerfilEspectador() {
  // 1. Obtén 'setUsuario' además de 'usuario'
  const { usuario, setUsuario } = useOutletContext(); 
  const navigate = useNavigate();

  // 2. Elimina los useState para nivel, puntos y monedas.
  //    Solo mantén el estado para la notificación, que SÍ es local.
  const [nivelSubido, setNivelSubido] = useState(false);

  // 3. Lee los valores directamente del 'usuario' del contexto
  const nivel = usuario.nivel || 1;
  const puntos = usuario.puntos || 0;
  const monedas = usuario.monedas || 0;

  // Sistema de niveles (calculado con los datos del contexto)
  const puntosPorNivel = nivel * 10;
  const progreso = Math.min((puntos / puntosPorNivel) * 100, 100);
  const puntosRestantes = Math.max(puntosPorNivel - puntos, 0);

  // 4. Modifica 'enviarMensaje' para que use 'setUsuario'
  const enviarMensaje = () => {
    const nuevosPuntos = puntos + 1;

    if (nuevosPuntos >= puntosPorNivel) {
      // Sube de nivel
      setUsuario({
        ...usuario,
        nivel: nivel + 1,
        puntos: nuevosPuntos - puntosPorNivel, // Reinicia los puntos
      });
      
      // Muestra la notificación local
      setNivelSubido(true);
      setTimeout(() => setNivelSubido(false), 2500);

    } else {
      // Solo suma puntos
      setUsuario({
        ...usuario,
        puntos: nuevosPuntos,
      });
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

        {/* 5. Asegúrate de que la UI también lee del contexto */}
        <ul className="profile-stats">
          <li>⭐ Nivel: {nivel}</li>
          <li>🏆 Puntos: {puntos}</li>
          <li>🟡 Monedas: {monedas}</li> {/* Esto arregla el bug de la imagen (1600) vs el código (100) */}
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

