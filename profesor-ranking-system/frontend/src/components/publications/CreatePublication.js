import React, { useState } from 'react';
import { useAuth } from '../../utils/auth';
import api from '../../utils/api';

const CreatePublication = ({ onPublicationCreated }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    tipo_publicacion: 'discusion',
    mensaje: '',
    curso_id: '',
    catedratico_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/publicaciones', formData);
      setFormData({
        tipo_publicacion: 'discusion',
        mensaje: '',
        curso_id: '',
        catedratico_id: ''
      });
      
      if (onPublicationCreated) {
        onPublicationCreated(response.data);
      }
      
      setSuccess('Publicación creada exitosamente');
    } catch (error) {
      setError(error.response?.data?.message || 'Error al crear publicación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Crear nueva publicación</h3>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tipo de publicación</label>
            <select
              name="tipo_publicacion"
              className="form-input"
              value={formData.tipo_publicacion}
              onChange={handleChange}
              required
            >
              <option value="discusion">Discusión</option>
              <option value="evaluacion">Evaluación</option>
              <option value="consulta">Consulta</option>
              <option value="recomendacion">Recomendación</option>
              <option value="general">General</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Mensaje</label>
            <textarea
              name="mensaje"
              className="form-input"
              rows="4"
              value={formData.mensaje}
              onChange={handleChange}
              placeholder="Comparte tus pensamientos, preguntas o experiencias..."
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Curso (opcional)</label>
            <input
              type="number"
              name="curso_id"
              className="form-input"
              value={formData.curso_id}
              onChange={handleChange}
              placeholder="ID del curso"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Catedrático (opcional)</label>
            <input
              type="number"
              name="catedratico_id"
              className="form-input"
              value={formData.catedratico_id}
              onChange={handleChange}
              placeholder="ID del catedrático"
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Publicando...' : 'Publicar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePublication;