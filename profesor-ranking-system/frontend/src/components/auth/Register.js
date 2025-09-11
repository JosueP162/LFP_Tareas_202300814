import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const Register = () => {
  const [formData, setFormData] = useState({
    registro_academico: '',
    nombres: '',
    apellidos: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...userData } = formData;
      await api.post('/auth/register', userData);
      
      setSuccess('Usuario registrado exitosamente. Ahora puedes iniciar sesión.');
      setFormData({
        registro_academico: '',
        nombres: '',
        apellidos: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Registrarse</h2>
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
          <label className="form-label">Nombres</label>
          <input
            type="text"
            name="nombres"
            className="form-input"
            value={formData.nombres}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Apellidos</label>
          <input
            type="text"
            name="apellidos"
            className="form-input"
            value={formData.apellidos}
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
          <label className="form-label">Contraseña</label>
          <input
            type="password"
            name="password"
            className="form-input"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Confirmar Contraseña</label>
          <input
            type="password"
            name="confirmPassword"
            className="form-input"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
        
        <p style={{ marginTop: '1rem' }}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;