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
            background: `linear-gradient(120deg, #0A2E5A 0%, #7F5AF0 40%,rgb(70, 58, 98) 70%,rgb(62, 13, 239) 100%)`,
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
              background: 'none',
              width: 130,
              height: 130,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: 'none',
              borderRadius: 0
            }}
          >
            <img
              src="/images/logo.png"
              alt="Logo ContratoYa"
              style={{ width: 100, height: 100, objectFit: 'contain', display: 'block' }}
            />
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
            ContratosYa
          </motion.h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
