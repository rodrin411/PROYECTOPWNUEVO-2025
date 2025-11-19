import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import './Layout.css';

const initialUserData = {
  nombre: 'GamerPro123',
  avatarUrl: 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png',
  nivel: 15,
  monedas: 750,
  puntos: 2300,
  estadisticasStreamer: {
    horasTotales: 257,
    sesiones: 45,
    picoEspectadores: 128,
    subsActuales: 67
  }
};

function Layout() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(() => {
    const savedData = localStorage.getItem('userData');
    return savedData ? JSON.parse(savedData) : null;
  });

  useEffect(() => {
    // Este useEffect que guarda la SESIÓN ('userData') sigue igual.
    // Es perfecto, guarda el estado de la sesión activa.
    if (usuario) {
      localStorage.setItem('userData', JSON.stringify(usuario));
    } else {
      localStorage.removeItem('userData');
    }
  }, [usuario]);

  const handleLogout = () => {
    // 1. Cargar la "base de datos" principal
    const dbUsuarios = JSON.parse(localStorage.getItem("usuarios")) || {};

    // 2. Comprobar que hay un usuario en sesión y que existe en la BD
    if (usuario && dbUsuarios[usuario.nombre]) {
      
      // 3. Recuperamos la CUENTA COMPLETA
      const cuentaUsuario = dbUsuarios[usuario.nombre];

      // 4. Vemos el ROL de la sesión actual
      if (usuario.rol === 'espectador') {
        // 5. Guardamos el progreso de la sesión en el perfil de ESPECTADOR
        cuentaUsuario.espectadorData = {
          monedas: usuario.monedas,
          nivel: usuario.nivel,
          puntos: usuario.puntos,
        };

      } else if (usuario.rol === 'streamer') {
        // 5. Guardamos el progreso de la sesión en el perfil de STREAMER
        cuentaUsuario.streamerData = {
          estadisticasStreamer: usuario.estadisticasStreamer,
          nivelStreamer: usuario.nivelStreamer,
          regalos: usuario.regalos,
        };
      }

      // 6. Guardamos la CUENTA COMPLETA (actualizada) en la BD
      dbUsuarios[usuario.nombre] = cuentaUsuario;
      localStorage.setItem("usuarios", JSON.stringify(dbUsuarios));
    }

    // 7.  Borramos el estado de la sesión y limpiamos 'userData' (vía el useEffect)
    setUsuario(null); 
    navigate('/login');
  };

  
console.log("Easter Egg XD");

  return (
    <div className="app-container">
      <header className="app-header">
        {/* Logo */}
        <Link to="/" className="logo">
          Kick <span>2</span>
        </Link>

       {/* --- NAV --- */}
        <nav className="main-nav">

          {/* --- Invitado (no logueado) --- */}
          {!usuario && (
            <>
              <Link to="/">Inicio</Link>
              <Link to="/nosotros">Nosotros</Link>
              <Link to="/terminos">Términos</Link>
            </>
          )}

          {/* --- Espectador --- */}
          {usuario?.rol === "espectador" && (
            <>
              <Link to="/">Inicio</Link>
              <Link to="/perfil-espectador">Mi Perfil</Link>
              <Link to="/comprar-monedas">Tienda</Link>
              <Link to="/nosotros">Nosotros</Link>
              <Link to="/terminos">Términos</Link>
            </>
          )}

          {/* --- Streamer --- */}
          {usuario?.rol === "streamer" && (
            <>
              <Link to="/">Inicio</Link>
              <Link to="/dashboard-streamer">Dashboard</Link>
              <Link to="/nosotros">Nosotros</Link>
              <Link to="/terminos">Términos</Link>
            </>
          )}
        </nav>

        {/* Panel derecho del header */}
        <div className="header-right">
          {usuario ? (
            <>
              {/*
                Solo mostramos el saldo si el rol es 'espectador'
              */}
              {usuario.rol === 'espectador' && (
                <div className="saldo-display">
                  <div className="coin-icon"></div>
                  <span>{usuario.monedas}</span>
                  <button
                    className="add-coins-btn"
                    onClick={() => navigate('/comprar-monedas')}
                    title="Comprar monedas"
                  >
                    +
                  </button>
                </div>
              )}

              {/* El botón de logout se muestra para ambos roles */}
              <button className="logout-btn" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-btn">Iniciar sesión</Link>
              <Link to="/register" className="register-btn">Crear cuenta</Link>
            </div>
          )}
        </div>
      </header>

      <main className="main-content">
        <Outlet context={{ usuario, setUsuario }} />
      </main>

      <footer className="app-footer">
        <p>© 2025 Kick 2</p>
      </footer>
    </div>
  );
}

export default Layout;
