import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import './ComprarMonedas.css';

function ComprarMonedas() {
  const { usuario, setUsuario } = useOutletContext();
  const [mensajeExito, setMensajeExito] = useState('');

  const handleCompra = (cantidad) => {
    setUsuario({ ...usuario, monedas: usuario.monedas + cantidad });
    setMensajeExito(`¡Felicidades! Has comprado ${cantidad} monedas.`);

    // Crear efecto de monedas cayendo
    const crearMonedas = (cantidad = 10) => {
      for (let i = 0; i < cantidad; i++) {
        const moneda = document.createElement('div');
        moneda.classList.add('moneda');
        moneda.style.left = Math.random() * 100 + 'vw';
        moneda.style.animationDuration = 2 + Math.random() * 2 + 's';
        document.body.appendChild(moneda);

        setTimeout(() => moneda.remove(), 4000);
      }
    };

    crearMonedas(15);
    setTimeout(() => setMensajeExito(''), 3000);
  };

  return (
    <div className="tienda-container">
      <h2>Tienda de Monedas</h2>
      <p>Elige un paquete para recargar tu saldo.</p>

      {mensajeExito && <div className="mensaje-exito">{mensajeExito}</div>}

      <div className="paquetes-container">
        <div className="paquete-card">
          <h3>Paquete Básico</h3>
          <div className="moneda-tienda">
            <div className="coin-icon"></div>
            <span>100</span>
          </div>
          <button onClick={() => handleCompra(100)}>Comprar</button>
        </div>

        <div className="paquete-card">
          <h3>Paquete Popular</h3>
          <div className="moneda-tienda">
            <div className="coin-icon"></div>
            <span>500</span>
          </div>
          <button onClick={() => handleCompra(500)}>Comprar</button>
        </div>

        <div className="paquete-card">
          <h3>Paquete Premium</h3>
          <div className="moneda-tienda">
            <div className="coin-icon"></div>
            <span>1000</span>
          </div>
          <button onClick={() => handleCompra(1000)}>Comprar</button>
        </div>
      </div>
    </div>
  );
}

export default ComprarMonedas;
