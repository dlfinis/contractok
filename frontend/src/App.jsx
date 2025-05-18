import React, { useState } from "react";
import SupportScreen from "./screens/SupportScreen";
import InitialAnimation from "./components/InitialAnimation";
import HomeScreen from "./components/HomeScreen";
import NavBar from "./components/NavBar";
import AnimatedBackground from "./components/AnimatedBackground";
import MiniKit from "@worldcoin/minikit-js";

export default function App() {
  const [showHome, setShowHome] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  useEffect(() => {
    const checkMiniKit = async () => {
      const isInstalled = MiniKit.isInstalled();
      if (isInstalled) {
        setIsLoading(false);
        console.log("checkMiniKit is loaded");
      } else {
        setTimeout(checkMiniKit, 500);
      }
    };

    checkMiniKit();
  }, []);

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
