import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css"; 

function Register() {
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    const dbUsuarios = JSON.parse(localStorage.getItem("usuarios")) || {};

    if (dbUsuarios[nombre]) {
      setError("Este nombre de usuario ya está en uso.");
      return;
    }

    // Creamos una "cuenta" que contiene AMBOS perfiles
    const nuevaCuenta = {
      nombre: nombre,
      avatarUrl: "https://cdn-icons-png.flaticon.com/512/4140/4140048.png",
      
      // Perfil de espectador con sus datos
      espectadorData: {
        monedas: 500,
        nivel: 1,
        puntos: 0,
      },

      // Perfil de streamer con sus datos
      streamerData: {
        nivelStreamer: 1,
        estadisticasStreamer: {
          horasTotales: 0,
          sesiones: 0,
          picoEspectadores: 0,
          subsActuales: 0,
        },
        regalos: []
      },
    };

    // BD
    dbUsuarios[nombre] = nuevaCuenta;
    localStorage.setItem("usuarios", JSON.stringify(dbUsuarios));

    window.location.href = "/login";

    
  };

  return (

    <div className="register-container"> 
      <h2>Crear Cuenta</h2>
      <form onSubmit={handleRegister}>
        {error && <p className="error-msg">{error}</p>}
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        

        <button type="submit">Registrar</button>
      </form>
    </div>
  );
}

export default Register;
