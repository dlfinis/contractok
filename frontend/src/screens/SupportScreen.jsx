import React from "react";
import BackendHealth from "../components/BackendHealth";
import "./supportScreen.css";

export default function SupportScreen({ onClose }) {
  return (
    <div className="support-screen-bg">
      <div className="support-screen-card">
        <button className="support-close-btn" onClick={onClose}>✕</button>
        <h2>Soporte y Estado de Servicios</h2>
        <p style={{marginBottom: 18, color: '#555'}}>Aquí puedes revisar el estado de la base de datos, servicios externos y crear un usuario de prueba.</p>
        <BackendHealth />
      </div>
    </div>
  );
}
