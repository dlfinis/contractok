import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import SupportScreen from "./screens/SupportScreen";
import ContractCreateScreen from "./screens/ContractCreateScreen";
import ContractLinkScreen from "./screens/ContractLinkScreen";
import ContractDetailScreen from "./screens/ContractDetailScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ContractsListScreen from "./screens/ContractsListScreen";
import ConflictResolutionScreen from "./screens/ConflictResolutionScreen";
import InitialAnimation from "./components/InitialAnimation";
import HomeScreen from "./components/HomeScreen";
import NavBar from "./components/NavBar";
import AnimatedBackground from "./components/AnimatedBackground";
import InfoScreen from "./components/InfoScreen";
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showSupport, setShowSupport] = useState(false);
  const [copied, setCopied] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState(location.pathname);

  // Update active link when location changes
  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  const handleCreate = () => {
    navigate('/create');
  };

  const handleJoin = (id, isSearch = false) => {
    const joinPath = id ? `/link/${id}` : '/link';
    navigate(joinPath, { state: { isSearch } });
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    navigate(-1);
  };
  
  const handleHomeClick = () => {
    navigate('/');
  };
  
  // Handle navigation from NavBar
  const handleNavigate = (path) => {
    if (path === 'home') {
      navigate('/');
    } else if (path === 'contracts') {
      navigate('/contracts');
    } else if (path === 'profile') {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const userId = currentUser?.id || 'current-user-id';
      navigate(`/profile/${userId}`);
    } else if (path === 'support') {
      setShowSupport(true);
    }
  };

  if (isLoading) {
    return (
      <AnimatedBackground>
        <div className="app-bg d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <InitialAnimation onFinish={() => setIsLoading(false)} />
        </div>
      </AnimatedBackground>
    );
  }

  return (
    <div className="app">
      <AnimatedBackground>
        <div className="app-content">
          <NavBar 
            activeLink={activeLink}
            onNavigate={handleNavigate}
            onSupportClick={() => setShowSupport(true)}
            onHomeClick={handleHomeClick}
          />
          <main className="main-content">
            <Routes>
              <Route path="/" element={
                <HomeScreen 
                  onCreate={handleCreate} 
                  onJoin={handleJoin} 
                />} 
              />
              <Route path="/contracts" element={<ContractsListScreen />} />
              <Route path="/contracts/:id" element={<ContractDetailScreen />} />
              <Route path="/contracts/resolve-conflict/:id" element={<ConflictResolutionScreen />} />
              <Route path="/profile/:id" element={<ProfileScreen />} />
              <Route path="/create" element={
                <div className="position-relative">
                  <button
                    type="button"
                    className="btn btn-light btn-lg shadow position-absolute top-0 start-0 ms-2 mt-2 d-flex align-items-center justify-content-center"
                    style={{zIndex: 10, width: 56, height: 56, borderRadius: '50%'}}
                    onClick={handleBack}
                    aria-label="Volver"
                  >
                    <i className="bi bi-arrow-left fs-2"></i>
                  </button>
                  <ContractCreateScreen 
                    onCreated={(contract) => {
                      navigate('/contracts');
                    }} 
                  />
                </div>
              } />
              <Route path="/link/:id?" element={
                <ContractLinkScreen 
                  contractId={location.pathname.split('/')[2]}
                  isSearchMode={location.pathname === '/link'}
                  onBack={handleBack}
                  onSupportClick={() => setShowSupport(true)}
                />} 
              />
              <Route path="/buscar" element={
                <div className="container py-4">
                  <h2>Buscar Contratos</h2>
                  <p>Funcionalidad de búsqueda en desarrollo</p>
                  <button 
                    className="btn btn-primary mt-3"
                    onClick={handleBack}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Volver
                  </button>
                </div>
              } />
            </Routes>
          </main>
        </div>
      </AnimatedBackground>

      {/* Support Modal */}
      {showSupport && (
        <div className="support-modal">
          <SupportScreen onClose={() => setShowSupport(false)} />
        </div>
      )}
    </div>
  );
}
