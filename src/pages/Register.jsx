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

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError("");

    try {
      validarFormulario();

      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 800));

      const dbUsuarios = JSON.parse(localStorage.getItem("usuarios")) || {};

      // Verificar si el usuario o email ya existen
      if (dbUsuarios[datosFormulario.nombre]) {
        throw new Error("Este nombre de usuario ya está en uso");
      }

      const emailExiste = Object.values(dbUsuarios).some(usuario => 
        usuario.email === datosFormulario.email
      );

      if (emailExiste) {
        throw new Error("Este email ya está registrado");
      }

      // Crear nueva cuenta
      const nuevaCuenta = {
        nombre: datosFormulario.nombre,
        email: datosFormulario.email,
        contraseña: datosFormulario.contraseña,
        fechaNacimiento: datosFormulario.fechaNacimiento,
        avatarUrl: "https://cdn-icons-png.flaticon.com/512/4140/4140048.png",
        fechaRegistro: new Date().toISOString(),
        
        espectadorData: {
          monedas: 500,
          nivel: 1,
          puntos: 0,
        },

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

      // Guardar en la base de datos
      dbUsuarios[datosFormulario.nombre] = nuevaCuenta;
      localStorage.setItem("usuarios", JSON.stringify(dbUsuarios));

      // Redirigir al login con mensaje de éxito
      navigate('/login', { 
        state: { 
          mensaje: "¡Cuenta creada exitosamente! Ya puedes iniciar sesión." 
        } 
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