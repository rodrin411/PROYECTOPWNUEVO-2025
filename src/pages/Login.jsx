import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState("espectador");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Creamos un objeto de usuario coherente con Layout.jsx
    const userData = {
      nombre,
      avatarUrl: "https://cdn-icons-png.flaticon.com/512/4140/4140048.png",
      nivel: 1,
      monedas: 500,
      puntos: 0,
      rol,
      estadisticasStreamer: {
        horasTotales: 0,
        sesiones: 0,
        picoEspectadores: 0,
        subsActuales: 0,
      },
    };

    // Guardamos en localStorage (Layout leerá esto)
    localStorage.setItem("userData", JSON.stringify(userData));

    // Redirigimos según el rol
    navigate(rol === "streamer" ? "/dashboard-streamer" : "/perfil-espectador");
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <select value={rol} onChange={(e) => setRol(e.target.value)}>
          <option value="espectador">Espectador</option>
          <option value="streamer">Streamer</option>
        </select>
        <button type="submit">Entrar</button>
      </form>

      <p className="login-text">
        ¿No tienes cuenta? <a href="/register">Crea una aquí</a>
      </p>
    </div>
  );
}

export default Login;
