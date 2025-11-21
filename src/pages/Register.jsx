import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

function Register() {
  const [datosFormulario, setDatosFormulario] = useState({
    nombre: "",
    email: "",
    contraseña: "",
    confirmarContraseña: "",
    fechaNacimiento: ""
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

  const validarFormulario = () => {
    if (datosFormulario.contraseña.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }
    
    if (datosFormulario.contraseña !== datosFormulario.confirmarContraseña) {
      throw new Error("Las contraseñas no coinciden");
    }

    if (!datosFormulario.email.includes('@')) {
      throw new Error("Por favor ingresa un email válido");
    }

    // Calcular edad mínima (13 años)
    const fechaNacimiento = new Date(datosFormulario.fechaNacimiento);
    const hoy = new Date();
    const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    
    if (edad < 13) {
      throw new Error("Debes tener al menos 13 años para registrarte");
    }
  };

  // ... (resto de tus imports y estados igual)

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError("");

    try {
      validarFormulario(); // Tu función de validación actual

      // --- CAMBIO AQUÍ: CONEXIÓN AL BACKEND ---
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: datosFormulario.nombre,
          email: datosFormulario.email,
          password: datosFormulario.contraseña, // En el backend lo llamamos 'password'
          fechaNacimiento: datosFormulario.fechaNacimiento,
          rol: "espectador" // Por defecto
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al registrarse");
      }

      // ÉXITO
      navigate('/login', { 
        state: { mensaje: "¡Cuenta creada! Inicia sesión." } 
      });
      // -----------------------------------------

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
          <h1>Unirse a la Comunidad</h1>
          <p>Crea tu cuenta y comienza tu aventura streaming</p>
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
              disabled={cargando}
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
              disabled={cargando}
            />
          </div>

          <div className="grupo-input">
            <input
              type="password"
              name="contraseña"
              placeholder="Contraseña"
              value={datosFormulario.contraseña}
              onChange={manejarCambio}
              required
              disabled={cargando}
            />
            <div className="pista-contraseña">Mínimo 6 caracteres</div>
          </div>

          <div className="grupo-input">
            <input
              type="password"
              name="confirmarContraseña"
              placeholder="Confirmar contraseña"
              value={datosFormulario.confirmarContraseña}
              onChange={manejarCambio}
              required
              disabled={cargando}
            />
          </div>

          <div className="grupo-input">
            <label htmlFor="fechaNacimiento" className="etiqueta-input">
              Fecha de nacimiento
            </label>
            <input
              type="date"
              id="fechaNacimiento"
              name="fechaNacimiento"
              value={datosFormulario.fechaNacimiento}
              onChange={manejarCambio}
              required
              disabled={cargando}
            />
          </div>

          <div className="acuerdo-terminos">
            <p>
              Al registrarte, aceptas nuestros{' '}
              <a href="/terminos" className="enlace-terminos">Términos de Servicio.</a>{' '}
            </p>
          </div>

          <button 
            type="submit" 
            className={`boton-enviar ${cargando ? "cargando" : ""}`}
            disabled={cargando}
          >
            {cargando ? "Creando cuenta..." : "Crear mi cuenta"}
          </button>
        </form>

        <div className="pie-auth">
          <p>
            ¿Ya tienes cuenta? <Link to="/login" className="enlace-auth">Iniciar sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;