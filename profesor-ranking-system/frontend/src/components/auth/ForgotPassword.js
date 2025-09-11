import React, { useState } from 'react';
import api from '../../utils/api';

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    registro_academico: '',
    email: '',
    new_password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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
      await api.post('/auth/forgot-password', formData);
      setSuccess('Contraseña actualizada exitosamente');
      setFormData({
        registro_academico: '',
        email: '',
        new_password: ''
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Error al actualizar contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Recuperar Contraseña</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Registro Académico</label>
          <input
            type="text"
            name="registro_academico"
            className="form-input"
            value={formData.registro_academico}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className="form-input"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Nueva Contraseña</label>
          <input
            type="password"
            name="new_password"
            className="form-input"
            value={formData.new_password}
            onChange={handleChange}
            required
          />
        </div>
        
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;