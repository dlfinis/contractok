import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function ContractsListScreen() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();

  const updateContractStatus = async (contractId, newStatus) => {
    // if (!window.confirm(`¿Estás seguro de que deseas cambiar el estado del contrato a "${newStatus}"?`)) {
    //   return;
    // }

    try {
      setIsUpdating(true);
      await axios.patch(`/api/contracts/${contractId}/status`, { 
        estado: newStatus 
      });
      
      // Actualizar el estado local
      setContracts(contracts.map(contract => 
        contract.id === contractId 
          ? { ...contract, estado: newStatus } 
          : contract
      ));
      
      //toast.success(`El contrato ha sido actualizado a "${newStatus}"`);
    } catch (error) {
      console.error(`Error al actualizar el estado del contrato a "${newStatus}":`, error);
      toast.error('No se pudo actualizar el estado del contrato');
    } finally {
      setIsUpdating(false);
    }
  };

  const getTipoIcon = (tipo) => {
    switch(tipo?.toLowerCase()) {
      case 'servicio':
        return '⚙️';
      case 'venta':
        return '💰';
      case 'reparacion':
        return '🛠️';
      default:
        return '📄';
    }
  };

  const getTipoLabel = (tipo) => {
    switch(tipo?.toLowerCase()) {
      case 'servicio':
        return 'Servicio';
      case 'venta':
        return 'Venta';
      case 'reparacion':
        return 'Reparación';
      default:
        return tipo || 'Sin tipo';
    }
  };

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        console.log('currentUser', currentUser);
        
        if (!currentUser || !currentUser.world_id) {
          throw new Error('Usuario no autenticado');
        }
        
        const response = await axios.get(`/api/contracts/user/${currentUser.world_id}`);

        setContracts(response?.data?.contracts ? response.data.contracts : []);
        setError('');
      } catch (err) {
        console.error('Error fetching contracts:', err);
        //setError('No se pudieron cargar los contratos');
        //toast.error('Error al cargar los contratos');
        setContracts([]); // Ensure contracts is always an array
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  const handleResolveConflict = (contractId) => {
    console.log('From list contractId', contractId);
    navigate(`/contracts/resolve-conflict/${contractId}`);
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'activo':
        return 'bg-success';
      case 'pendiente':
        return 'bg-warning';
      case 'en disputa':
        return 'bg-danger';
      case 'completado':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando contratos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Mis Contratos</h2>
        <Link to="/create" className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i>Nuevo Contrato
        </Link>
      </div>

      {!contracts || contracts.length === 0 ? (
        <div className="text-center p-5 bg-light rounded-3">
          <i className="bi bi-file-earmark-text text-muted" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
          <h5 className="mt-3">No hay contratos</h5>
          <p className="text-muted mb-4">Aún no has creado ni recibido contratos</p>
          <Link to="/create" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>Crear primer contrato
          </Link>
        </div>
      ) : (
        <div className="table-responsive" style={{ width: '100%' }}>
          <table className="table table-hover mb-0 w-100">
            <thead className="table-light">
              <tr>
                <th style={{ width: '30%' }}>Contrato</th>
                <th style={{ width: '15%' }}>Cod.Vinc.</th>
                <th style={{ width: '10%' }}>Monto</th>
                <th style={{ width: '15%' }}>Estado</th>
                <th style={{ width: '15%' }}>Fecha</th>
                <th style={{ width: '15%' }}>Op.</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr key={contract.id}>
                  <td>
                    <div className="fw-medium" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {contract.descripcion ? contract.descripcion.substring(0, 12) + (contract.descripcion.length > 12 ? '...' : '') : 'Contrato sin nombre'}
                    </div>
                    <small className="text-muted d-flex align-items-center gap-1">
                      <span>{getTipoIcon(contract.tipo)}</span>
                      <span className="ms-1">{getTipoLabel(contract.tipo)}</span>
                    </small>
                  </td>
                  <td className="text-nowrap small text-muted">{contract.codigoVinculacion}</td>
                  <td className="text-nowrap">${parseFloat(contract.monto || 0).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(contract.estado)}`}>
                      {contract.estado || 'pendiente'}
                    </span>
                  </td>
                  <td className="text-nowrap small text-muted">
                    {contract.createdAt ? new Date(contract.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <Link 
                        to={`/contracts/${contract.id}`} 
                        className="btn btn-sm btn-outline-primary"
                        title="Ver detalles"
                      >
                        <i className="bi bi-eye"></i>
                      </Link>
                      {contract.estado?.toLowerCase() !== 'pendiente' && (
                        <button
                          onClick={() => updateContractStatus(contract.id, 'pendiente')}
                          className="btn btn-sm btn-outline-secondary"
                          title="Marcar como pendiente"
                          disabled={isUpdating}
                        >
                          <i className="bi bi-hourglass"></i>
                        </button>
                      )}
                      {contract.estado?.toLowerCase() !== 'disputa' ? (
                        <button
                          onClick={() => updateContractStatus(contract.id, 'disputa')}
                          className="btn btn-sm btn-outline-warning"
                          title="Marcar como en disputa"
                          disabled={isUpdating}
                        >
                          <i className="bi bi-exclamation-triangle"></i>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleResolveConflict(contract.id)}
                          className="btn btn-sm btn-outline-warning"
                          title="Resolver conflicto"
                        >
                          <i className="bi bi-shield-check"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
