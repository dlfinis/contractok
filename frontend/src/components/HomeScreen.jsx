import React, { useState } from "react";
import { motion } from "framer-motion";

export default function HomeScreen({ onCreate, onJoin }) {
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
        {/* Opciones de logo SVG para ContratoYa:
            1. Documento con firma (descomenta para usar)
            2. Apretón de manos minimalista (descomenta para usar)
            3. Bolígrafo firmando documento (descomenta para usar)
         */}
        {/* Opción 1: Documento con firma */}
        <div className="logo-circle" style={{background: 'linear-gradient(135deg, #FFD700 0%, #7F5AF0 100%)', position: 'relative'}}>
              <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="10" width="34" height="34" rx="7" fill="#fff" stroke="#0A2E5A" strokeWidth="2.5"/>
                <path d="M16 22H38M16 28H38" stroke="#7F5AF0" strokeWidth="2" strokeLinecap="round"/>
                <path d="M19 36C22 34 23.5 38 26 36C28.5 34 30 38 34 36" stroke="#00A878" strokeWidth="2" strokeLinecap="round" fill="none"/>
              </svg>
        </div>
        {/* Opción 2: Apretón de manos minimalista */}
        {/* <div className="logo-circle" style={{background: 'linear-gradient(135deg, #FFD700 0%, #7F5AF0 100%)', position: 'relative'}}>
          <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="27" cy="27" rx="24" ry="24" fill="#fff" fillOpacity="0.95"/>
            <path d="M16 32L24 40C25 41 27 41 28 40L38 30C39 29 39 27 38 26L32 20C31 19 29 19 28 20L18 30C17 31 17 32 18 33L22 37" stroke="#0A2E5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#fff"/>
          </svg>
        </div> */}
        {/* Opción 3: Bolígrafo firmando documento */}
        {/* <div className="logo-circle" style={{background: 'linear-gradient(135deg, #FFD700 0%, #7F5AF0 100%)', position: 'relative'}}>
          <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="10" width="34" height="34" rx="7" fill="#fff" stroke="#0A2E5A" strokeWidth="2.5"/>
            <path d="M16 22H38M16 28H38" stroke="#7F5AF0" strokeWidth="2" strokeLinecap="round"/>
            <path d="M36 38L44 44" stroke="#0A2E5A" strokeWidth="2" strokeLinecap="round"/>
            <path d="M42 42L40 40L44 44Z" fill="#FFD700" stroke="#0A2E5A" strokeWidth="1"/>
            <path d="M19 36C22 34 23.5 38 26 36C28.5 34 30 38 34 36" stroke="#00A878" strokeWidth="2" strokeLinecap="round" fill="none"/>
          </svg>
        </div> */}
        <h2 style={{ fontFamily: "var(--logo-font), 'Sora', serif", fontWeight: 800 }}>ContratoYa</h2>
        <p className="subtitle" style={{ fontFamily: "var(--main-font), 'Quicksand', Arial, sans-serif" }}>Contratos instantáneos con garantía y arbitraje</p>
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
          className="main-btn join-btn"
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
    </div>
  );
}
