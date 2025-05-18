import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import axios from 'axios';

export default function ContractLinkScreen({ contractId = '', isSearchMode = false }) {
  const [codigo, setCodigo] = useState(contractId || '');
  const [contrato, setContrato] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accion, setAccion] = useState(null); // 'aprobado' o 'rechazado'
  
  // Si se proporciona un contractId, buscar automáticamente
  useEffect(() => {
    if (contractId && !isSearchMode) {
      setCodigo(contractId);
      fetchContrato();
    }
  }, [contractId, isSearchMode]);

  const fetchContrato = async () => {
    setLoading(true);
    setError(null);
    setContrato(null);
    try {
      const res = await axios.get(`/api/contracts/code/${codigo}`);
      setContrato(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Contrato no encontrado');
    } finally {
      setLoading(false);
    }
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [accionPendiente, setAccionPendiente] = useState(null);

  const mostrarConfirmacion = (accion) => {
    setAccionPendiente(accion);
    setShowConfirmModal(true);
  };

  const confirmarAccion = async () => {
    setShowConfirmModal(false);
    
    if (!contrato?.id) {
      setError('No se pudo obtener el ID del contrato');
      return;
    }
    
    setLoading(true);
    setError(null);
    // Ocultar los detalles del contrato mientras se procesa
    const contratoTemporal = { ...contrato };
    setContrato(null);
    
    try {
      const contratoId = Number(contratoTemporal.id);
      const accion = accionPendiente ? 'aprobado' : 'rechazado';
      
      console.log('Enviando solicitud de:', accion, 'para el contrato ID:', contratoId);
      
      const res = await axios.post(
        `/api/contracts/${contratoId}/approve`, 
        { aprobar: accionPendiente },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Respuesta del servidor:', {
        status: res.status,
        data: res.data
      });
      
      if (res.data && res.data.error) {
        throw new Error(res.data.error);
      }
      
      setContrato(res.data);
      setAccion(accion);
      
      // Mostrar mensaje de éxito y redirigir después de 2 segundos
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      
    } catch (err) {
      console.error('Error al procesar la acción:', {
        error: err.message,
        response: err.response?.data,
        status: err.response?.status,
        stack: err.stack
      });
      
      // Restaurar los datos del contrato en caso de error
      setContrato(contratoTemporal);
      
      let mensajeError = 'Error al actualizar el contrato';
      if (err.response?.data?.error) {
        mensajeError = err.response.data.error;
      } else if (err.message) {
        mensajeError = err.message;
      }
      
      setError(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4 position-relative" style={{maxWidth: 480, minHeight: '92vh'}}>
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-center mb-4">
            {isSearchMode ? 'Buscar contrato' : 'Vincular a contrato'}
          </h2>
          <div className="mb-4">
            <div className="input-group input-group-md">
              <input
                type="text"
                className="form-control form-control-md text-uppercase text-center fw-bold md-6"
                placeholder="Código de 4 dígitos"
                maxLength={4}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && codigo.trim() && fetchContrato()}
                style={{letterSpacing: '0.25em'}}
              />
              <button
                className="btn btn-primary px-4"
                type="button"
                onClick={fetchContrato}
                disabled={loading || codigo.length !== 4}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                ) : (
                  <i className="bi bi-search me-1"></i>
                )}
                {isSearchMode ? 'Buscar' : 'Consultar'}
              </button>
            </div>
            {!isSearchMode && (
              <div className="form-text text-center mt-2">
                Ingresa el código de 4 dígitos que te compartieron
              </div>
            )}
          </div>
          {loading && (
            <div className="text-center my-5 py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-2">Procesando tu solicitud...</p>
            </div>
          )}
          {contrato && (
            <div className="card mt-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="mb-0">
                    <i className="bi bi-file-earmark-text me-2"></i>
                    Detalles del Contrato
                  </h4>
                  {isSearchMode && (
                    <span className={`badge ${contrato.estado === 'aprobado' ? 'bg-success' : 
                                      contrato.estado === 'rechazado' ? 'bg-danger' : 
                                      contrato.estado === 'pendiente' ? 'bg-warning' : 'bg-secondary'}`}>
                      <i className={`bi ${contrato.estado === 'aprobado' ? 'bi-check-lg' : 
                                       contrato.estado === 'rechazado' ? 'bi-x-lg' : 
                                       contrato.estado === 'pendiente' ? 'bi-hourglass' : 'bi-question-circle'} me-1`}></i>
                      {contrato.estado ? contrato.estado.toUpperCase() : 'DESCONOCIDO'}
                    </span>
                  )}
                </div>
                <div className="mb-2"><strong>Creado:</strong> {new Date(contrato.createdAt).toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })}</div>
                {contrato && (
                  <div className="contract-details mt-4">
                    <div className="card mb-3">
                      <div className="card-body">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Tipo:</span>
                          <strong className="text-capitalize">{contrato.tipo}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Monto:</span>
                          <strong>${parseFloat(contrato.monto).toLocaleString()}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Plazo de entrega:</span>
                          <strong>{new Date(contrato.plazoEntrega).toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })}</strong>
                        </div>
                        <div className="mt-3">
                          <p className="text-muted mb-1">Descripción:</p>
                          <p className="mb-0">{contrato.descripcion}</p>
                        </div>
                      </div>
                    </div>
                    
                    {!isSearchMode && !accion && (
                      <div className="d-grid gap-2">
                        <button 
                          className="btn btn-success btn-md" 
                          onClick={() => mostrarConfirmacion(true)} 
                          disabled={loading}
                        >
                          <i className="bi bi-check-lg me-2"></i>
                          {loading ? 'Procesando...' : 'Aprobar Contrato'}
                        </button>
                        <button 
                          className="btn btn-outline-danger btn-md"
                          onClick={() => mostrarConfirmacion(false)} 
                          disabled={loading}
                        >
                          <i className="bi bi-x-lg me-2"></i>
                          Rechazar Contrato
                        </button>
                      </div>
                    )}
                    
                    {accion && (
                      <div className="alert alert-success text-center">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        Contrato {accion} correctamente. Redirigiendo...
                        <div className="spinner-border spinner-border-sm ms-2" role="status">
                          <span className="visually-hidden">Cargando...</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          {accion && <div className="alert alert-success mt-3 text-center">Contrato {accion}</div>}
          {error && (
            <div className="alert alert-danger mt-3 d-flex align-items-center" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <div>{error}</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de confirmación */}
      <div className={`modal fade ${showConfirmModal ? 'show d-block' : ''}`} tabIndex="-1" style={{backgroundColor: showConfirmModal ? 'rgba(0,0,0,0.5)' : 'transparent'}}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className={`bi bi-${accionPendiente ? 'check-circle' : 'x-circle'} me-2 text-${accionPendiente ? 'success' : 'danger'}`}></i>
                Confirmar acción
              </h5>
              <button type="button" className="btn-close" onClick={() => setShowConfirmModal(false)}></button>
            </div>
            <div className="modal-body">
              ¿Estás seguro de que deseas {accionPendiente ? 'aprobar' : 'rechazar'} este contrato?
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>
                <i className="bi bi-x-lg me-1"></i> Cancelar
              </button>
              <button 
                type="button" 
                className={`btn btn-${accionPendiente ? 'success' : 'danger'}`}
                onClick={confirmarAccion}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    Procesando...
                  </>
                ) : (
                  <>
                    <i className={`bi bi-${accionPendiente ? 'check' : 'x'}-lg me-1`}></i>
                    {accionPendiente ? 'Aprobar' : 'Rechazar'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Fondo oscuro del modal */}
      {showConfirmModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};
