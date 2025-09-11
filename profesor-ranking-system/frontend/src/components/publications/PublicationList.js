import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import PublicationCard from './PublicationCart';

const PublicationsList = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10
  });

  useEffect(() => {
    fetchPublications();
  }, [filters]);

  const fetchPublications = async () => {
    try {
      const params = new URLSearchParams();
      params.append('page', filters.page);
      params.append('limit', filters.limit);

      const response = await api.get(`/publicaciones?${params}`);
      setPublications(response.data.publicaciones || []);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al cargar publicaciones');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando publicaciones...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div style={{ marginTop: '2rem' }}>
      <h1>Publicaciones de la Comunidad</h1>
      
      <div>
        {publications.map(publication => (
          <PublicationCard key={publication.id} publication={publication} />
        ))}
      </div>

      {publications.length === 0 && !loading && (
        <div className="card">
          <div className="card-body">
            <p>No hay publicaciones disponibles. Sé el primero en publicar.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicationsList;