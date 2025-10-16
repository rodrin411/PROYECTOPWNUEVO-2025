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
    if (usuario) {
      localStorage.setItem('userData', JSON.stringify(usuario));
    } else {
      localStorage.removeItem('userData');
    }
  }, [usuario]);

  const handleLogout = () => {
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
