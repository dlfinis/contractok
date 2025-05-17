import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const colors = {
  blue: "#0A2E5A",
  green: "#00A878",
  yellow: "#FFD700",
  purple: "#7F5AF0",
  cyan: "#16E6D5"
};

export default function InitialAnimation({ onFinish }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!show && onFinish) onFinish();
  }, [show, onFinish]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="initial-animation"
          initial={{ opacity: 0, filter: "blur(16px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(16px)" }}
          transition={{ duration: 1.2 }}
          style={{
            background: `linear-gradient(120deg, #0A2E5A 0%, #7F5AF0 40%, #FFD700 70%, #E75480 100%)`,
            backgroundSize: '200% 200%',
            animation: 'gradientMove 4.5s ease-in-out infinite',
            width: "100vw",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 1000,
            fontFamily: "var(--main-font), 'Sora', Arial, sans-serif"
          }}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1.08, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 20, delay: 0.4 }}
            style={{
              background: `linear-gradient(135deg, #FFD700 0%, #7F5AF0 100%)`,
              borderRadius: "32% 68% 61% 39% / 42% 51% 49% 58%",
              width: 120,
              height: 120,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 64px 0 #FFD70088, 0 0 32px 0 #7F5AF033`
            }}
          >
            {/* Icono de apretón de manos SVG */}
            <div className="logo-circle" style={{background: 'linear-gradient(135deg, #FFD700 0%, #7F5AF0 100%)', position: 'relative'}}>
              <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="10" width="34" height="34" rx="7" fill="#fff" stroke="#0A2E5A" strokeWidth="2.5"/>
                <path d="M16 22H38M16 28H38" stroke="#7F5AF0" strokeWidth="2" strokeLinecap="round"/>
                <path d="M19 36C22 34 23.5 38 26 36C28.5 34 30 38 34 36" stroke="#00A878" strokeWidth="2" strokeLinecap="round" fill="none"/>
              </svg>
          </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            style={{
              color: "#fff",
              fontWeight: 800,
              fontFamily: "var(--logo-font), 'Sora', Arial, sans-serif",
              fontSize: 44,
              marginTop: 38,
              letterSpacing: 2.5,
              textShadow: `0 2px 18px #7F5AF077, 0 2px 10px #0A2E5A99`
            }}
          >
            ContratoYa
          </motion.h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
