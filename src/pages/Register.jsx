import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState("espectador");
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    const nuevoUsuario = {
      nombre,
      rol,
      monedas: 500,
      nivel: 1,
      puntos: 0,
    };

    localStorage.setItem("userData", JSON.stringify(nuevoUsuario));
    navigate("/login");
  };

  return (
    <div className="register-container">
      <h2>Crear Cuenta</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <select value={rol} onChange={(e) => setRol(e.target.value)}>
          <option value="espectador">Espectador</option>
          <option value="streamer">Streamer</option>
        </select>
        <button type="submit">Registrar</button>
      </form>
    </div>
  );
}

export default Register;
