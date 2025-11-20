import { useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import "./PerfilEspectador.css";

function PerfilEspectador() {
  const { usuario, setUsuario } = useOutletContext(); 
  const navigate = useNavigate();
  
  if (!usuario) {
     return <div className="perfil-container">Cargando perfil...</div>;
  }

  const nivel = usuario.nivel || 1;
  const puntos = usuario.puntos || 0;
  const monedas = usuario.monedas || 0;

  
  // Fórmula: Sumatoria de (nivel * 10) -> 10 * n * (n+1) / 2
  const calcularTechoNivel = (n) => {
    return (10 * n * (n + 1)) / 2;
  };

  const techoNivelActual = calcularTechoNivel(nivel);       
  const techoNivelAnterior = calcularTechoNivel(nivel - 1); 

  // --- CÁLCULO DE LA BARRA ---
  const puntosEnEsteNivel = puntos - techoNivelAnterior;
  const rangoDelNivel = techoNivelActual - techoNivelAnterior;
  
  const progreso = Math.min((puntosEnEsteNivel / rangoDelNivel) * 100, 100);
  const puntosRestantes = Math.max(techoNivelActual - puntos, 0);

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
        <div className="profile-avatar">
          <img
            src={usuario.avatarUrl || "/avatar.png"}
            alt="Avatar"
          />
        </div>

        <h2 className="profile-name">{usuario.nombre}</h2>

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
          <button onClick={comprarMonedas}>Comprar Monedas</button>
        </div>
      </div>
    </div>
  );
}

export default PerfilEspectador;
