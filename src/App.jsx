import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import PerfilEspectador from './pages/PerfilEspectador';
import DashboardStreamer from './pages/DashboardStreamer';
import ComprarMonedas from './pages/ComprarMonedas';
import Nosotros from './pages/Nosotros';
import Terminos from './pages/Terminos';
import VistaTransmision from './pages/VistaTransmision';
import StreamManager from './pages/StreamManager';
import "./pages/PaginaPrincipal.css";



function Home() {

  const navigate = useNavigate();

  // Datos ficticios de streams
  const streams = [
    { id: 1, titulo: "Jugando Fortnite con la comunidad", streamer: "GamerPro", img: "https://picsum.photos/300/200?random=1" },
    { id: 2, titulo: "Música en vivo 🎸", streamer: "RockLive", img: "https://picsum.photos/300/200?random=2" },
    { id: 3, titulo: "Programando un juego en Unity", streamer: "DevMaster", img: "https://picsum.photos/300/200?random=3" },
    { id: 4, titulo: "Cocinando recetas fáciles 🍳", streamer: "ChefLoco", img: "https://picsum.photos/300/200?random=4" },
    { id: 5, titulo: "Charla sobre cine 🎬", streamer: "CinemaTalks", img: "https://picsum.photos/300/200?random=5" },
    { id: 6, titulo: "Retos en Minecraft 🔥", streamer: "BlockHero", img: "https://picsum.photos/300/200?random=6" },
  ];

  const sidebarStreamers = ["GamerPro", "RockLive", "DevMaster", "ChefLoco", "CinemaTalks", "BlockHero"];

  const irAlStream = (stream) => {
    // Navegamos a /stream/1 (por ejemplo) y le pasamos todo el objeto 'stream'
    navigate(`/stream/${stream.id}`, { state: stream });
  }; 
    
  return (
    <div className="principal-container">
      <aside className="sidebar">
        <h3 style={{color: '#00ffcc'}}>Canales</h3>
        <ul>
          {sidebarStreamers.map((s, index) => (
            <li key={index}>{s}</li>
          ))}
        </ul>
      </aside>

      {/* ---- CONTENIDO PRINCIPAL ---- */}
      <section className="streams-section">
        <h2>Streams en vivo</h2>
        <div className="streams-grid">
          {streams.map((stream) => (
            <div 
            key={stream.id} 
            className="stream-card"
            onClick={() => irAlStream(stream)} 
            style={{cursor: 'pointer'}} 
            >
              <img src={stream.img} alt={stream.titulo} />
              <h4>{stream.titulo}</h4>
              <p>{stream.streamer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function App() {
  const userData = JSON.parse(localStorage.getItem('userData'));

  return (
    <Router>
      <Routes>
        {/* Páginas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Layout con Outlet */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route
            path="/perfil-espectador"
            element={userData ? <PerfilEspectador /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard-streamer"
            element={userData ? <DashboardStreamer /> : <Navigate to="/login" />}
          />
          <Route
            path="/comprar-monedas"
            element={userData ? <ComprarMonedas /> : <Navigate to="/login" />}
          />
          <Route
            path="/stream-manager"
            element={userData ? <StreamManager /> : <Navigate to="/login" />}
          />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/terminos" element={<Terminos />} />
          <Route path="/stream/:id" element={<VistaTransmision />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
