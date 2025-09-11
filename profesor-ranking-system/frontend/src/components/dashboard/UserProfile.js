import React, { useState, useEffect } from 'react';
import { useAuth } from '../../utils/auth';
import api from '../../utils/api';

const UserProfile = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/usuarios/perfil');
        setUserData(response.data);
      } catch (error) {
        setError(error.response?.data?.message || 'Error al cargar perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) return <div className="loading">Cargando perfil...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <h1>Mi Perfil</h1>
      
      <div className="card">
        <div className="card-header">
          <h2>Información Personal</h2>
        </div>
        <div className="card-body">
          <p><strong>Nombre completo:</strong> {userData.nombres} {userData.apellidos}</p>
          <p><strong>Registro académico:</strong> {userData.registro_academico}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Miembro desde:</strong> {new Date(userData.fecha_creacion).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Cursos Aprobados ({userData.totalCursosAprobados})</h2>
        </div>
        <div className="card-body">
          <p><strong>Total de créditos:</strong> {userData.totalCreditos}</p>
          
          {userData.cursosAprobados.length > 0 ? (
            <div>
              <h3>Lista de cursos:</h3>
              <ul>
                {userData.cursosAprobados.map(curso => (
                  <li key={curso.id}>
                    {curso.codigo_curso} - {curso.nombre_curso} ({curso.creditos} créditos) - 
                    Aprobado en {curso.anio_aprobacion}-{curso.semestre_aprobacion}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No has aprobado ningún curso aún.</p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Mis Publicaciones ({userData.totalPublicaciones})</h2>
        </div>
        <div className="card-body">
          {userData.publicaciones.length > 0 ? (
            <div>
              {userData.publicaciones.map(publicacion => (
                <div key={publicacion.id} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <p><strong>{publicacion.objetivo}</strong></p>
                  <p>{publicacion.mensaje}</p>
                  <small>{new Date(publicacion.fecha_creacion).toLocaleDateString()}</small>
                </div>
              ))}
            </div>
          ) : (
            <p>No has realizado ninguna publicación.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;