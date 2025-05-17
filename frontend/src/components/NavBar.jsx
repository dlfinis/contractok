import React from "react";
import { motion } from "framer-motion";

const navItems = [
  { icon: "🐘", label: "Perfil", href: "#perfil" },
  { icon: "📜", label: "Historial", href: "#historial" },
  { icon: "💬", label: "Soporte", href: "#soporte", onClick: true },
];

export default function NavBar({ onSupport }) {
  return (
    <nav className="navbar">
      {navItems.map((item, i) => (
        <motion.a
          key={item.label}
          href={item.href}
          className="navbar-item"
          whileTap={{ scale: 0.88 }}
          onClick={item.onClick ? (e) => { e.preventDefault(); onSupport && onSupport(); } : undefined}
        >
          <span className="navbar-icon">{item.icon}</span>
          <span className="navbar-label">{item.label}</span>
        </motion.a>
      ))}
    </nav>
  );
}
