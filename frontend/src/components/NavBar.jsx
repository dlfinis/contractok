import React from "react";
import { motion } from "framer-motion";

const navItems = [
  { icon: "👤", label: "Perfil", href: "#perfil" },
  { icon: "📜", label: "Historial", href: "#historial" },
  { icon: "💬", label: "Soporte", href: "#soporte" },
];

export default function NavBar() {
  return (
    <nav className="navbar">
      {navItems.map((item, i) => (
        <motion.a
          key={item.label}
          href={item.href}
          className="navbar-item"
          whileTap={{ scale: 0.88 }}
        >
          <span className="navbar-icon">{item.icon}</span>
          <span className="navbar-label">{item.label}</span>
        </motion.a>
      ))}
    </nav>
  );
}
