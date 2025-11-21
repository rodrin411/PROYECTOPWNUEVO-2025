import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

function Register() {
  const [datosFormulario, setDatosFormulario] = useState({
    nombre: "",
    email: "",
    contraseña: "",
    confirmarContraseña: "",
    fechaNacimiento: "",
    rol: "espectador"
  });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const manejarCambio = (e) => {
    setDatosFormulario({
      ...datosFormulario,
      [e.target.name]: e.target.value
    });
  };

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError("");

    if (datosFormulario.contraseña !== datosFormulario.confirmarContraseña) {
        setError("Las contraseñas no coinciden");
        setCargando(false);
        return;
    }

    try {
      // CONEXIÓN AL BACKEND
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: datosFormulario.nombre,
          email: datosFormulario.email,
          password: datosFormulario.contraseña,
          fechaNacimiento: datosFormulario.fechaNacimiento,
          rol: datosFormulario.rol
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al registrarse");
      }

      navigate('/login', { 
        state: { mensaje: "¡Cuenta creada! Inicia sesión." } 
      });

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
          <h1>Crear Cuenta</h1>
        </div>

        <form onSubmit={manejarRegistro} className="formulario-auth">
          {error && <div className="mensaje-error">{error}</div>}
          
          <div className="grupo-input">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre de usuario"
              value={datosFormulario.nombre}
              onChange={manejarCambio}
              required
            />
          </div>

          <div className="grupo-input">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={datosFormulario.email}
              onChange={manejarCambio}
              required
            />
          </div>

          {/* --- NUEVO: SELECTOR DE ROL --- */}
          <div className="grupo-input">
            <label style={{marginBottom: '5px', display:'block', color:'#ccc'}}>¿Qué quieres ser?</label>
            <select 
                name="rol" 
                value={datosFormulario.rol} 
                onChange={manejarCambio}
                className="input-select"
                style={{width: '100%', padding: '10px', borderRadius: '5px', background:'#2a2a2a', color:'white', border:'1px solid #444'}}
            >
                <option value="espectador">👀 Espectador (Ver y apoyar)</option>
                <option value="streamer">🎥 Streamer (Transmitir)</option>
            </select>
          </div>
          {/* ------------------------------ */}

          <div className="grupo-input">
            <input
              type="password"
              name="contraseña"
              placeholder="Contraseña"
              value={datosFormulario.contraseña}
              onChange={manejarCambio}
              required
            />
          </div>

          <div className="grupo-input">
            <input
              type="password"
              name="confirmarContraseña"
              placeholder="Confirmar contraseña"
              value={datosFormulario.confirmarContraseña}
              onChange={manejarCambio}
              required
            />
          </div>

          <div className="grupo-input">
            <input
              type="date"
              name="fechaNacimiento"
              value={datosFormulario.fechaNacimiento}
              onChange={manejarCambio}
              required
            />
          </div>

          <button 
            type="submit" 
            className="boton-enviar"
            disabled={cargando}
          >
            {cargando ? "Creando..." : "Registrarse"}
          </button>
        </form>

        <div className="pie-auth">
          <p>¿Ya tienes cuenta? <Link to="/login" className="enlace-auth">Iniciar sesión</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Register;