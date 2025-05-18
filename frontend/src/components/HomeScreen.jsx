import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import WorldIDLogin from "./WorldIDLogin";

export default function HomeScreen({ onCreate, onJoin }) {
  // Guardar el proof en el estado local y en localStorage
  const [authHash, setAuthHash] = useState(null);

  // Función para manejar autenticación exitosa
  const handleAuth = (hash) => {
    setAuthHash(hash);
    localStorage.setItem('wld_auth_hash', hash);
  };

  // Permitir cerrar sesión
  const handleLogout = () => {
    setAuthHash(null);
    localStorage.removeItem('wld_auth_hash');
  };

  // Al montar, limpiar el proof para forzar autenticación cada vez
  useEffect(() => {
    setAuthHash(null);
    localStorage.removeItem('wld_auth_hash');
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [joinId, setJoinId] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);
  const joinInputRef = React.useRef(null);

  return (
    <div className="home-main">
      <motion.div
        className="logo-title"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
          <img
            src="/images/logo.png"
            alt="Logo ContratosYa"
            style={{ width: 64, height: 64, objectFit: 'contain', display: 'block' }}
          />
        </div>
        <h2 style={{ fontFamily: "var(--logo-font), 'Sora', serif", fontWeight: 800 }}>ContratoYa</h2>
        <p className="subtitle" style={{ fontFamily: "var(--main-font), 'Quicksand', Arial, sans-serif" }}>Contratos seguros al momento</p>
      </motion.div>

      {/* Para cambiar de logo, comenta/descomenta la opción deseada arriba */}
      <div className="home-btn-group">
        <motion.button
          className="main-btn create-btn"
          whileTap={{ scale: 0.93 }}
          onClick={onCreate}
        >
          <span role="img" aria-label="Crear">📝</span>
          <span>Crear Contrato</span>
        </motion.button>
        <motion.button
          className="main-btn join-btn solid-join-btn"
          whileTap={{ scale: 0.93 }}
          onClick={() => {
            if (!showJoinInput) {
              setShowJoinInput(true);
              setTimeout(() => {
                if (joinInputRef.current) joinInputRef.current.focus();
              }, 120);
            } else if (joinId.trim()) {
              onJoin(joinId);
            }
          }}
        >
          <span role="img" aria-label="Unirse">🔗</span>
          <span>Unirse a Contrato</span>
        </motion.button>
      </div>

      {showJoinInput && (
        <motion.div
          className="join-contract"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <input
            id="joinId"
            type="text"
            placeholder="ID o enlace de contrato"
            value={joinId}
            onChange={e => setJoinId(e.target.value)}
            ref={joinInputRef}
            autoFocus
          />
        </motion.div>
      )}
      {/* World ID Auth section */}
      <div style={{ marginTop: 30 }}>
        {/* Siempre pide el proof al montar */}
        {!authHash && (
          <WorldIDLogin auto={true} onAuth={handleAuth} />
        )}
        {authHash && (
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <span style={{ color: '#00A878', fontWeight: 700, fontSize: 16 }}>
              ✅ Usuario autenticado con World ID
            </span>

          </div>
        )}
      </div>
    </div>
  );
}
