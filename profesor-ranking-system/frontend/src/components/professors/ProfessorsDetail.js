import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../utils/auth';

const ProfessorDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [professor, setProfessor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [evaluationData, setEvaluationData] = useState({
    calificacion: 5,
    comentario: '',
    curso_id: ''
  });
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchProfessor();
    if (isAuthenticated) {
      fetchAvailableCourses();
    }
  }, [id, isAuthenticated]);

  const fetchProfessor = async () => {
    try {
      const response = await api.get(`/catedraticos/${id}`);
      setProfessor(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al cargar catedrático');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      const response = await api.get('/cursos/aprobados');
      setCourses(response.data);
    } catch (error) {
      console.error('Error al cargar cursos aprobados:', error);
    }
  };

  const handleEvaluationChange = (e) => {
    setEvaluationData({
      ...evaluationData,
      [e.target.name]: e.target.value
    });
  };

  const handleEvaluationSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/catedraticos/evaluar/${id}`, evaluationData);
      alert('Evaluación enviada exitosamente');
      setShowEvaluationForm(false);
      setEvaluationData({
        calificacion: 5,
        comentario: '',
        curso_id: ''
      });
      fetchProfessor(); // Refresh professor data
    } catch (error) {
      setError(error.response?.data?.message || 'Error al enviar evaluación');
    }
  };

  if (loading) return <div className="loading">Cargando catedrático...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!professor) return <div>Catedrático no encontrado</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>{professor.nombres} {professor.apellidos}</h1>
          <p><strong>Calificación promedio:</strong> {professor.calificacion_promedio || 'Sin calificaciones'}</p>
          <p><strong>Total de evaluaciones:</strong> {professor.total_evaluaciones}</p>
        </div>
        
        {isAuthenticated && (
          <button 
            onClick={() => setShowEvaluationForm(!showEvaluationForm)} 
            className="btn btn-success"
          >
            Evaluar catedrático
          </button>
        )}
      </div>

      {showEvaluationForm && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <div className="card-header">
            <h3>Evaluar catedrático</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleEvaluationSubmit}>
              <div className="form-group">
                <label className="form-label">Curso</label>
                <select
                  name="curso_id"
                  className="form-input"
                  value={evaluationData.curso_id}
                  onChange={handleEvaluationChange}
                  required
                >
                  <option value="">Seleccionar curso</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.codigo_curso} - {course.nombre_curso}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Calificación (1-5)</label>
                <input
                  type="range"
                  name="calificacion"
                  className="form-input"
                  min="1"
                  max="5"
                  value={evaluationData.calificacion}
                  onChange={handleEvaluationChange}
                  required
                />
                <div>Calificación seleccionada: {evaluationData.calificacion}</div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Comentario</label>
                <textarea
                  name="comentario"
                  className="form-input"
                  rows="4"
                  value={evaluationData.comentario}
                  onChange={handleEvaluationChange}
                  required
                />
              </div>
              
              <button type="submit" className="btn btn-primary">
                Enviar evaluación
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h2>Cursos que imparte</h2>
        </div>
        <div className="card-body">
          {professor.cursos && professor.cursos.length > 0 ? (
            <div className="grid grid-2">
              {professor.cursos.map(course => (
                <div key={course.id} className="card">
                  <div className="card-header">
                    <h3>{course.codigo_curso} - {course.nombre_curso}</h3>
                  </div>
                  <div className="card-body">
                    <p><strong>Área:</strong> {course.area}</p>
                    <p><strong>Créditos:</strong> {course.creditos}</p>
                    <a href={`/cursos/${course.id}`} className="btn btn-primary">
                      Ver curso
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Este catedrático no imparte ningún curso actualmente.</p>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h2>Evaluaciones recientes</h2>
        </div>
        <div className="card-body">
          {professor.evaluaciones && professor.evaluaciones.length > 0 ? (
            <div>
              {professor.evaluaciones.map(evaluation => (
                <div key={evaluation.id} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>Calificación: {evaluation.calificacion}/5</strong>
                    <small>{new Date(evaluation.fecha_creacion).toLocaleDateString()}</small>
                  </div>
                  <p><strong>Curso:</strong> {evaluation.curso_codigo} - {evaluation.curso_nombre}</p>
                  <p>{evaluation.comentario}</p>
                  <small>Por: {evaluation.usuario_nombres} {evaluation.usuario_apellidos}</small>
                </div>
              ))}
            </div>
          ) : (
            <p>Este catedrático no tiene evaluaciones aún.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessorDetail;