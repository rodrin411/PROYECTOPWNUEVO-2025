import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { jsPDF } from "jspdf";
import './ComprarMonedas.css';

function ComprarMonedas() {
  const { usuario, setUsuario } = useOutletContext();
  
  const [paqueteSeleccionado, setPaqueteSeleccionado] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [transaccion, setTransaccion] = useState(null);
  
  // Estado simple para los inputs
  const [datosTarjeta, setDatosTarjeta] = useState({ numero: '', nombre: '', exp: '', cvv: '' });

  const iniciarCompra = (cantidad, precio) => {
    setPaqueteSeleccionado({ cantidad, precio });
    setDatosTarjeta({ numero: '', nombre: '', exp: '', cvv: '' });
  };

  const handleInputChange = (e) => {
    setDatosTarjeta({ ...datosTarjeta, [e.target.name]: e.target.value });
  };

  // ... imports y estados ...

  const procesarPago = async (e) => {
    e.preventDefault();
    setProcesando(true);

    try {
      // LLAMADA AL BACKEND
      const response = await fetch('http://localhost:3000/api/comprar-monedas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId: usuario.id,
          monto: paqueteSeleccionado.cantidad,
          precio: paqueteSeleccionado.precio
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      // ÉXITO: Actualizar estado global
      const usuarioActualizado = { ...usuario, monedas: data.nuevoSaldo };
      setUsuario(usuarioActualizado);
      // Guardar en localStorage para persistencia
      localStorage.setItem('usuario_sesion', JSON.stringify(usuarioActualizado));

      // Generar recibo (Tu código actual del PDF)
      const idTx = "TXN" + Date.now(); // O usa el ID que devuelve el backend si quieres
      const fecha = new Date().toLocaleString();

      setTransaccion({
        id: idTx,
        fecha: fecha,
        monto: paqueteSeleccionado.cantidad,
        precio: paqueteSeleccionado.precio
      });

      setProcesando(false);
      crearEfectoMonedas(15);

    } catch (err) {
      alert("Error en el pago: " + err.message);
      setProcesando(false);
    }
  };

  // ... resto del componente (render) ...

  const cerrarModal = () => {
    setPaqueteSeleccionado(null);
    setTransaccion(null);
  };

  const descargarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Kick 2 - Comprobante de Pago", 20, 20);
    doc.setFontSize(12);
    doc.text("------------------------------------------------", 20, 30);
    doc.text(`ID Transacción: ${transaccion.id}`, 20, 40);
    doc.text(`Fecha: ${transaccion.fecha}`, 20, 50);
    doc.text(`Usuario: ${usuario.nombre}`, 20, 60);
    doc.text("------------------------------------------------", 20, 70);
    doc.text(`Producto: Recarga de ${transaccion.monto} Monedas`, 20, 80);
    doc.text(`Total Pagado: $${transaccion.precio}`, 20, 90);
    doc.text("------------------------------------------------", 20, 100);
    doc.text("¡Gracias por tu compra!", 20, 115);
    doc.save(`recibo_${transaccion.id}.pdf`);
  };

  const crearEfectoMonedas = (cantidad = 10) => {
    for (let i = 0; i < cantidad; i++) {
      const moneda = document.createElement('div');
      moneda.classList.add('moneda');
      moneda.style.left = Math.random() * 100 + 'vw';
      moneda.style.animationDuration = 2 + Math.random() * 2 + 's';
      document.body.appendChild(moneda);
      setTimeout(() => moneda.remove(), 4000);
    }
  };

  return (
    <div className="tienda-container">
      <h2>Tienda de Monedas</h2>
      <p>Elige un paquete para recargar tu saldo.</p>

      {/* --- AQUÍ ESTÁ EL DISEÑO RESTAURADO (3 TARJETAS) --- */}
      <div className="paquetes-container">
        
        {/* Tarjeta 1 */}
        <div className="paquete-card">
          <h3>Paquete Básico</h3>
          <div className="moneda-tienda">
            <div className="coin-icon"></div>
            <span>100</span>
          </div>
          <p className="precio">$4.99</p>
          <button onClick={() => iniciarCompra(100, 4.99)}>Comprar</button>
        </div>

        {/* Tarjeta 2 (Popular) */}
        <div className="paquete-card popular">
          <div className="badge-popular">MÁS VENDIDO</div>
          <h3>Paquete Popular</h3>
          <div className="moneda-tienda">
            <div className="coin-icon"></div>
            <span>500</span>
          </div>
          <p className="precio">$19.99</p>
          <button onClick={() => iniciarCompra(500, 19.99)}>Comprar</button>
        </div>

        {/* Tarjeta 3 */}
        <div className="paquete-card">
          <h3>Paquete Premium</h3>
          <div className="moneda-tienda">
            <div className="coin-icon"></div>
            <span>1000</span>
          </div>
          <p className="precio">$34.99</p>
          <button onClick={() => iniciarCompra(1000, 34.99)}>Comprar</button>
        </div>
      </div>

      {/* --- MODAL DE PAGO (CON VALIDACIÓN AUTOMÁTICA) --- */}
      {paqueteSeleccionado && !transaccion && (
        <div className="modal-overlay">
          <div className="modal-content">
            {!procesando ? (
              <>
                <div className="modal-header">
                  <h3>Pagar ${paqueteSeleccionado.precio}</h3>
                  <button className="close-btn" onClick={cerrarModal}>×</button>
                </div>
                
                <div className="modal-body">
                  <p className="resumen-compra">
                    Recargando <strong>{paqueteSeleccionado.cantidad} Monedas</strong>
                  </p>

                  <form onSubmit={procesarPago} className="form-tarjeta">
                    
                    <div className="input-group">
                      <label>Número de Tarjeta</label>
                      <input 
                        type="text" 
                        name="numero"
                        placeholder="16 dígitos sin espacios" 
                        value={datosTarjeta.numero}
                        onChange={handleInputChange}
                        minLength="16"
                        maxLength="16"
                        pattern="\d*" 
                        title="Debe contener exactamente 16 números"
                        required 
                      />
                    </div>

                    <div className="input-group">
                      <label>Titular de la tarjeta</label>
                      <input 
                        type="text" 
                        name="nombre"
                        placeholder="Nombre completo" 
                        value={datosTarjeta.nombre}
                        onChange={handleInputChange}
                        minLength="3"
                        required 
                      />
                    </div>

                    <div className="fila-doble">
                       <div className="input-group">
                        <label>Exp (MM/YY)</label>
                        <input 
                          type="text" 
                          name="exp"
                          placeholder="Ej: 10/28" 
                          maxLength="5" 
                          value={datosTarjeta.exp}
                          onChange={handleInputChange}
                          pattern="\d{2}/\d{2}"
                          title="Formato requerido: MM/YY"
                          required 
                        />
                      </div>
                      <div className="input-group">
                        <label>CVV</label>
                        <input 
                          type="password"
                          name="cvv"
                          placeholder="123" 
                          maxLength="3"
                          minLength="3"
                          pattern="\d*"
                          value={datosTarjeta.cvv}
                          onChange={handleInputChange}
                          required 
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn-pagar">
                      Confirmar Pago
                    </button>

                    <div className="iconos-tarjetas">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/1200px-Visa_Inc._logo.svg.png" alt="Visa" className="card-logo" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1200px-Mastercard-logo.svg.png" alt="Mastercard" className="card-logo" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/1200px-American_Express_logo_%282018%29.svg.png" alt="American Express" className="card-logo amex" />
                    </div>

                  </form>
                </div>
              </>
            ) : (
              <div className="vista-carga">
                <div className="spinner"></div>
                <p>Procesando pago seguro...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL DE ÉXITO --- */}
      {transaccion && (
        <div className="modal-overlay">
          <div className="modal-content exito">
             <div className="icono-check">✔</div>
             <h3>¡Recarga Exitosa!</h3>
             
             <div className="detalles-recibo">
                <p><strong>ID:</strong> {transaccion.id}</p>
                <p><strong>Monto:</strong> {transaccion.monto} Monedas</p>
                <p><strong>Fecha:</strong> {transaccion.fecha}</p>
             </div>

             <div className="acciones-exito">
               <button className="btn-descargar" onClick={descargarPDF}>
                 📄 Descargar Recibo
               </button>
               <button className="btn-cerrar" onClick={cerrarModal}>
                 Cerrar
               </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ComprarMonedas;