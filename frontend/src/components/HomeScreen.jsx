import React, { useState } from "react";
import { motion } from "framer-motion";

export default function HomeScreen({ onCreate, onJoin }) {
  const [joinId, setJoinId] = useState("");

  return (
    <div className="home-main">
      <motion.div
        className="logo-title"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <div className="logo-circle">YA</div>
        <h2 style={{ fontFamily: "var(--main-font), 'Sora', Arial, sans-serif" }}>ContratoYa</h2>
        <p className="subtitle">Contratos instantáneos con garantía y arbitraje en WorldChain</p>
      </motion.div>

      <motion.button
        className="main-btn create-btn"
        whileTap={{ scale: 0.93 }}
        onClick={onCreate}
      >
        <span role="img" aria-label="Crear">📝</span> Crear Contrato
      </motion.button>

      <motion.div
        className="join-contract"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <input
          type="text"
          placeholder="ID o enlace de contrato"
          value={joinId}
          onChange={e => setJoinId(e.target.value)}
        />
        <motion.button
          className="main-btn join-btn"
          whileTap={{ scale: 0.93 }}
          onClick={() => onJoin(joinId)}
        >
          <span role="img" aria-label="Unirse">🔗</span> Unirse a Contrato
        </motion.button>
      </motion.div>
    </div>
  );
}
