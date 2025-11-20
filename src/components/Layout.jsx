import { Outlet, Link, useNavigate } from 'react-router-dom';
import './Layout.css';

function Layout({ usuario, setUsuario }) { 
  const navigate = useNavigate();

  const handleLogout = () => {
    const dbUsuarios = JSON.parse(localStorage.getItem("usuarios")) || {};

    if (usuario && dbUsuarios[usuario.nombre]) {
      const cuentaUsuario = dbUsuarios[usuario.nombre];

      if (usuario.rol === 'espectador') {
        cuentaUsuario.espectadorData = {
          monedas: usuario.monedas,
          nivel: usuario.nivel,
          puntos: usuario.puntos,
        };
      } else if (usuario.rol === 'streamer') {
        cuentaUsuario.streamerData = {
          estadisticasStreamer: usuario.estadisticasStreamer,
          nivelStreamer: usuario.nivelStreamer,
          regalos: usuario.regalos,
        };
      }

      dbUsuarios[usuario.nombre] = cuentaUsuario;
      localStorage.setItem("usuarios", JSON.stringify(dbUsuarios));
    }

    setUsuario(null); 
    navigate('/login');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <Link to="/" className="logo-a">
          Kick <span>2</span>
        </Link>

        <nav className="main-nav">
          {!usuario && (
            <>
              <Link to="/">Inicio</Link>
              <Link to="/nosotros">Nosotros</Link>
              <Link to="/terminos">Términos</Link>
            </>
          )}

          {usuario?.rol === "espectador" && (
            <>
              <Link to="/">Inicio</Link>
              <Link to="/perfil-espectador">Mi Perfil</Link>
              <Link to="/comprar-monedas">Tienda</Link>
              <Link to="/nosotros">Nosotros</Link>
              <Link to="/terminos">Términos</Link>
            </>
          )}

          {usuario?.rol === "streamer" && (
            <>
              <Link to="/">Inicio</Link>
              <Link to="/dashboard-streamer">Dashboard</Link>
              <Link to="/nosotros">Nosotros</Link>
              <Link to="/terminos">Términos</Link>
            </>
          )}
        </nav>

        <div className="header-right">
          {usuario ? (
            <>
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
