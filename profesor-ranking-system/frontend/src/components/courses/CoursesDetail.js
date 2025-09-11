import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../utils/auth';

const CourseDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [approveData, setApproveData] = useState({
    anio_aprobacion: new Date().getFullYear(),
    semestre_aprobacion: 1
  });

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await api.get(`/cursos/${id}`);
      setCourse(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al cargar curso');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveChange = (e) => {
    setApproveData({
      ...approveData,
      [e.target.name]: parseInt(e.target.value)
    });
  };

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/cursos/aprobar/${id}`, approveData);
      alert('Curso marcado como aprobado exitosamente');
      setShowApproveForm(false);
      fetchCourse(); // Refresh course data
    } catch (error) {
      setError(error.response?.data?.message || 'Error al aprobar curso');
    }
  };

  if (loading) return <div className="loading">Cargando curso...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!course) return <div>Curso no encontrado</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>{course.codigo_curso} - {course.nombre_curso}</h1>
          <p><strong>Área:</strong> {course.area}</p>
          <p><strong>Créditos:</strong> {course.creditos}</p>
          <p><strong>Estudiantes aprobados:</strong> {course.estudiantes_aprobados}</p>
        </div>
        
        {isAuthenticated && !course.aprobado_por_usuario && (
          <button 
            onClick={() => setShowApproveForm(!showApproveForm)} 
            className="btn btn-success"
          >
            Marcar como aprobado
          </button>
        )}
      </div>

      {showApproveForm && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <div className="card-header">
            <h3>Marcar como aprobado</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleApproveSubmit}>
              <div className="form-group">
                <label className="form-label">Año de aprobación</label>
                <input
                  type="number"
                  name="anio_aprobacion"
                  className="form-input"
                  value={approveData.anio_aprobacion}
                  onChange={handleApproveChange}
                  min="2000"
                  max={new Date().getFullYear()}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Semestre de aprobación</label>
                <select
                  name="semestre_aprobacion"
                  className="form-input"
                  value={approveData.semestre_aprobacion}
                  onChange={handleApproveChange}
                  required
                >
                  <option value={1}>Primer semestre</option>
                  <option value={2}>Segundo semestre</option>
                </select>
              </div>
              
              <button type="submit" className="btn btn-primary">
                Confirmar aprobación
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h2>Catedráticos que imparten este curso</h2>
        </div>
        <div className="card-body">
          {course.catedraticos && course.catedraticos.length > 0 ? (
            <div className="grid grid-2">
              {course.catedraticos.map(prof => (
                <div key={prof.id} className="card">
                  <div className="card-header">
                    <h3>{prof.nombres} {prof.apellidos}</h3>
                  </div>
                  <div className="card-body">
                    <p><strong>Calificación promedio:</strong> {prof.calificacion_promedio || 'Sin calificaciones'}</p>
                    <p><strong>Total de evaluaciones:</strong> {prof.total_evaluaciones}</p>
                    <a href={`/catedraticos/${prof.id}`} className="btn btn-primary">
                      Ver perfil
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No hay catedráticos registrados para este curso.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;