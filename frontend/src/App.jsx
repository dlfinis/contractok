import React, { useState } from "react";
import InitialAnimation from "./components/InitialAnimation";
import HomeScreen from "./components/HomeScreen";
import NavBar from "./components/NavBar";
import AnimatedBackground from "./components/AnimatedBackground";

export default function App() {
  const [showHome, setShowHome] = useState(false);

  return (
    <AnimatedBackground>
      <div className="app-bg">
        {!showHome && (
          <InitialAnimation onFinish={() => setShowHome(true)} />
        )}
        {showHome && (
          <>
            <HomeScreen onCreate={() => alert('Crear Contrato')} onJoin={id => alert('Unirse a ' + id)} />
            <NavBar />
          </>
        )}
      </div>
    </AnimatedBackground>
  );
}
