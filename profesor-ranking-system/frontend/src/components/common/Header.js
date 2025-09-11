import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/auth';

const Header = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <nav className="nav">
        <div className="nav-brand">
          <Link to="/" className="nav-link">Sistema Catedráticos</Link>
        </div>
        
        <ul className="nav-menu">
          <li><Link to="/" className="nav-link">Inicio</Link></li>
          <li><Link to="/cursos" className="nav-link">Cursos</Link></li>
          <li><Link to="/catedraticos" className="nav-link">Catedráticos</Link></li>
          <li><Link to="/publicaciones" className="nav-link">Publicaciones</Link></li>
          
          {isAuthenticated ? (
            <>
              <li><Link to="/dashboard" className="nav-link">Mi Perfil</Link></li>
              <li>
                <button onClick={handleLogout} className="nav-link" style={{background: 'none', border: 'none', cursor: 'pointer'}}>
                  Cerrar Sesión
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="nav-link">Iniciar Sesión</Link></li>
              <li><Link to="/register" className="nav-link">Registrarse</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;