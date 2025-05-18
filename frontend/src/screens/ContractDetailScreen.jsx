import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ContractDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const response = await axios.get(`/api/contracts/${id}`);
        setContract(response.data);
      } catch (err) {
        console.error('Error fetching contract:', err);
        setError('No se pudo cargar el contrato');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchContract();
    }
  }, [id]);

  const handleResolveConflict = () => {
    // Add conflict resolution logic here
    console.log('Resolving conflict for contract:', id);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="alert alert-warning">
        No se encontró el contrato solicitado
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Detalles del Contrato</h4>
          <button 
            className="btn btn-outline-secondary"
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left"></i> Volver
          </button>
        </div>
        <div className="card-body">
          <h5 className="card-title">{contract.descripcion || 'Contrato sin título'}</h5>
          <div className="row mb-3">
            <div className="col-md-6">
              <p className="mb-1"><strong>Tipo:</strong> {contract.tipo || 'No especificado'}</p>
              <p className="mb-1"><strong>Monto:</strong> ${parseFloat(contract.monto || 0).toLocaleString()}</p>
              <p className="mb-1">
                <strong>Estado:</strong>{' '}
                <span className={`badge ${getStatusBadgeClass(contract.estado)}`}>
                  {contract.estado || 'pendiente'}
                </span>
              </p>
            </div>
            <div className="col-md-6">
              <p className="mb-1"><strong>Fecha de creación:</strong> {new Date(contract.createdAt).toLocaleDateString()}</p>
              <p className="mb-1"><strong>Plazo de entrega:</strong> {contract.plazoEntrega || 'No especificado'}</p>
            </div>
          </div>

          {contract.estado?.toLowerCase() === 'en disputa' && (
            <div className="mt-4">
              <h5>Resolución de Conflicto</h5>
              <button 
                className="btn btn-warning"
                onClick={handleResolveConflict}
              >
                <i className="bi bi-shield-check me-2"></i>
                Resolver Conflicto
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to get badge class based on status
const getStatusBadgeClass = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'activo':
      return 'bg-success';
    case 'pendiente':
      return 'bg-warning text-dark';
    case 'en disputa':
      return 'bg-danger';
    case 'completado':
      return 'bg-info';
    default:
      return 'bg-secondary';
  }
};

export default ContractDetailScreen;
