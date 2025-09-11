import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/auth';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <section style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: '#f8f9fa' }}>
        <h1>Bienvenido al Sistema de Evaluación de Catedráticos</h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto' }}>
          Una plataforma donde los estudiantes de la USAC pueden evaluar a sus catedráticos,
          consultar información sobre cursos y compartir experiencias académicas.
        </p>
        
        {!isAuthenticated ? (
          <div style={{ marginTop: '2rem' }}>
            <Link to="/register" className="btn btn-primary" style={{ marginRight: '1rem' }}>
              Regístrate ahora
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Iniciar sesión
            </Link>
          </div>
        ) : (
          <div style={{ marginTop: '2rem' }}>
            <Link to="/dashboard" className="btn btn-primary" style={{ marginRight: '1rem' }}>
              Ir a mi dashboard
            </Link>
            <Link to="/catedraticos" className="btn btn-secondary">
              Ver catedráticos
            </Link>
          </div>
        )}
      </section>

      <section style={{ padding: '3rem 1rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Características principales</h2>
        
        <div className="grid grid-3">
          <div className="card">
            <div className="card-header">
              <h3>Evaluación de Catedráticos</h3>
            </div>
            <div className="card-body">
              <p>Califica y comenta sobre el desempeño de los catedráticos basado en tu experiencia en sus cursos.</p>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h3>Información de Cursos</h3>
            </div>
            <div className="card-body">
              <p>Consulta información detallada sobre los cursos, créditos, áreas y catedráticos que los imparten.</p>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h3>Comunidad Académica</h3>
            </div>
            <div className="card-body">
              <p>Comparte experiencias, recomendaciones y consultas con otros estudiantes de la comunidad USAC.</p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '3rem 1rem', backgroundColor: '#e9ecef' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Estadísticas</h2>
        
        <div className="grid grid-3">
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '2.5rem', color: '#3498db', margin: '0' }}>500+</h3>
            <p>Catedráticos evaluados</p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '2.5rem', color: '#3498db', margin: '0' }}>1000+</h3>
            <p>Cursos disponibles</p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '2.5rem', color: '#3498db', margin: '0' }}>5000+</h3>
            <p>Estudiantes registrados</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;