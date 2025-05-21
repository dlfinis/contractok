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

  // Inicia sesión con el backend y maneja el registro/actualización del usuario
  const signInWithBackend = useCallback(async (finalPayload) => {
    setLoading(true);
    setError("");
    setBackendStatus(null);
    
    try {
      console.log('🔍 Iniciando sesión con el backend...', finalPayload);
      
      // Extraer el nullifier_hash del payload
      const { proof, nullifier_hash, verification_level } = finalPayload;
      
      if (!nullifier_hash) {
        throw new Error('No se pudo obtener el nullifier_hash del usuario');
      }
      
      console.log('📤 Autenticando usuario con World ID:', nullifier_hash);
      
      // Autenticación con el backend usando el endpoint /api/auth
      const authResponse = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          world_id: nullifier_hash,
          name: `Usuario_${nullifier_hash.substring(0, 8)}`
        }),
      });
      
      const userData = await authResponse.json();
      console.log('📥 Respuesta de autenticación:', userData);
      
      if (authResponse.ok && userData.world_id) {
        console.log('✅ Autenticación exitosa en el backend');
        
        // Guardar el estado de autenticación
        localStorage.setItem('wld_backend_authed', 'true');
        localStorage.setItem('wld_auth_hash', proof || '');
        localStorage.setItem('wld_nullifier_hash', nullifier_hash);
        
        // Preparar datos del usuario
        const currentUser = {
          id: userData.id,
          world_id: userData.world_id,
          name: userData.name || `Usuario_${nullifier_hash.substring(0, 8)}`,
          isVerified: true,
          verificationLevel: verification_level || VerificationLevel.Device,
          createdAt: userData.createdAt || new Date().toISOString(),
          updatedAt: userData.updatedAt || new Date().toISOString()
        };
        
        // Guardar información del usuario
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Notificar a los componentes suscritos
        window.dispatchEvent(new Event('userUpdated'));
        
        // Notificar éxito
        if (onSuccess) {
          onSuccess(currentUser);
        }
        
        // Notificar autenticación exitosa
        if (onAuth) {
          console.log('🔑 Autenticación exitosa, notificando...');
          onAuth(proof, nullifier_hash);
        }
        
        setBackendStatus("Inicio de sesión exitoso");
        return true;
      } else {
        const errorMsg = authResponseJson.error || "Error en la autenticación con el backend";
        console.error('❌ Error en la respuesta del backend:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error("❌ Error en el proceso de autenticación:", err);
      setError(err.message || "Error al completar el proceso de autenticación");
      
      // Limpiar el estado de autenticación en caso de error
      localStorage.removeItem('wld_backend_authed');
      localStorage.removeItem('wld_auth_hash');
      localStorage.removeItem('wld_nullifier_hash');
      
      // Notificar el error a través de la función onError si está disponible
      if (onError) {
        onError(err);
      }
      
      return false;
    } finally {
      setLoading(false);
      setAuthInProgress(false);
    }
  }, [onSuccess, onError, onAuth]);

  // --- Evento de inicio de sesión manual ---
  const handleSignIn = useCallback(async () => {
    console.log('🔑 Iniciando proceso de inicio de sesión...');
    
    if (authInProgress) {
      console.log('⏳ Inicio de sesión ya en progreso, omitiendo...');
      return;
    }
    
    try {
      console.log('🔄 Configurando estados iniciales...');
      setAuthInProgress(true);
      setShowAuthPopup(true);
      setError("");
      setLoading(true);
      setBackendStatus(null);
      
      // Pequeño retraso para asegurar que la UI se actualice
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verificar si MiniKit está instalado
      if (!MiniKit.isInstalled()) {
        const errorMsg = "❌ MiniKit no está instalado. Abre la app dentro de World App.";
        console.error(errorMsg);
        setError(errorMsg);
        return;
      }
      
      console.log('🔄 Iniciando autenticación con World ID...');
      const signInPayload = {
        action: "contract-login",
        signal: "",
        verification_level: VerificationLevel.Device,
      };
      
      console.log('📤 Enviando solicitud de autenticación a World ID...');
      const result = await MiniKit.commandsAsync.verify(signInPayload);
      console.log('📥 Respuesta de World ID:', result);
      
      if (!result || !result.finalPayload) {
        throw new Error('No se recibió una respuesta válida de World ID');
      }
      
      const { finalPayload } = result;
      
      // Verificar si la respuesta contiene un error
      if (finalPayload.status === 'error') {
        console.log('⚠️ Respuesta de error de World ID:', finalPayload);
        
        // Guardar los datos recibidos
        const { nullifier_hash, verification_level, merkle_root, signal_hash } = finalPayload;
        
        if (nullifier_hash) {
          console.log('💾 Guardando nullifier_hash...');
          localStorage.setItem('wld_nullifier_hash', nullifier_hash);
        }
        if (verification_level) {
          console.log('💾 Guardando verification_level...');
          localStorage.setItem('wld_verification_level', verification_level);
        }
        if (merkle_root) {
          console.log('💾 Guardando merkle_root...');
          localStorage.setItem('wld_merkle_root', merkle_root);
        }
        
        // Iniciar sesión con el backend
        console.log('🔄 Iniciando sesión con el backend...');
        const success = await signInWithBackend({
          ...finalPayload,
          proof: finalPayload.proof || null,
          nullifier_hash: nullifier_hash || null,
          verification_level: verification_level || VerificationLevel.Device,
          merkle_root: merkle_root || null,
          signal_hash: signal_hash || ""
        });
        
        if (!success) {
          throw new Error('Error al verificar con el backend');
        }
      } else {
        // Si no es un error, pero tampoco tiene el formato esperado
        console.log('ℹ️ Respuesta inesperada de World ID:', finalPayload);
        
        // Intentar verificar con el backend de todos modos
        if (finalPayload.proof) {
          console.log('🔍 Se encontró un proof, intentando verificar con el backend...');
          const success = await signInWithBackend({
            ...finalPayload,
            verification_level: finalPayload.verification_level || VerificationLevel.Device,
            signal_hash: finalPayload.signal_hash || ""
          });
          
          if (!success) {
            throw new Error('Error al verificar con el backend');
          }
        } else {
          throw new Error('No se recibió un proof válido desde World ID');
        }
      }
    } catch (err) {
      const errorMsg = `❌ Error autenticando con World ID: ${err?.message || err}`;
      console.error(errorMsg, err);
      setError(errorMsg);
      
      // Forzar limpieza en caso de error
      setShowAuthPopup(false);
      setAuthInProgress(false);
      setLoading(false);
      
      // Notificar el error
      if (onError) {
        onError(err);
      }
    }
  }, [authInProgress, signInWithBackend]);


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

  // Efecto para manejar el inicio de sesión automático
  useEffect(() => {
    // Disparar el popup automáticamente si no hay sesión previa
    const alreadyAuthed = localStorage.getItem('wld_backend_authed') === 'true';
    console.log('🔍 Estado de autenticación al cargar:', { 
      alreadyAuthed,
      authInProgress,
      loading
    });
    if (!alreadyAuthed && !authInProgress && !loading) {
      handleSignIn();
    }
  // Solo debe ejecutarse una vez al montar
  // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      console.log('🔍 Revisando estado de autenticación...');
      
      try {
        const isAlreadyAuthed = localStorage.getItem('wld_backend_authed') === 'true';
        const storedProof = localStorage.getItem('wld_auth_hash');
        const nullifierHash = localStorage.getItem('wld_nullifier_hash');
        const storedMerkleRoot = localStorage.getItem('wld_merkle_root');
        const storedVerificationLevel = localStorage.getItem('wld_verification_level');
        const storedSignalHash = localStorage.getItem('wld_signal_hash');
        
        console.log('🔍 Estado de autenticación:', { 
          isAlreadyAuthed, 
          hasStoredProof: !!storedProof, 
          hasNullifierHash: !!nullifierHash,
          auto, hasAutoRun, proof, authInProgress, showAuthPopup 
        });
        
        // Si ya está autenticado, no hacer nada
        if (isAlreadyAuthed && storedProof && nullifierHash) {
          console.log('✅ Sesión ya iniciada');
          setProof(storedProof);
          setLoading(false);
          if (onAuth) onAuth(storedProof, nullifierHash);
          if (onSuccess) onSuccess();
          return;
        }
        
        // Si hay datos de autenticación pero falta iniciar sesión con el backend
        if (storedMerkleRoot && storedProof && nullifierHash) {
          console.log('🔄 Iniciando sesión con el backend...');
          setProof(storedProof);
          try {
            await signInWithBackend({
              proof: storedProof,
              nullifier_hash: nullifierHash,
              verification_level: storedVerificationLevel || VerificationLevel.Device,
              merkle_root: storedMerkleRoot,
              signal_hash: storedSignalHash || ""
            });
          } catch (err) {
            console.error('Error al iniciar sesión con el backend:', err);
            setError('Error al autenticar con el servidor');
          }
          return;
        }
        
        // Si no hay datos de autenticación y está configurado para auto-iniciar sesión
        if (auto && !hasAutoRun && !proof && !authInProgress && !showAuthPopup) {
          console.log('🚀 Iniciando sesión automática...');
          
          // Limpiar cualquier dato de sesión previo
          localStorage.removeItem('wld_auth_hash');
          localStorage.removeItem('wld_nullifier_hash');
          localStorage.removeItem('wld_verification_level');
          localStorage.removeItem('wld_merkle_root');
          localStorage.removeItem('wld_backend_authed');
          localStorage.removeItem('wld_signal_hash');
          
          // Marcar que ya se intentó iniciar sesión automáticamente
          setHasAutoRun(true);
          
          // Pequeño retraso antes de mostrar el popup
          setTimeout(() => {
            console.log('🔄 Mostrando popup de inicio de sesión...');
            setShowAuthPopup(true);
            handleSignIn().catch(err => {
              console.error('Error en handleSignIn:', err);
              setError('Error al iniciar sesión');
              setLoading(false);
            });
          }, 300); // Aumentado el tiempo de espera para asegurar que el estado se actualice
        } else {
          console.log('⏭️ No se cumple la condición para auto-iniciar sesión');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error en checkAuthStatus:', err);
        setError('Error al verificar el estado de autenticación');
        setLoading(false);
      }
    };
    
    if (!isInitialized) {
      console.log('🔧 Inicializando World ID login...');
      setIsInitialized(true);
      checkAuthStatus();
    } else {
      console.log('🔄 Volviendo a verificar estado de autenticación...');
      checkAuthStatus();
    }
  }, [auto, hasAutoRun, proof, authInProgress, onAuth, onSuccess, signInWithBackend, handleSignIn, handleLogout, isInitialized, showAuthPopup]);

  // Mostrar el nullifier_hash si existe
  const nullifierHash = localStorage.getItem('wld_nullifier_hash');

  // Renderizado del componente
  // Renderizado simplificado: solo estados de carga, error o éxito
  return (
    <div style={{ marginTop: 18, textAlign: 'center' }}>
      {loading && (
        <span style={{ color: '#0A2E5A', fontWeight: 600 }}>
          Iniciando sesión con World ID...
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

