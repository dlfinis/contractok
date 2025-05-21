import React, { useState, useEffect } from "react";
import axios from "axios";
import BackendHealth from "../components/BackendHealth";
import "./supportScreen.css";

// Componente para renderizar datos en formato de tabla
const DataTable = ({ data, loading, error, emptyMessage, columns, rowKey, rowClass }) => {
  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border spinner-border-sm" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-muted text-center py-3">{emptyMessage}</div>;
  }

  return (
    <div className="table-responsive" style={{
      maxHeight: 'calc(100vh - 220px)',
      overflowY: 'auto',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
      margin: '0 -0.25rem',
      width: 'calc(100% + 0.5rem)'
    }}>
      <table className="table table-hover table-sm mb-0" style={{
        fontSize: '0.7rem',
        marginBottom: 0,
        tableLayout: 'fixed',
        width: '100%',
        minWidth: '600px',
        borderCollapse: 'separate',
        borderSpacing: 0
      }}>
        <thead className="sticky-top" style={{
          backgroundColor: '#f8f9fa',
          boxShadow: '0 2px 2px -1px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <tr>
            {columns.map(col => (
              <th 
                key={col.key} 
                style={{ 
                  padding: '0.2rem 0.3rem',
                  width: col.width,
                  borderBottom: '1px solid #dee2e6',
                  fontWeight: 600,
                  backgroundColor: '#f8f9fa',
                  position: 'sticky',
                  top: 0
                }}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody style={{ overflowY: 'auto' }}>
          {data.map((item, index) => (
            <tr 
              key={rowKey ? item[rowKey] : index}
              className={rowClass ? rowClass(item) : ''}
              style={{ height: '32px' }}
            >
              {columns.map(col => (
                <td 
                  key={col.key}
                  style={{ 
                    padding: '0.15rem 0.3rem',
                    verticalAlign: 'middle',
                    borderBottom: '1px solid #f0f0f0',
                    ...(col.nowrap ? { whiteSpace: 'nowrap' } : {})
                  }}
                  className={col.className || ''}
                >
                  {col.render ? col.render(item) : item[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Componente para formatear la fecha
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function SupportScreen({ onClose }) {
  // Efecto para manejar el cierre con la tecla ESC
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const [activeTab, setActiveTab] = useState('users');
  const [userMsg, setUserMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState(null);
  const [localData, setLocalData] = useState([]);

  const handleCreateTestUser = async () => {
    setIsLoading(true);
    setUserMsg(null);
    try {
      const response = await axios.post('/api/user', { 
        world_id: 'test_user_' + Date.now(),
        name: 'Test User'
      });
      setUserMsg('Usuario de prueba creado correctamente');
      console.log('Usuario creado:', response.data);
      localStorage.setItem('currentUser', JSON.stringify(response.data));
    } catch (err) {
      setUserMsg('Error al crear usuario: ' + (err.response?.data?.error || err.message));
      console.error('Error al crear usuario:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cargar los usuarios
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setUsersError(null);
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setUsersError('No se pudieron cargar los usuarios');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Cargar datos según la pestaña activa
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      loadLocalStorageData();
    }
  }, [activeTab]);

  const handleDeleteTestUsers = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar todos los usuarios de prueba? Esta acción no se puede deshacer.')) {
      return;
    }
    
    setIsLoading(true);
    setUserMsg(null);
    try {
      const response = await axios.delete('/api/test-users');
      setUserMsg(response.data.message || 'Usuarios de prueba eliminados correctamente');
      // Recargar la lista de usuarios después de eliminar
      await fetchUsers();
    } catch (err) {
      setUserMsg('Error al eliminar usuarios: ' + (err.response?.data?.error || err.message));
      console.error('Error al eliminar usuarios:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cargar datos del localStorage
  const loadLocalStorageData = () => {
    try {
      const allData = {};
      
      // Recorrer todas las claves del localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
          const value = localStorage.getItem(key);
          allData[key] = {
            key,
            value: value,
            size: new Blob([value]).size,
            isJson: isJsonString(value)
          };
        } catch (e) {
          console.error(`Error al leer la clave ${key} del localStorage:`, e);
        }
      }
      
      setLocalData(Object.entries(allData).map(([key, value]) => ({
        key,
        value: value.value,
        size: value.size,
        isJson: value.isJson
      })));
    } catch (error) {
      console.error('Error al cargar datos del localStorage:', error);
    }
  };

  // Función auxiliar para verificar si un string es JSON
  const isJsonString = (str) => {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Función para guardar usuario en localStorage
  const saveUserToLocalStorage = (user) => {
    try {
      const userData = {
        id: user.id,
        world_id: user.world_id,
        name: user.name,
        createdAt: user.createdAt || new Date().toISOString()
      };
      
      // Guardar en localStorage
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      // Mostrar mensaje de éxito
      setUserMsg(`Usuario ${user.name || user.id} guardado en localStorage`);
      
      // Actualizar la vista de localStorage
      if (activeTab === 'localStorage') {
        loadLocalStorageData();
      }
      
      return true;
    } catch (error) {
      console.error('Error al guardar usuario en localStorage:', error);
      setUserMsg('Error al guardar usuario en localStorage');
      return false;
    }
  };

  // Función para formatear el valor para mostrar
  const formatValue = (value, isJson) => {
    if (!value) return '-';
    if (isJson) {
      try {
        return JSON.stringify(JSON.parse(value), null, 2);
      } catch (e) {
        return value;
      }
    }
    return value;
  };

  // Función para manejar la recarga de usuarios
  const handleRefreshUsers = async () => {
    if (activeTab === 'users') {
      await fetchUsers();
    } else {
      loadLocalStorageData();
    }
  };

  return (
    <div className="support-screen-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="support-screen-card">
        <button 
          className="support-close-btn" 
          onClick={onClose}
          aria-label="Cerrar"
        >
          &times;
        </button>
        <h2>Soporte y Estado de Servicios</h2>
        <p style={{marginBottom: 18, color: '#555'}}>
          Aquí puedes revisar el estado de la base de datos, servicios externos y gestionar usuarios de prueba.
        </p>
        
        <div className="mb-4">
          <ul className="nav nav-tabs mb-3" id="supportTabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
                type="button"
              >
                Usuarios
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'localStorage' ? 'active' : ''}`}
                onClick={() => setActiveTab('localStorage')}
                type="button"
              >
                LocalStorage
              </button>
            </li>
          </ul>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 style={{ fontSize: '1.1rem' }}>
              {activeTab === 'users' ? 'Usuarios Registrados' : 'Datos en LocalStorage'}
            </h5>
            <div>
              <button 
                className="btn btn-sm btn-outline-secondary me-2" 
                onClick={handleRefreshUsers}
                disabled={activeTab === 'users' ? isLoadingUsers : false}
                title="Actualizar datos"
              >
                <i className={`bi ${(activeTab === 'users' ? isLoadingUsers : false) ? 'bi-arrow-repeat' : 'bi-arrow-clockwise'} ${(activeTab === 'users' ? isLoadingUsers : false) ? 'fa-spin' : ''}`}></i>
              </button>
              {activeTab === 'users' && (
                <>
                  <button 
                    className="btn btn-sm btn-primary me-2" 
                    onClick={handleCreateTestUser}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creando...' : 'Nuevo Usuario'}
                  </button>
                  <button 
                    className="btn btn-sm btn-danger" 
                    onClick={handleDeleteTestUsers}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Eliminando...' : 'Eliminar Test'}
                  </button>
                </>
              )}
            </div>
          </div>

          {activeTab === 'users' ? (
            <DataTable
              data={users}
              loading={isLoadingUsers}
              error={usersError}
              emptyMessage="No hay usuarios registrados"
              columns={[
                { 
                  key: 'id', 
                  title: 'ID',
                  width: '60px',
                  render: (item) => (
                    <span 
                      className="d-inline-block text-truncate text-primary" 
                      style={{
                        maxWidth: '100%',
                        margin: '0 auto',
                        padding: '0.5rem',
                        overflowX: 'hidden',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        ':hover': { textDecoration: 'none' }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        saveUserToLocalStorage(item);
                      }}
                      title="Haz clic para guardar en localStorage"
                    >
                      {item.id}
                    </span>
                  )
                },
                { 
                  key: 'world_id', 
                  title: 'World ID',
                  className: 'text-monospace',
                  render: (item) => (
                    <span className="d-inline-block text-truncate" style={{ maxWidth: '100%' }}>
                      {item.world_id || '-'}
                    </span>
                  )
                },
                { 
                  key: 'name', 
                  title: 'Nombre',
                  width: '120px',
                  render: (item) => item.name || '-'
                },
                { 
                  key: 'createdAt', 
                  title: 'Creado',
                  width: '140px',
                  nowrap: true,
                  render: (item) => formatDate(item.createdAt)
                }
              ]}
              rowKey="id"
              rowClass={(item) => item.world_id?.startsWith('test_') ? 'table-warning' : ''}
            />
          ) : (
            <DataTable
              data={localData}
              loading={false}
              error={null}
              emptyMessage="No hay datos en el localStorage"
              columns={[
                { 
                  key: 'key', 
                  title: 'Clave',
                  width: '180px',
                  render: (item) => (
                    <span className="d-inline-block text-truncate" style={{ maxWidth: '100%' }}>
                      {item.key}
                    </span>
                  )
                },
                { 
                  key: 'value', 
                  title: 'Valor',
                  render: (item) => (
                    <div style={{
                      maxHeight: '80px',
                      overflow: 'auto',
                      fontSize: '0.7em',
                      lineHeight: '1.2',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      backgroundColor: item.isJson ? '#f8f9fa' : 'transparent',
                      padding: '0.15rem 0.3rem',
                      borderRadius: '0.2rem',
                      border: '1px solid #eee',
                      fontFamily: 'monospace'
                    }}>
                      {formatValue(item.value, item.isJson)}
                    </div>
                  )
                },
                { 
                  key: 'size', 
                  title: 'Tamaño',
                  width: '70px',
                  nowrap: true,
                  render: (item) => `${item.size} bytes`
                }
              ]}
              rowKey="key"
            />
          )}
          {userMsg && (
            <div className={`alert ${userMsg.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
              {userMsg}
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-3 border-top" style={{ paddingTop: '1rem' }}>
          <h5 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Estado del Servicio</h5>
          <BackendHealth />
        </div>
      </div>
    </div>
  );
}
