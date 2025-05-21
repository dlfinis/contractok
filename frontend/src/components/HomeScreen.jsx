// External Dependencies
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

// Components
import WorldIDLogin from "./WorldIDLogin";

/**
 * HomeScreen Component
 * Main landing page with authentication and contract management options
 * @param {Function} onCreate - Callback for create contract action
 * @param {Function} onJoin - Callback for join contract action
 */
export default function HomeScreen({ onCreate, onJoin }) {
  // Authentication State
  const [authHash, setAuthHash] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Handle successful authentication
   * @param {string} proof - Authentication proof from World ID
   * @param {string} nullifierHash - Nullifier hash from World ID
   */
  const handleSignIn = useCallback((proof, nullifierHash) => {
    console.log('🔑 Inicio de sesión exitoso en HomeScreen:', { proof, nullifierHash });
    if (proof) {
      setAuthHash(proof);
      localStorage.setItem('wld_auth_hash', proof);
      setAuthError(null);
    } else {
      console.warn('⚠️ Se llamó a handleSignIn sin proof');
    }
  }, []);

  /**
   * Handle authentication errors
   * @param {Error} error - Authentication error
   */
  const handleSignInError = useCallback((error) => {
    console.error('❌ Error en el inicio de sesión en HomeScreen:', error);
    setAuthError(error?.message || 'Error al iniciar sesión');
    setAuthHash(null);
    localStorage.removeItem('wld_auth_hash');
  }, []);

  /**
   * Handle user logout
   */
  const handleLogout = useCallback(() => {
    console.log('🚪 Cerrando sesión...');
    setAuthHash(null);
    setAuthError(null);
    localStorage.removeItem('wld_auth_hash');
    localStorage.removeItem('wld_backend_authed');
    localStorage.removeItem('wld_nullifier_hash');
    localStorage.removeItem('currentUser');
    window.dispatchEvent(new Event('userUpdated'));
  }, []);

  // Check authentication status on component mount
  useEffect(() => {
    /**
     * Check and validate current authentication status
     */
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        const savedAuthHash = localStorage.getItem('wld_auth_hash');
        const isBackendAuthed = localStorage.getItem('wld_backend_authed') === 'true';
        
        console.log('🔍 Estado de autenticación al cargar:', { 
          savedAuthHash, 
          isBackendAuthed 
        });
        
        if (savedAuthHash && isBackendAuthed) {
          console.log('✅ Usuario autenticado previamente');
          setAuthHash(savedAuthHash);
          setAuthError(null);
        } else if (savedAuthHash) {
          console.log('⚠️ Hash de autenticación encontrado pero no verificado con el backend');
          // Clean up inconsistent authentication data
          handleLogout();
        } else {
          console.log('👤 No se encontró sesión activa');
          setAuthHash(null);
        }
      } catch (err) {
        console.error('❌ Error al verificar el estado de autenticación:', err);
        setAuthError('Error al verificar la sesión');
      } finally {
        setIsLoading(false);
      }
    };

    // Initial check
    checkAuthStatus();
    
    // Listen for user update events
    const handleUserUpdated = () => {
      console.log('🔄 Evento userUpdated recibido');
      checkAuthStatus();
    };
    
    window.addEventListener('userUpdated', handleUserUpdated);
    return () => window.removeEventListener('userUpdated', handleUserUpdated);
  }, [handleLogout]);

  // Render the component
  return (
    <div className="home-main">
      <motion.div
        className="logo-title"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
          <img
            src="/images/logo.png"
            alt="Logo ContratosYa"
            style={{ width: 64, height: 64, objectFit: 'contain', display: 'block' }}
          />
        </div>
        <h2 style={{ fontFamily: "var(--logo-font), 'Sora', serif", fontWeight: 800 }}>ContratosYa</h2>
        <p className="subtitle" style={{ fontFamily: "var(--main-font), 'Quicksand', Arial, sans-serif" }}>Contratos seguros al momento</p>
      </motion.div>

      {/* Main Action Buttons */}
      <div className="home-btn-group" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        {/* Create Contract Button */}
        <motion.button
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: '#4a6bff',
            color: 'white',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease',
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onCreate}
          aria-label="Crear nuevo contrato"
        >
          <span role="img" aria-hidden="true">📝</span>
          <span>Crear Contrato</span>
        </motion.button>

        {/* Join Contract Button */}
        <motion.button
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: '#00a878',
            color: 'white',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease',
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onJoin('', true) }
          aria-label="Vincular contrato existente"
        >
          <span role="img" aria-hidden="true">🔗</span>
          <span>Vincular Contrato</span>
        </motion.button>
      </div>
      {/* Authentication Section */}
      <div style={{ marginTop: 30, minHeight: 100 }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p style={{ marginTop: '10px', color: '#666' }}>Verificando sesión...</p>
          </div>
        ) : authError ? (
          <div style={{ textAlign: 'center', color: '#dc3545', marginBottom: '15px' }}>
            <p>❌ {authError}</p>
            <button 
              className="btn btn-outline-danger btn-sm" 
              onClick={() => window.location.reload()}
              style={{ marginTop: '5px' }}
            >
              Reintentar
            </button>
          </div>
        ) : !authHash ? (
          <div>
            <WorldIDLogin 
              auto={true} 
              onAuth={handleSignIn} 
              onError={handleSignInError}
              aria-label="Iniciar sesión con World ID"
            />
            <p style={{ 
              fontSize: '0.85rem', 
              color: '#666', 
              marginTop: '10px',
              textAlign: 'center'
            }}>
              La autenticación se realiza automáticamente vía World ID.
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              backgroundColor: '#e8f5e9',
              padding: '10px 20px',
              borderRadius: '20px',
              marginBottom: '15px'
            }}>
              <span style={{ 
                color: '#00A878', 
                fontWeight: 700, 
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#00A878"/>
                </svg>
                Usuario autenticado con World ID
              </span>
            </div>
            <div style={{ marginTop: '10px' }}>
              <button 
                className="btn btn-outline-secondary btn-sm" 
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
