import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function ContractsListScreen() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
        setError('No se pudieron cargar los contratos');
        toast.error('Error al cargar los contratos');
        setContracts([]); // Ensure contracts is always an array
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  const handleResolveConflict = (contractId) => {
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
    <div className="container py-4">
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
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Contrato</th>
                <th>Cod.Vinc.</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Op.</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr key={contract.id}>
                  <td>
                    <div className="fw-medium" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {contract.descripcion ? contract.descripcion.substring(0, 12) + (contract.descripcion.length > 12 ? '...' : '') : 'Contrato sin nombre'}
                    </div>
                    <small className="text-muted">{contract.tipo || 'Sin tipo'}</small>
                  </td>
                  <td className="text-nowrap">{contract.codigoVinculacion}</td>
                  <td className="text-nowrap">${parseFloat(contract.monto || 0).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(contract.estado)}`}>
                      {contract.estado || 'pendiente'}
                    </span>
                  </td>
                  <td className="text-nowrap">
                    {contract.createdAt ? new Date(contract.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <Link 
                        to={`/contracts/${contract.id}`} 
                        className="btn btn-outline-primary"
                        title="Ver detalles"
                      >
                        <i className="bi bi-eye"></i>
                      </Link>
                      {contract.estado?.toLowerCase() === 'en disputa' && (
                        <button
                          onClick={() => handleResolveConflict(contract.id)}
                          className="btn btn-outline-warning"
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
