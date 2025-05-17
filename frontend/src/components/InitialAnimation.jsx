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
            background: `radial-gradient(ellipse at 60% 30%, ${colors.yellow}33 0%, ${colors.cyan} 40%, ${colors.purple} 100%, ${colors.blue} 120%)`,
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
              background: `linear-gradient(135deg, ${colors.cyan} 60%, ${colors.yellow} 100%)`,
              borderRadius: "32% 68% 61% 39% / 42% 51% 49% 58%",
              width: 108,
              height: 108,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 64px 0 ${colors.cyan}55, 0 0 32px 0 ${colors.yellow}22`
            }}
          >
            <svg width="74" height="74" viewBox="0 0 74 74" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="37" cy="37" rx="34" ry="34" fill="#FFD700" fillOpacity="0.87"/>
              <text x="50%" y="54%" textAnchor="middle" fontFamily="Sora, var(--main-font)" fontWeight="800" fontSize="2.1rem" fill="#0A2E5A" dominantBaseline="middle">YA</text>
            </svg>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            style={{
              color: "#fff",
              fontWeight: 800,
              fontFamily: "var(--main-font), 'Sora', Arial, sans-serif",
              fontSize: 38,
              marginTop: 34,
              letterSpacing: 2.2,
              textShadow: `0 2px 16px ${colors.purple}77, 0 2px 12px ${colors.blue}99`
            }}
          >
            ContratoYa
          </motion.h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
