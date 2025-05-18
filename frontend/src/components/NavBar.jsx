import React from "react";
import { motion } from "framer-motion";

const navItems = [
  { icon: "🔍", label: "Buscar", href: "#buscar", onClick: 'search' },
  { icon: "🐘", label: "Perfil", href: "#perfil" },
  { icon: "📜", label: "Historial", href: "#historial" },
  { icon: "💬", label: "Soporte", href: "#soporte", onClick: 'support' },
];

export default function NavBar({ onSupport, onSearch }) {
  return (
    <nav className="navbar">
      {navItems.map((item, i) => (
        <motion.a
          key={item.label}
          href={item.href}
          className="navbar-item"
          whileTap={{ scale: 0.88 }}
          onClick={(e) => {
            if (item.onClick) {
              e.preventDefault();
              if (item.onClick === 'support' && onSupport) onSupport();
              if (item.onClick === 'search' && onSearch) onSearch();
            }
          }}
        >
          <span className="navbar-icon">{item.icon}</span>
          <span className="navbar-label">{item.label}</span>
        </motion.a>
      ))}
    </nav>
  );
}
