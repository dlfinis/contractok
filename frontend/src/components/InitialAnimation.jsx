import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Global } from '@emotion/react';
import { colors } from '../theme/colors';

const animationStyles = {
  container: {
    background: `linear-gradient(-45deg, ${colors.darkBlue}, ${colors.teal}, ${colors.mint}, ${colors.white})`,
    backgroundSize: '400% 400%',
    animation: 'gradient 20s ease infinite',
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 1000,
    fontFamily: "var(--main-font), 'Sora', Arial, sans-serif",
    overflow: 'hidden',
  },
  logoContainer: {
    background: 'rgba(255, 255, 255, 0.1)',
    width: 140,
    height: 140,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '30%',
    boxShadow: `0 0 30px ${colors.teal}40`,
    backdropFilter: 'blur(5px)',
    border: `1px solid ${colors.teal}30`,
  },
  logo: {
    width: 100,
    height: 100,
    objectFit: 'contain',
    display: 'block',
  },
  title: {
    color: colors.white,
    fontWeight: 800,
    fontFamily: "var(--logo-font), 'Sora', Arial, sans-serif",
    fontSize: 44,
    marginTop: 30,
    letterSpacing: 2.5,
    textShadow: `0 0 10px ${colors.white}, 0 0 20px ${colors.teal}`,
    position: 'relative',
    padding: '10px 30px',
    borderRadius: '50px',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(5px)',
    border: `1px solid ${colors.teal}20`,
  },
};

export default function InitialAnimation({ onAnimationComplete }) {
  const [show, setShow] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Inicializar la animación
  useEffect(() => {
    setShow(true);
    setIsVisible(true);
    sessionStorage.setItem('hasSeenAnimation', 'true');
  }, []);

  // Manejar el final de la animación
  const handleAnimationEnd = useCallback(() => {
    setShow(false);
    onAnimationComplete?.();
  }, [onAnimationComplete]);

  // Estilos de animación
  const logoAnimation = {
    initial: { scale: 0.7, opacity: 0, rotate: -15 },
    animate: { 
      scale: [0.6, 1.1, 1],
      rotate: [-20, 10, 0],
      opacity: 1,
    },
    transition: { 
      duration: 5,
      ease: [0.16, 1, 0.3, 1],
      scale: { duration: 4 },
      rotate: { duration: 4.5 },
    },
  };

  const titleAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      textShadow: [
        `0 0 10px ${colors.white}, 0 0 20px ${colors.teal}`,
        `0 0 15px ${colors.white}, 0 0 25px ${colors.teal}`,
        `0 0 10px ${colors.white}, 0 0 20px ${colors.teal}`,
      ],
    },
    transition: { 
      delay: 0.8, 
      duration: 1,
      textShadow: {
        duration: 3,
        repeat: Infinity,
        repeatType: 'reverse',
      },
    },
  };

  if (!isVisible) return null;

  return (
    <>
      <Global
        styles={{
          '@keyframes gradient': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
          },
        }}
      />
      
      <AnimatePresence>
        {show && (
          <motion.div
            className="initial-animation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            onAnimationComplete={handleAnimationEnd}
            style={animationStyles.container}
          >
            <motion.div
              {...logoAnimation}
              style={animationStyles.logoContainer}
            >
              <img
                src="/images/logo.png"
                alt="Logo ContratosYa"
                style={animationStyles.logo}
              />
            </motion.div>
            
            <motion.h1
              {...titleAnimation}
              style={animationStyles.title}
            >
              ContratosYa
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
