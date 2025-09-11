import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const ProfessorsList = () => {
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    sortBy: 'calificacion',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchProfessors();
  }, [filters]);

  const fetchProfessors = async () => {
    try {
      const params = new URLSearchParams();
      params.append('page', filters.page);
      params.append('limit', filters.limit);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);

      const response = await api.get(`/catedraticos?${params}`);
      setProfessors(response.data.catedraticos);
      setPagination(response.data.pagination);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al cargar catedráticos');
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (sortBy) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters({
      ...filters,
      page: newPage
    });
    window.scrollTo(0, 0);
  };

  if (loading) return <div className="loading">Cargando catedráticos...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Catedráticos</h1>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span>Ordenar por:</span>
          <select 
            value={filters.sortBy} 
            onChange={(e) => handleSortChange(e.target.value)}
            className="form-input"
            style={{ width: 'auto' }}
          >
            <option value="calificacion">Calificación</option>
            <option value="total_evaluaciones">Evaluaciones</option>
            <option value="nombres">Nombre</option>
          </select>
        </div>
      </div>

      <div className="grid grid-2">
        {professors.map(professor => (
          <div key={professor.id} className="card">
            <div className="card-header">
              <h3>{professor.nombres} {professor.apellidos}</h3>
            </div>
            <div className="card-body">
              <p><strong>Calificación promedio:</strong> {professor.calificacion_promedio || 'Sin calificaciones'}</p>
              <p><strong>Total de evaluaciones:</strong> {professor.total_evaluaciones}</p>
              <p><strong>Cursos que imparte:</strong> {professor.total_cursos}</p>
              
              <div style={{ marginTop: '1rem' }}>
                <Link to={`/catedraticos/${professor.id}`} className="btn btn-primary">
                  Ver perfil
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pagination.total_pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', gap: '0.5rem' }}>
          <button 
            onClick={() => handlePageChange(filters.page - 1)} 
            disabled={filters.page === 1}
            className="btn btn-secondary"
          >
            Anterior
          </button>
          
          {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`btn ${filters.page === page ? 'btn-primary' : 'btn-secondary'}`}
            >
              {page}
            </button>
          ))}
          
          <button 
            onClick={() => handlePageChange(filters.page + 1)} 
            disabled={filters.page === pagination.total_pages}
            className="btn btn-secondary"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfessorsList;