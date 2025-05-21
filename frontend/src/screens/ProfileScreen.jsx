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
            ? contractsRes.data.contracts.map(contract => ({
                ...contract,
                creadorWorldId: contract.creadorWorldId,
                contraparteWorldId: contract.contraparteWorldId,
                createdAt: contract.createdAt,
                updatedAt: contract.updatedAt
              })) 
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
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  const generateText = (params) => {
    const adjectives = ["friendly", "ingenious", "creative", "original", "intelligent"];
    const animals = ["cat", "dog", "bird", "chicken", "rabbit"];
    const name = params.name || adjectives[Math.floor(Math.random() * adjectives.length)] + "." + animals[Math.floor(Math.random() * animals.length)];
    const code = params.code || ('#' + (Math.random() * 10000).toFixed(0));
    return {
      name,
      code
    }
  }
  // Datos por defecto cuando no hay información
  const defaultUser = {
    name: generateText({}).name,
    createdAt: new Date().toISOString(),
    isVerified: true,
    world_id: generateText({}).code,
    id: generateText({}).code
  };

  const defaultContracts = [
    {
      id: 'test_contract_' + Date.now(),
      tipo: 'Venta',
      monto: 1000,
      descripcion: 'Venta de un producto',
      creadorWorldId: 'test_user_' + Date.now(),
      contraparteWorldId: 'test_user_' + Date.now(),
      createdAt: new Date('2025-05-10T00:00:00.000Z').toISOString(),
      updatedAt: new Date().toISOString(),
      estado: 'aprobado'
    },
    {
      id: 'test_contract_' + Math.random().toFixed(4),
      tipo: 'Servicio',
      monto: 733,
      descripcion: 'Servicio de un producto',
      creadorWorldId: 'test_user_' + Date.now(),
      contraparteWorldId: 'test_user_' + Date.now(),
      createdAt: new Date('2025-05-11T00:00:00.000Z').toISOString(),
      updatedAt: new Date().toISOString(),
      estado: 'aprobado'
    },
    {
      id: 'test_contract_' + Math.random().toFixed(4),
      tipo: 'Venta',
      monto: 1200,
      descripcion: 'Venta de un producto',
      creadorWorldId: 'test_user_' + Date.now(),
      contraparteWorldId: 'test_user_' + Date.now(),
      createdAt: new Date('2025-05-12T00:00:00.000Z').toISOString(),
      updatedAt: new Date().toISOString(),
      estado: 'pendiente'
    },
    {
      id: 'test_contract_' + Math.random().toFixed(4),
      tipo: 'Reparación',
      monto: 35,
      descripcion: 'Reparación de un producto',
      creadorWorldId: 'test_user_' + Date.now(),
      contraparteWorldId: 'test_user_' + Date.now(),
      createdAt: new Date('2025-05-14T00:00:00.000Z').toISOString(),
      updatedAt: new Date('2025-05-16T00:00:00.000Z').toISOString(),
      estado: 'rechazado'
    }
  ];

  const displayUser = contracts?.length > 0 ? user : defaultUser;
  const displayContracts = contracts?.length > 0 ? contracts : defaultContracts;

  // Función segura para calcular estadísticas
  const getContractStats = () => {
    try {
      if (!Array.isArray(displayContracts)) return { completed: 0, total: 0 };
      
      const completed = displayContracts.filter(c => 
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
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center h-100">
            <div className="card-body d-flex flex-column">
              <div className="position-relative d-inline-block mb-3">
                <div 
                  className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mx-auto" 
                  style={{ width: '120px', height: '120px' }}
                >
                  <i className="bi bi-person text-light" style={{ fontSize: '3rem' }}></i>
                </div>
                {/* {displayUser.isVerified && (
                  <div className="position-absolute bottom-0 end-0 bg-success text-white rounded-circle p-1">
                    <i className="bi bi-check-lg"></i>
                  </div>
                )} */}
              </div>
              <h4 className="mb-1">{displayUser.name || 'Usuario'}</h4>
              <p className="text-muted mb-3">
                <small>Miembro desde {new Date(displayUser.createdAt).toLocaleDateString()}</small>
              </p>
              
              <div className="row g-3 mb-3">
                <div className="col-3">
                  <div className="bg-light p-2 rounded-3">
                    <div className="h5 mb-0">{displayContracts.length}</div>
                    <small className="text-muted">Contratos</small>
                  </div>
                </div>
                <div className="col-3">
                  <div className="bg-light p-2 rounded-3">
                    <div className="h5 mb-0">{completedContracts}</div>
                    <small className="text-muted">Completados</small>
                  </div>
                </div>
                {/* <div className="col-3">
                  <div className="bg-light p-2 rounded-3">
                    <div className="h5 mb-0">{successRate}%</div>
                    <small className="text-muted">Éxito</small>
                  </div>
                </div> */}
                <div className="col-3">
                  <div className="bg-light p-2 rounded-3">
                    <div className="h5 mb-0 d-flex align-items-center justify-content-center">
                      {rating.toFixed(1)} <i className="bi bi-star-fill text-warning ms-1"></i>
                    </div>
                    <small className="text-muted">Rating</small>
                  </div>
                </div>
              </div>
              
              <div className="d-flex justify-content-center gap-2 mt-auto">
                <button className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-pencil me-1"></i> Editar
                </button>
                <button className="btn btn-outline-secondary btn-sm">
                  <i className="bi bi-share me-1"></i> Compartir
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Columna derecha - Contratos */}
        <div className="col-md-8">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0">Contratos Recientes</h5>
                <Link to="/contracts" className="btn btn-sm btn-outline-primary">
                  Ver todos
                </Link>
              </div>
              
              {displayContracts.length === 0 ? (
                <div className="text-center p-5">
                  <i className="bi bi-file-earmark-text text-muted" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
                  <h5 className="mt-3">No hay contratos</h5>
                  <p className="text-muted mb-4">Aún no has creado ni recibido contratos</p>
                  <Link to="/new-contract" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i>Crear primer contrato
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Contrato</th>
                        <th>Monto</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayContracts.slice(0, 5).map((contract) => (
                        <tr key={contract.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/contracts/${contract.id}`)}>
                          <td>
                            <div className="fw-medium">{contract.descripcion || 'Contrato sin nombre'}</div>
                            <small className="text-muted">{contract.tipo || 'Sin tipo'}</small>
                          </td>
                          <td className="text-nowrap">${parseFloat(contract.monto || 0).toLocaleString()}</td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(contract.estado)}`}>
                              {contract.estado || 'pendiente'}
                            </span>
                          </td>
                          <td className="text-nowrap">
                            <small className="text-muted">
                              {new Date(contract.createdAt).toLocaleDateString()}
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
