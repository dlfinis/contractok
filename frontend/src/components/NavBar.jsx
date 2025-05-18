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
  // { 
  //   icon: <i className="bi bi-search"></i>,
  //   label: "Buscar", 
  //   href: "/buscar", 
  //   onClick: 'search' 
  // },
  { 
    icon: <i className="bi bi-file-earmark-text"></i>,
    label: "Contratos", 
    href: "/contracts", 
    onClick: 'contracts',
    className: 'nav-contracts'
  },
  { 
    icon: <i className="bi bi-person"></i>,
    label: "Perfil", 
    href: "/perfil", 
    onClick: 'profile' 
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

export default function NavBar({ onSupportClick, onSearch, onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check active states for different routes
  const isProfilePage = location.pathname.startsWith('/profile/');
  const isContractsPage = location.pathname.startsWith('/contracts');
  
  const handleNavClick = (item) => {
    if (item.onClick === 'support' && onSupportClick) {
      onSupportClick();
      return;
    }
    
    if (item.onClick === 'profile') {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const userId = currentUser?.id || 'current-user-id';
      navigate(`/profile/${userId}`);
    } else if (item.onClick === 'home') {
      navigate('/');
    } else if (item.onClick === 'contracts') {
      navigate('/contracts');
    } else if (item.onClick === 'search' && onSearch) {
      onSearch();
    } else if (item.href) {
      navigate(item.href);
    }
    
    if (onNavigate) {
      onNavigate(item.onClick || item.href);
    }
  };
  
  const isActive = (item) => {
    if (item.href === '/perfil') return isProfilePage;
    if (item.href === '/contracts') return isContractsPage;
    return location.pathname === item.href;
  };

  return (
    <nav style={styles.navbar}>
      {navItems.map((item) => {
        const active = isActive(item);
        
        return (
          <motion.div
            key={item.label}
            style={{
              ...styles.navbarItem,
              ...(active ? styles.activeItem : {})
            }}
            whileTap={{ scale: 0.88 }}
            onClick={() => handleNavClick(item)}
          >
            <div style={styles.navbarIcon}>
              {item.icon}
            </div>
            <span style={styles.navbarLabel}>{item.label}</span>
          </motion.div>
        );
      })}
    </nav>
  );
}
