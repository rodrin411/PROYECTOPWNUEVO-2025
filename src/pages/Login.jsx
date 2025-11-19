import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";



function Login() {
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState("espectador"); // El rol se elige AQUÍ
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleLogin = (e) => {

    e.preventDefault();
    const dbUsuarios = JSON.parse(localStorage.getItem("usuarios")) || {};
    const cuentaUsuario = dbUsuarios[nombre];
    if (!cuentaUsuario) {
      setError("Usuario no encontrado. ¿Te has registrado?");
      return;
    }

    let datosSesion;

    if (rol === "espectador") {

      datosSesion = {
        ...cuentaUsuario.espectadorData, // Carga monedas, puntos, nivel
        nombre: cuentaUsuario.nombre,
        avatarUrl: cuentaUsuario.avatarUrl,

        rol: "espectador",

      };

    } else { 

      datosSesion = {
        ...cuentaUsuario.streamerData, // Carga estadisticasStreamer
        nombre: cuentaUsuario.nombre,
        avatarUrl: cuentaUsuario.avatarUrl,
        rol: "streamer",

      };

    }



    // 4. Guardamos la SESIÓN ('userData')

    localStorage.setItem("userData", JSON.stringify(datosSesion));
    navigate(rol === "streamer" ? "/dashboard-streamer" : "/perfil-espectador");

  };

  return (


    <div className="login-container">

      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleLogin} className="login-form">
        {error && <p className="error-msg">{error}</p>}

        <input

          type="text"
          placeholder="Nombre de usuario"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required

        />

        <select value={rol} onChange={(e) => setRol(e.target.value)}>

          <option value="espectador">Entrar como Espectador</option>

          <option value="streamer">Entrar como Streamer</option>

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

