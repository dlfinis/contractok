import React from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { 
    icon: <i className="bi bi-house-door"></i>,
    label: "Inicio", 
    href: "/", 
    onClick: 'home',
    className: 'nav-home'
  },
  { 
    icon: <i className="bi bi-search"></i>,
    label: "Buscar", 
    href: "/buscar", 
    onClick: 'search' 
  },
  { 
    icon: <i className="bi bi-person"></i>,
    label: "Perfil", 
    href: "/perfil", 
    onClick: 'profile' 
  },
  { 
    icon: <i className="bi bi-clock-history"></i>,
    label: "Historial", 
    href: "/historial" 
  },
  { 
    icon: <i className="bi bi-headset"></i>,
    label: "Soporte", 
    href: "#soporte", 
    onClick: 'support' 
  },
];

// Estilos en el componente
const styles = {
  navbar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    background: 'white',
    padding: '1px 0',
    boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
  },
  navbarItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textDecoration: 'none',
    color: '#6c757d',
    padding: '5px 10px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  },
  navbarIcon: {
    fontSize: '1.2rem',
    marginBottom: '4px',
  },
  navbarLabel: {
    fontSize: '0.7rem',
    marginTop: '2px',
  },
  activeItem: {
    color: '#0d6efd',
    backgroundColor: 'rgba(13, 110, 253, 0.1)',
  },
};

export default function NavBar({ onSupportClick, onSearch }) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeLink = location.pathname;
  
  // Check if current path is a profile page
  const isProfilePage = location.pathname.startsWith('/profile/');
  return (
    <nav style={styles.navbar}>
      {navItems.map((item) => {
        // Special handling for profile link to match any profile URL
        const isActive = item.href === '/perfil' 
          ? isProfilePage 
          : activeLink === item.href;
        const content = (
          <>
            <div style={styles.navbarIcon}>{item.icon}</div>
            <div style={styles.navbarLabel}>{item.label}</div>
          </>
        );

        if (item.onClick) {
          return (
            <motion.div
              key={item.label}
              style={{
                ...styles.navbarItem,
                ...(isActive ? styles.activeItem : {})
              }}
              whileTap={{ scale: 0.88 }}
              onClick={() => {
                if (item.onClick === 'support' && onSupportClick) {
                onSupportClick();
              } else if (item.onClick === 'search') {
                onSearch ? onSearch() : navigate('/buscar');
              } else if (item.onClick === 'profile') {
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                const userId = currentUser?.id || 'current-user-id';
                navigate(`/profile/${userId}`);
              } else if (item.onClick === 'home') {
                navigate('/');
              }
              }}
            >
              {content}
            </motion.div>
          );
        }

        return (
          <motion.div
            key={item.label}
            whileTap={{ scale: 0.88 }}
          >
            <Link
              to={item.href}
              style={{
                ...styles.navbarItem,
                ...(isActive ? styles.activeItem : {}),
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '8px 12px',
              }}
            >
              {content}
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
}
