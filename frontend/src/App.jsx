import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";
import SupportScreen from "./screens/SupportScreen";
import ContractCreateScreen from "./screens/ContractCreateScreen";
import ContractLinkScreen from "./screens/ContractLinkScreen";
import ProfileScreen from "./screens/ProfileScreen";
import InitialAnimation from "./components/InitialAnimation";
import HomeScreen from "./components/HomeScreen";
import NavBar from "./components/NavBar";
import AnimatedBackground from "./components/AnimatedBackground";
import InfoScreen from "./components/InfoScreen";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showSupport, setShowSupport] = useState(false);
  const [screen, setScreen] = useState('home'); // home | create | link | success
  const [activeLink, setActiveLink] = useState('/'); // Para resaltar el enlace activo
  const [joinId, setJoinId] = useState("");
  const [contractResult, setContractResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = () => {
    setScreen('create');
    setActiveLink('/create');
  };
  const handleJoin = (id, isSearch = false) => {
    setJoinId(id);
    setScreen('link');
    setActiveLink('/link');
    if (isSearch) {
      // Forzar modo búsqueda
      setTimeout(() => {
        const linkScreen = document.querySelector('.contract-link-screen');
        if (linkScreen) {
          linkScreen.dataset.searchMode = 'true';
        }
      }, 0);
    }
  };
  // Efecto para cargar datos iniciales
  useEffect(() => {
    // Simular carga de datos necesarios
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 segundos para la animación y carga inicial

    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    setScreen('home');
    setActiveLink('/');
    // Limpiar el historial de navegación para evitar volver atrás a la pantalla anterior
    window.history.replaceState(null, '', window.location.pathname);
  };
  
  // Manejar clic en el botón de inicio
  const handleHomeClick = () => {
    setScreen('home');
    setActiveLink('/');
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

  // Función para renderizar el contenido principal basado en la pantalla actual
  const renderContent = () => {
    if (screen === 'home') {
      return <HomeScreen onCreate={handleCreate} onJoin={handleJoin} />;
    }
    
    if (screen === 'create') {
      return (
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
          <ContractCreateScreen 
            onCreated={(result) => {
              setContractResult(result);
              setScreen('success');
            }} 
          />
        </div>
      );
    }
    
    if (screen === 'link') {
      return (
        <div className="contract-link-screen" data-search-mode={joinId === ''}>
          <button
            type="button"
            className="btn btn-light btn-lg shadow position-absolute top-50 start-0 translate-middle-y ms-2 d-flex align-items-center justify-content-center"
            style={{zIndex: 10, width: 56, height: 56, borderRadius: '50%'}}
            onClick={handleBack}
            aria-label="Volver"
          >
            <i className="bi bi-arrow-left fs-2"></i>
          </button>
          <ContractLinkScreen 
            contractId={joinId === 'search' ? '' : joinId}
            isSearchMode={joinId === 'search'}
          />
        </div>
      );
    }
    
    if (screen === 'success' && contractResult) {
      return (
        <div className="position-relative">
          <button
            type="button"
            className="btn btn-light btn-lg shadow position-absolute top-50 start-0 translate-middle-y ms-2 d-flex align-items-center justify-content-center"
            style={{zIndex: 10, width: 56, height: 56, borderRadius: '50%'}}
            onClick={handleBack}
            aria-label="Volver"
          >
            <i className="bi bi-arrow-left fs-2"></i>
          </button>
          <InfoScreen
            title="¡Contrato creado correctamente!"
            description="El contrato fue registrado. Comparte el siguiente código con la contraparte para que pueda vincularse y aprobar/rechazar el contrato."
            code={contractResult.codigoVinculacion}
            icon={<i className="bi bi-check-circle-fill text-success"></i>}
            actions={[
              {
                label: copied ? '¡Copiado!' : 'Copiar código',
                icon: <i className="bi bi-clipboard"></i>,
                className: 'btn btn-outline-primary btn-lg',
                onClick: () => {
                  navigator.clipboard.writeText(contractResult.codigoVinculacion);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }
              },
              {
                label: 'Compartir WhatsApp',
                icon: <i className="bi bi-whatsapp"></i>,
                className: 'btn btn-outline-success btn-lg',
                onClick: () => {
                  window.open(`https://wa.me/?text=¡Únete%20a%20mi%20contrato%20en%20ContratosYa!%20Código:%20${contractResult.codigoVinculacion}`, '_blank');
                }
              },
              {
                label: 'Ir a inicio',
                icon: <i className="bi bi-house-door"></i>,
                className: 'btn btn-primary btn-lg',
                onClick: handleBack
              }
            ]}
          />
        </div>
      );
    }
    
    return null;
  };

  // Función para navegar al perfil del usuario actual
  const handleProfileClick = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    console.log(currentUser, 'currentUser');
    const userId = currentUser?.id || 'current-user-id';
    // Use React Router's navigation
    window.location.pathname = `/profile/${userId}`;
  };

  return (
    <Router>
      <AnimatedBackground>
        <div className="app-bg">
          <NavBar 
            onSupportClick={() => setShowSupport(true)}
            onSearch={() => setScreen('link')}
          />
          <div className="main-content">
            <Routes>
              <Route path="/" element={renderContent()} />
              <Route path="/profile/:userId" element={<ProfileScreen />} />
            </Routes>
          </div>
          {showSupport && (
            <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{zIndex: 1050, backgroundColor: 'rgba(0,0,0,0.5)'}}>
              <SupportScreen onClose={() => setShowSupport(false)} />
            </div>
          )}
        </div>
      </AnimatedBackground>
    </Router>
  );
}
