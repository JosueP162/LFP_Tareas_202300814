import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const CoursesList = () => {
  const [courses, setCourses] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    area: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchCourses();
    fetchAreas();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.area) params.append('area', filters.area);
      params.append('page', filters.page);
      params.append('limit', filters.limit);

      const response = await api.get(`/cursos?${params}`);
      setCourses(response.data.cursos);
      setPagination(response.data.pagination);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al cargar cursos');
    } finally {
      setLoading(false);
    }
  };

  const fetchAreas = async () => {
    try {
      const response = await api.get('/cursos/meta/areas');
      setAreas(response.data);
    } catch (error) {
      console.error('Error al cargar áreas:', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      area: e.target.value,
      page: 1
    });
  };

  const handlePageChange = (newPage) => {
    setFilters({
      ...filters,
      page: newPage
    });
    window.scrollTo(0, 0);
  };

  if (loading) return <div className="loading">Cargando cursos...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Cursos</h1>
        
        <select value={filters.area} onChange={handleFilterChange} className="form-input" style={{ width: 'auto' }}>
          <option value="">Todas las áreas</option>
          {areas.map(area => (
            <option key={area.area} value={area.area}>
              {area.area} ({area.total_cursos})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-2">
        {courses.map(course => (
          <div key={course.id} className="card">
            <div className="card-header">
              <h3>{course.codigo_curso} - {course.nombre_curso}</h3>
            </div>
            <div className="card-body">
              <p><strong>Área:</strong> {course.area}</p>
              <p><strong>Créditos:</strong> {course.creditos}</p>
              <p><strong>Catedráticos:</strong> {course.total_catedraticos}</p>
              <p><strong>Estudiantes aprobados:</strong> {course.estudiantes_aprobados}</p>
              
              <div style={{ marginTop: '1rem' }}>
                <Link to={`/cursos/${course.id}`} className="btn btn-primary">
                  Ver detalles
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

export default CoursesList;