import React, { useState } from "react";
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function BackendHealth() {
  // Función para borrar los datos de autenticación World ID
  const clearWorldIDData = () => {
    localStorage.removeItem('wld_auth_hash');
    localStorage.removeItem('wld_nullifier_hash');
    localStorage.removeItem('wld_backend_authed');
    localStorage.removeItem('wld_merkle_root');
    localStorage.removeItem('wld_verification_level');
    localStorage.removeItem('wld_signal_hash');
    localStorage.removeItem('currentUser');
    alert('Datos de autenticación World ID borrados.');
    window.location.reload(); // Refresca la pantalla para limpiar cualquier estado
  };

  const [status, setStatus] = useState(null);
  const [userCount, setUserCount] = useState(null);
  const [worldcoinStatus, setWorldcoinStatus] = useState(null);
  const [createRes, setCreateRes] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkHealth = async () => {
    setLoading(true);
    setCreateRes(null);
    try {
      console.log('API_URL', API_URL);
      const res = await axios.get('/api/health')
      const data = await res.data;
      setStatus(data.status);
      setUserCount(data.userCount);
      setWorldcoinStatus(data.worldcoinStatus);
    } catch (e) {
      setStatus("error");
      setUserCount(null);
      setWorldcoinStatus(null);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 18 }}>
      <h2>Salud del Backend</h2>
      <button
        style={{ marginBottom: 16, background: '#FFD700', color: '#0A2E5A', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}
        onClick={clearWorldIDData}
      >
        Borrar datos de autenticación World ID
      </button>
      <div style={{padding: 24, border: "1.5px solid #b3cfff", borderRadius: 16, background: "#fff8e1", margin: 20, maxWidth: 420}}>
        <h3>Estado del Backend</h3>
        <button onClick={checkHealth} disabled={loading} style={{marginRight: 8}}>
          Probar /health
        </button>
        <div style={{marginTop: 16, fontFamily: 'monospace'}}>
          {status && (
            <div>
              <b>Status:</b> {status} <br/>
              <b>User count:</b> {userCount !== null ? userCount : "-"}<br/>
              <b>Worldcoin status:</b> {worldcoinStatus ? worldcoinStatus : "-"}
            </div>
          )}
          {createRes && (
            <div style={{marginTop: 12}}>
              <b>Respuesta creación:</b>
              <pre>{JSON.stringify(createRes, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
      <div style={{marginTop: 16, fontFamily: 'monospace'}}>
        {status && (
          <div>
            <b>Status:</b> {status} <br/>
            <b>User count:</b> {userCount !== null ? userCount : "-"}<br/>
            <b>Worldcoin status:</b> {worldcoinStatus ? worldcoinStatus : "-"}
          </div>
        )}
        {createRes && (
          <div style={{marginTop: 12}}>
            <b>Respuesta creación:</b>
            <pre>{JSON.stringify(createRes, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
