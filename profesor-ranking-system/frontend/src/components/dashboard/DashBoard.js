import React from 'react';
import { useAuth } from '../../utils/auth';

const Dashboard = () => {
  const { currentUser } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="card">
        <div className="card-header">
          <h2>Bienvenido, {currentUser.nombres} {currentUser.apellidos}</h2>
        </div>
        <div className="card-body">
          <p><strong>Registro académico:</strong> {currentUser.registro_academico}</p>
          <p><strong>Email:</strong> {currentUser.email}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;