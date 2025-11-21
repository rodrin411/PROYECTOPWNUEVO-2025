import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function Login({ setUsuarioGlobal }) { 
  const [credenciales, setCredenciales] = useState({
    usuario: "",
    contraseña: ""
  });
  
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

    try {
      // 1. Petición al Backend
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credenciales.usuario, 
          password: credenciales.contraseña
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Credenciales incorrectas.");
      }

      // 2. Guardar sesión
      localStorage.setItem('usuario_sesion', JSON.stringify(data.usuario));
      setUsuarioGlobal(data.usuario);

      // 3. REDIRECCIÓN AUTOMÁTICA SEGÚN EL ROL DE LA BD
      if (data.usuario.rol === 'streamer') {
        navigate("/dashboard-streamer");
      } else {
        navigate("/perfil-espectador");
      }
      
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

          {/* a */}
          {/* a */}

          <button 
            type="submit" 
            className={`boton-enviar ${cargando ? "cargando" : ""}`}
            disabled={cargando}
          >
            {cargando ? "Verificando..." : "Entrar a la plataforma"}
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
