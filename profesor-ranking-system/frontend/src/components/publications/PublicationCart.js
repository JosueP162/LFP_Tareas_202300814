import React, { useState } from 'react';
import { useAuth } from '../../utils/auth';
import api from '../../utils/api';

const PublicationCard = ({ publication }) => {
  const { isAuthenticated } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    setError('');

    try {
      await api.post(`/publicaciones/${publication.id}/comentarios`, {
        mensaje: newComment
      });
      
      setNewComment('');
      alert('Comentario agregado exitosamente');
      window.location.reload();
    } catch (error) {
      setError(error.response?.data?.message || 'Error al agregar comentario');
    } finally {
      setLoading(false);
    }
  };

  const getPublicationType = (tipo) => {
    const types = {
      evaluacion: 'Evaluación',
      consulta: 'Consulta',
      recomendacion: 'Recomendación',
      discusion: 'Discusión',
      general: 'General'
    };
    return types[tipo] || tipo;
  };

  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <div className="card-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>{publication.autor_nombres} {publication.autor_apellidos}</strong>
            <span style={{ 
              marginLeft: '1rem', 
              padding: '0.25rem 0.5rem', 
              backgroundColor: '#e9ecef', 
              borderRadius: '4px', 
              fontSize: '0.8rem' 
            }}>
              {getPublicationType(publication.tipo_publicacion)}
            </span>
          </div>
          <small>{new Date(publication.fecha_creacion).toLocaleDateString()}</small>
        </div>
      </div>
      
      <div className="card-body">
        <p style={{ marginBottom: '1rem' }}>{publication.mensaje}</p>
        
        {publication.objetivo && (
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            <strong>Sobre:</strong> {publication.objetivo}
          </p>
        )}
        
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="btn btn-secondary"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
          >
            {showComments ? 'Ocultar comentarios' : 'Ver comentarios'}
          </button>
        </div>

        {showComments && (
          <div style={{ marginTop: '1rem' }}>
            <h4>Comentarios</h4>
            
            {publication.comentarios && publication.comentarios.length > 0 ? (
              publication.comentarios.map(comment => (
                <div key={comment.id} style={{ 
                  padding: '0.5rem', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px', 
                  marginBottom: '0.5rem',
                  backgroundColor: '#f8f9fa'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{comment.usuario_nombres} {comment.usuario_apellidos}</strong>
                    <small>{new Date(comment.fecha_creacion).toLocaleDateString()}</small>
                  </div>
                  <p style={{ margin: '0.5rem 0' }}>{comment.mensaje}</p>
                </div>
              ))
            ) : (
              <p>No hay comentarios aún.</p>
            )}

            {isAuthenticated && (
              <form onSubmit={handleCommentSubmit} style={{ marginTop: '1rem' }}>
                {error && <div className="alert alert-error">{error}</div>}
                
                <div className="form-group">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="form-input"
                    rows="2"
                    placeholder="Escribe un comentario..."
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                >
                  {loading ? 'Enviando...' : 'Comentar'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicationCard;