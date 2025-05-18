import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function ProfileScreen() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contractsError, setContractsError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Obtener datos del usuario usando el endpoint correcto
        const userRes = await axios.get(`/api/users/${userId}`);
        setUser(userRes.data);
        
        // Obtener contratos del usuario
        try {
          const contractsRes = await axios.get(`/api/contracts/user/${userId}`);
          // Asegurarse de que contracts sea un array
          const contractsData = Array.isArray(contractsRes.data?.contracts) 
            ? contractsRes.data.contracts 
            : [];
          setContracts(contractsData);
        } catch (contractError) {
          console.error('Error al cargar contratos:', contractError);
          setContractsError('No se pudieron cargar los contratos. Los datos del perfil se muestran de todos modos.');
          setContracts([]); // Asegurar que contracts sea un array vacío en caso de error
        }
      } catch (err) {
        console.error('Error al cargar los datos del perfil:', err);
        setError('No se pudo cargar la información del perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Calcular rating basado en contratos completados
  const calculateRating = () => {
    if (!contracts.length) return 0;
    
    const completedContracts = contracts.filter(
      contract => contract.estado === 'aprobado' || contract.estado === 'rechazado'
    );
    
    if (!completedContracts.length) return 0;
    
    const approvedContracts = completedContracts.filter(
      contract => contract.estado === 'aprobado'
    );
    
    return Math.round((approvedContracts.length / completedContracts.length) * 5 * 10) / 10;
  };

  const renderRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="d-flex align-items-center">
        {[...Array(fullStars)].map((_, i) => (
          <i key={`full-${i}`} className="bi bi-star-fill text-warning me-1"></i>
        ))}
        {hasHalfStar && <i className="bi bi-star-half text-warning me-1"></i>}
        {[...Array(emptyStars)].map((_, i) => (
          <i key={`empty-${i}`} className="bi bi-star text-warning me-1"></i>
        ))}
        <span className="ms-2">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Función para obtener la clase del badge según el estado
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'firmado':
      case 'aprobado':
      case 'completado':
        return 'bg-success';
      case 'rechazado':
      case 'cancelado':
        return 'bg-danger';
      case 'pendiente':
        return 'bg-warning text-dark';
      case 'en_proceso':
      case 'en progreso':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2">Cargando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
        <Link to="/" className="btn btn-primary mt-3">
          Volver al inicio
        </Link>
      </div>
    );
  }

  // Función segura para calcular estadísticas
  const getContractStats = () => {
    try {
      if (!Array.isArray(contracts)) return { completed: 0, total: 0 };
      
      const completed = contracts.filter(c => 
        c && typeof c === 'object' && 
        (c.estado === 'aprobado' || c.estado === 'rechazado')
      ).length;
      
      return {
        completed,
        total: contracts.length
      };
    } catch (error) {
      console.error('Error calculando estadísticas de contratos:', error);
      return { completed: 0, total: 0 };
    }
  };

  const { completed: completedContracts, total: totalContracts } = getContractStats();
  const rating = Math.round((completedContracts / Math.max(1, totalContracts)) * 5);
  const successRate = contracts.length ? Math.round((completedContracts / contracts.length) * 100) : 0;

  return (
    <div className="container-fluid py-1" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <div className="row justify-content-center">
        <div className="col-10 col-md-8">
          <div className="card shadow-sm mb-4">
            <div className="card-body text-center">
              <div className="position-relative d-inline-block mb-3">
                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto" 
                     style={{ width: '20px', height: '20px', fontSize: '2.5rem' }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </div>
              <h2 className="h4 mb-2">{user?.name || 'Usuario sin nombre'}</h2>
              <p className="text-muted mb-4">Miembro desde {new Date(user?.createdAt).toLocaleDateString()}</p>
              
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <div className="bg-light p-3 rounded-3 h-100">
                    <p className="h2 mb-1">{totalContracts}</p>
                    <p className="text-muted small mb-0">Contratos totales</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="bg-light p-3 rounded-3 h-100">
                    <p className="h2 mb-1">{completedContracts}</p>
                    <p className="text-muted small mb-0">Completados</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="bg-light p-3 rounded-3 h-100">
                    <p className="h2 mb-1">{successRate}%</p>
                    <p className="text-muted small mb-0">Tasa de éxito</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Progreso general</span>
                  <span className="fw-bold">{successRate}%</span>
                </div>
                <div className="progress mb-3" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar bg-success" 
                    role="progressbar" 
                    style={{ width: `${successRate}%` }}
                    aria-valuenow={successRate} 
                    aria-valuemin="0" 
                    aria-valuemax="100">
                  </div>
                </div>
              </div>

              <div className="bg-light p-3 rounded-3 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Calificación:</span>
                  <div className="text-warning">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`bi ${i < rating ? 'bi-star-fill' : 'bi-star'}`}></i>
                    ))}
                  </div>
                </div>
                <p className="small text-muted mb-0">
                  Basado en {completedContracts} {completedContracts === 1 ? 'contrato' : 'contratos'} completados
                </p>
              </div>
            </div>
          </div>

          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h3 className="h5 mb-0">Historial de Contratos</h3>
            </div>
            <div className="card-body p-0">
              {contractsError && (
                <div className="alert alert-warning m-3">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {contractsError}
                </div>
              )}
              {contracts.length === 0 ? (
                <div className="text-center p-4 text-muted">
                  <i className="bi bi-inbox mb-2" style={{ fontSize: '2rem' }}></i>
                  <p className="mb-0">No hay contratos para mostrar</p>
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {contracts.map((contract) => (
                    <li key={contract.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{contract.nombre || 'Contrato sin nombre'}</h6>
                          <p className="mb-1 small text-muted">
                            {new Date(contract.creadoEn).toLocaleDateString()}
                          </p>
                          <span className={`badge ${getStatusBadgeClass(contract.estado)}`}>
                            {contract.estado || 'pendiente'}
                          </span>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold">${parseFloat(contract.monto || 0).toLocaleString()}</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
