import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function Login({ setUsuarioGlobal }) { 
  const [credenciales, setCredenciales] = useState({
    usuario: "",
    contraseña: ""
  });
  const [rol, setRol] = useState("espectador");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const manejarCambio = (e) => {
    setCredenciales({
      ...credenciales,
      [e.target.name]: e.target.value
    });
  };

  const manejarInicioSesion = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError("");

    // Simular retraso de red
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const dbUsuarios = JSON.parse(localStorage.getItem("usuarios")) || {};
      
      // Buscar usuario por nombre o email
      const cuentaUsuario = Object.values(dbUsuarios).find(usuario => 
        (usuario.nombre === credenciales.usuario || usuario.email === credenciales.usuario) &&
        usuario.contraseña === credenciales.contraseña
      );

      if (!cuentaUsuario) {
        throw new Error("Credenciales incorrectas. Verifica tu usuario y contraseña.");
      }

      let datosSesion;

      if (rol === "espectador") {
        datosSesion = {
          ...cuentaUsuario.espectadorData,
          nombre: cuentaUsuario.nombre,
          avatarUrl: cuentaUsuario.avatarUrl,
          rol: "espectador",
        };
      } else { 
        datosSesion = {
          ...cuentaUsuario.streamerData,
          nombre: cuentaUsuario.nombre,
          avatarUrl: cuentaUsuario.avatarUrl,
          rol: "streamer",
        };
      }

      setUsuarioGlobal(datosSesion);
      navigate(rol === "streamer" ? "/dashboard-streamer" : "/perfil-espectador");
      
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="contenedor-auth">
      <div className="tarjeta-auth">
        <div className="encabezado-auth">
          <div className="logo">Kick<span>2</span></div>
          <h1>Iniciar Sesión</h1>
          <p>Bienvenido de vuelta a la comunidad</p>
        </div>

        <form onSubmit={manejarInicioSesion} className="formulario-auth">
          {error && <div className="mensaje-error">{error}</div>}
          
          <div className="grupo-input">
            <input
              type="text"
              name="usuario"
              placeholder="Usuario o Email"
              value={credenciales.usuario}
              onChange={manejarCambio}
              required
              disabled={cargando}
            />
          </div>

          <div className="grupo-input">
            <input
              type="password"
              name="contraseña"
              placeholder="Contraseña"
              value={credenciales.contraseña}
              onChange={manejarCambio}
              required
              disabled={cargando}
            />
          </div>

          <div className="selector-rol">
            <label>¿Cómo quieres entrar?</label>
            <div className="botones-rol">
              <button 
                type="button"
                className={`boton-rol ${rol === "espectador" ? "activo" : ""}`}
                onClick={() => setRol("espectador")}
                disabled={cargando}
              >
                👀 Espectador
              </button>
              <button 
                type="button"
                className={`boton-rol ${rol === "streamer" ? "activo" : ""}`}
                onClick={() => setRol("streamer")}
                disabled={cargando}
              >
                🎥 Streamer
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className={`boton-enviar ${cargando ? "cargando" : ""}`}
            disabled={cargando}
          >
            {cargando ? "Iniciando sesión..." : "Entrar a la plataforma"}
          </button>
        </form>

        <div className="pie-auth">
          <p>
            ¿No tienes cuenta? <Link to="/register" className="enlace-auth">Crear cuenta nueva</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

