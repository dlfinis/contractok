import React, { useState } from "react";
import SupportScreen from "./screens/SupportScreen";
import ContractCreateScreen from "./screens/ContractCreateScreen";
import ContractLinkScreen from "./screens/ContractLinkScreen";
import InitialAnimation from "./components/InitialAnimation";
import HomeScreen from "./components/HomeScreen";
import NavBar from "./components/NavBar";
import AnimatedBackground from "./components/AnimatedBackground";

export default function App() {
  const [showHome, setShowHome] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [screen, setScreen] = useState('home'); // home | create | link
  const [joinId, setJoinId] = useState("");

  const handleCreate = () => setScreen('create');
  const handleJoin = (id) => {
    setJoinId(id);
    setScreen('link');
  };
  const handleBack = () => setScreen('home');

  return (
    <AnimatedBackground>
      <div className="app-bg">
        {!showHome && (
          <InitialAnimation onFinish={() => setShowHome(true)} />
        )}
        {showHome && (
          <>
            {screen === 'home' && (
              <HomeScreen onCreate={handleCreate} onJoin={handleJoin} />
            )}
            {screen === 'create' && (
              <div>
                <button
                  type="button"
                  className="btn btn-light btn-lg shadow position-absolute top-50 start-0 translate-middle-y ms-2 d-flex align-items-center justify-content-center"
                  style={{zIndex: 10, width: 56, height: 56, borderRadius: '50%'}}
                  onClick={handleBack}
                  aria-label="Volver"
                >
                  <i className="bi bi-arrow-left fs-2"></i>
                </button>
                <ContractCreateScreen onCreated={() => setScreen('home')} />
              </div>
            )}
            {screen === 'link' && (
              <div>
                <button
                  type="button"
                  className="btn btn-light btn-lg shadow position-absolute top-50 start-0 translate-middle-y ms-2 d-flex align-items-center justify-content-center"
                  style={{zIndex: 10, width: 56, height: 56, borderRadius: '50%'}}
                  onClick={handleBack}
                  aria-label="Volver"
                >
                  <i className="bi bi-arrow-left fs-2"></i>
                </button>
                <ContractLinkScreen contractId={joinId} />
              </div>
            )}
            <NavBar onSupport={() => setShowSupport(true)} />
            {showSupport && <SupportScreen onClose={() => setShowSupport(false)} />}
          </>
        )}
      </div>
    </AnimatedBackground>
  );
}
