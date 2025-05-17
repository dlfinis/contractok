import React, { useState } from "react";
import SupportScreen from "./screens/SupportScreen";
import InitialAnimation from "./components/InitialAnimation";
import HomeScreen from "./components/HomeScreen";
import NavBar from "./components/NavBar";
import AnimatedBackground from "./components/AnimatedBackground";
import { useMiniKit } from "@worldcoin/minikit-js/minikit-provider";

export default function App() {
  const [showHome, setShowHome] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  const { isInstalled } = useMiniKit();
  console.log('MiniKit is installed:', isInstalled)
  
  return (
    <AnimatedBackground>
      <div className="app-bg">
        {!showHome && (
          <InitialAnimation onFinish={() => setShowHome(true)} />
        )}
        {showHome && (
          <>
            <HomeScreen onCreate={() => alert('Crear Contrato')} onJoin={id => alert('Unirse a ' + id)} />
            <NavBar onSupport={() => setShowSupport(true)} />
            {showSupport && <SupportScreen onClose={() => setShowSupport(false)} />}
          </>
        )}
      </div>
    </AnimatedBackground>
  );
}
