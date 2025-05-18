import React, { useEffect, useState, useCallback } from "react";
import { MiniKit, VerificationLevel } from "@worldcoin/minikit-js";
import PropTypes from "prop-types";

export default function WorldIDLogin({ onAuth, auto = false, onSuccess, onError }) {
  const [proof, setProof] = useState(null);
  const [hasAutoRun, setHasAutoRun] = useState(false);
  const [loading, setLoading] = useState(true); // Iniciar como true para evitar renderizado prematuro
  const [error, setError] = useState("");
  const [backendStatus, setBackendStatus] = useState(null);
  const [authInProgress, setAuthInProgress] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // Nuevo estado para controlar la inicialización

  // Verifica con backend y maneja el registro/actualización del usuario
  const verifyWithBackend = useCallback(async (finalPayload) => {
    setLoading(true);
    setError("");
    setBackendStatus(null);
    
    try {
      // 1. Primero verificar la identidad con World ID
      const { proof, nullifier_hash, verification_level, merkle_root, signal_hash } = finalPayload;
      const payload = { proof, nullifier_hash, verification_level, merkle_root, signal_hash };
      
      // Verificación con el backend
      const verifyResponse = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload, action: "contract-login", signal: "" }),
      });
      
      const verifyResponseJson = await verifyResponse.json();
      
      if (verifyResponseJson.status === 200) {
        localStorage.setItem('wld_backend_authed', 'true');
        setBackendStatus("Verificación exitosa en backend");
        
        // El backend ya ha creado o actualizado el usuario
        // y nos devuelve los datos del usuario en la respuesta
        const userData = verifyResponseJson.user || {
          id: nullifier_hash,
          worldId: nullifier_hash,
          name: `Usuario_${nullifier_hash.substring(0, 8)}`,
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // 3. Guardar la información del usuario en localStorage
        const currentUser = {
          ...userData,
          verificationLevel: verification_level
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // 4. Notificar a los componentes suscritos que el usuario ha cambiado
        window.dispatchEvent(new Event('userUpdated'));
        
        // 5. Cerrar el modal o redirigir si es necesario
        if (onSuccess) {
          onSuccess(currentUser);
        }
        if (verifyResponseJson.link && verifyResponseJson.link.nullifier_hash) {
          localStorage.setItem('wld_nullifier_hash', verifyResponseJson.link.nullifier_hash);
        } else if (nullifier_hash) {
          localStorage.setItem('wld_nullifier_hash', nullifier_hash);
        }
        // Registrar usuario en backend si no existe
        const hash = nullifier_hash || (verifyResponseJson.link && verifyResponseJson.link.nullifier_hash);
        if (hash) {
          try {
            await fetch('/api/auth', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ worldId: hash })
            });
          } catch (e) { /* Ignorar error, el usuario puede existir */ }
        }
        if (onAuth) onAuth(proof, hash);
      } else {
        throw new Error(verifyResponseJson.error || "Error en la verificación");
      }
    } catch (err) {
      console.error("Error en el proceso de autenticación:", err);
      setError(err.message || "Error al completar el proceso de autenticación");
      
      // Limpiar el estado de autenticación en caso de error
      localStorage.removeItem('wld_backend_authed');
      localStorage.removeItem('wld_nullifier_hash');
      
      // Notificar el error a través de la función onError si está disponible
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
      setAuthInProgress(false);
    }
  }, [onSuccess, onError, onAuth]);

  // --- Evento de autenticación manual ---
  const handleAuth = useCallback(async () => {
    if (authInProgress || showAuthPopup) return;
    
    setAuthInProgress(true);
    setShowAuthPopup(true);
    setError("");
    setLoading(true);
    setBackendStatus(null);
    try {
      if (!MiniKit.isInstalled()) {
        setError("MiniKit no está instalado. Abre la app dentro de World App.");
        setLoading(false);
        setAuthInProgress(false);
        return;
      }
      const verifyPayload = {
        action: "contract-login",
        signal: "",
        verification_level: VerificationLevel.Device,
      };
      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);
      if (finalPayload.status === 'error') {
        setError("Error en la autenticación");
        console.error("Error en la autenticación:", error);
        if (finalPayload.nullifier_hash) {
          localStorage.setItem('wld_nullifier_hash', finalPayload.nullifier_hash);
        }
        if (finalPayload.verification_level) {
          localStorage.setItem('wld_verification_level', finalPayload.verification_level);
        }
        if (finalPayload.merkle_root) {
          localStorage.setItem('wld_merkle_root', finalPayload.merkle_root);
        }
        // Verificar con backend
        verifyWithBackend(finalPayload);
      } else {
        setProof(null);
        setError("No se recibió un proof válido desde World ID");
        setLoading(false);
        setAuthInProgress(false);
        return;
      }
    } catch (err) {
      setError("Error autenticando con World ID: " + (err?.message || err));
      setLoading(false);
      setAuthInProgress(false);
    }
  }, [authInProgress, verifyWithBackend]);


  const handleLogout = useCallback(() => {
    // Limpiar el estado local
    setProof(null);
    setBackendStatus(null);
    setError("");
    setLoading(false);
    setAuthInProgress(false);
    setHasAutoRun(false);
    
    // Limpiar el almacenamiento local
    localStorage.removeItem('wld_auth_hash');
    localStorage.removeItem('wld_nullifier_hash');
    localStorage.removeItem('wld_verification_level');
    localStorage.removeItem('wld_merkle_root');
    localStorage.removeItem('wld_backend_authed');
    localStorage.removeItem('wld_signal_hash');
    localStorage.removeItem('currentUser');
    
    // Notificar a los componentes suscritos que el usuario ha cerrado sesión
    window.dispatchEvent(new Event('userUpdated'));
    
    // Notificar a través de las props si es necesario
    if (onSuccess) onSuccess(null);
    if (onAuth) onAuth(null, null);
  }, [onSuccess, onAuth]);

  // Efecto para manejar la autenticación automática
  useEffect(() => {
    const checkAuthStatus = async () => {
      console.log('Checking auth status...');
      // Pequeño retraso para asegurar que no haya múltiples renders
      // await new Promise(resolve => setTimeout(resolve, 100));
      
      const isAlreadyAuthed = localStorage.getItem('wld_backend_authed') === 'true';
      const storedProof = localStorage.getItem('wld_auth_hash');
      const nullifierHash = localStorage.getItem('wld_nullifier_hash');
      const storedMerkleRoot = localStorage.getItem('wld_merkle_root');
      const storedVerificationLevel = localStorage.getItem('wld_verification_level');
      const storedSignalHash = localStorage.getItem('wld_signal_hash');
      
      // Si ya está autenticado, no hacer nada
      if (isAlreadyAuthed && storedProof && nullifierHash) {
        setProof(storedProof);
        setLoading(false);
        console.log('User already authenticated');
        if (onAuth) onAuth(storedProof, nullifierHash);
        if (onSuccess) onSuccess();
        return;
      }
      
      // Si hay datos de autenticación pero falta verificar con el backend
      if (storedMerkleRoot && storedProof && nullifierHash) {
        setProof(storedProof);
        console.log('Verifying with backend...');
        await verifyWithBackend({
          proof: storedProof,
          nullifier_hash: nullifierHash,
          verification_level: storedVerificationLevel || VerificationLevel.Device,
          merkle_root: storedMerkleRoot,
          signal_hash: storedSignalHash || ""
        });
        return;
      }
      
      // Si no hay datos de autenticación
      if (auto && !hasAutoRun && !proof && !authInProgress && !showAuthPopup) {
        console.log('Auto authentication not run yet, running now...');
        // Limpiar cualquier dato de autenticación previo
        localStorage.removeItem('wld_auth_hash');
        localStorage.removeItem('wld_nullifier_hash');
        localStorage.removeItem('wld_verification_level');
        localStorage.removeItem('wld_merkle_root');
        localStorage.removeItem('wld_backend_authed');
        localStorage.removeItem('wld_signal_hash');
        
        // Marcar que ya se intentó autenticar automáticamente
        setHasAutoRun(true);
        setShowAuthPopup(true);
        
        // Pequeño retraso antes de mostrar el popup
        setTimeout(() => {
          if (showAuthPopup) {
            console.log('Showing auth popup...');
            handleAuth();
          }
        }, 100);
      } else {
        setLoading(false);
      }
    };
    
    if (!isInitialized) {
      console.log('Initializing World ID login...');
      setIsInitialized(true);
      checkAuthStatus();
    }
  }, [auto, hasAutoRun, proof, authInProgress, onAuth, onSuccess, verifyWithBackend, handleAuth, handleLogout, isInitialized, showAuthPopup]);

  // Mostrar el nullifier_hash si existe
  const nullifierHash = localStorage.getItem('wld_nullifier_hash');

  // Renderizado del componente
  return (
    <div style={{ marginTop: 18, textAlign: 'center' }}>
      {!proof && !backendStatus && !loading && !auto && (
        <button 
          onClick={handleAuth} 
          style={{
            marginBottom: 18, 
            background: '#0A2E5A', 
            border: 'none', 
            borderRadius: 6, 
            padding: '10px 24px', 
            fontWeight: 600, 
            cursor: 'pointer', 
            color: '#fff', 
            fontSize: 16
          }}
        >
          Autenticar con World ID
        </button>
      )}
      
      {loading && (
        <span style={{ color: '#0A2E5A', fontWeight: 600 }}>
          Verificando identidad con World ID...
        </span>
      )}
      
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      
      {backendStatus && (
        <div style={{ 
          color: backendStatus.includes('exitosa') ? '#00A878' : 'red', 
          marginTop: 10, 
          fontWeight: 600 
        }}>
          {backendStatus}
        </div>
      )}
      
      {nullifierHash && (
        <div style={{ 
          marginTop: 12, 
          fontSize: 13, 
          color: '#0A2E5A', 
          background: '#fffde9', 
          border: '1.5px solid #FFD700', 
          borderRadius: 8, 
          padding: 10, 
          overflowX: 'auto', 
          maxWidth: 420, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8 
        }}>
          <b>Hash de autenticación:</b>
          <span style={{ 
            fontFamily: 'monospace', 
            fontSize: 12, 
            background: '#fff', 
            borderRadius: 4, 
            padding: '2px 6px', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            maxWidth: 200, 
            display: 'inline-block' 
          }}>
            {nullifierHash.length > 20 
              ? `${nullifierHash.slice(0, 8)}...${nullifierHash.slice(-6)}` 
              : nullifierHash}
          </span>
          <button 
            onClick={() => navigator.clipboard.writeText(nullifierHash)} 
            style={{
              marginLeft: 4, 
              fontSize: 12, 
              padding: '2px 8px', 
              border: '1px solid #FFD700', 
              background: '#fffbe6', 
              borderRadius: 4, 
              cursor: 'pointer'
            }}
          >
            Copiar
          </button>
          {/* <button 
            onClick={handleLogout}
            style={{
              marginLeft: 'auto',
              fontSize: 12, 
              padding: '4px 10px', 
              border: '1px solid #ff6b6b', 
              background: '#fff0f0', 
              borderRadius: 4, 
              cursor: 'pointer',
              color: '#ff6b6b',
              fontWeight: 600
            }}
          >
            Cerrar sesión
          </button> */}
        </div>
      )}
    </div>
  );
}

WorldIDLogin.propTypes = {
  /** Callback que se ejecuta cuando la autenticación con World ID es exitosa */
  onAuth: PropTypes.func,
  
  /** Si es true, intenta autenticar automáticamente al cargar */
  auto: PropTypes.bool,
  
  /** Callback que se ejecuta cuando todo el flujo de autenticación y registro es exitoso */
  onSuccess: PropTypes.func,
  
  /** Callback que se ejecuta cuando ocurre un error en cualquier parte del proceso */
  onError: PropTypes.func,
};

WorldIDLogin.defaultProps = {
  auto: false,
  onAuth: () => {},
  onSuccess: () => {},
  onError: () => {}
};

