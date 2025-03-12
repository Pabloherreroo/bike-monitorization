import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/App.css';

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMapsActive = location.pathname === '/maps';
  
  const toggleView = () => {
    if (isMapsActive) {
      navigate('/dashboard');
    } else {
      navigate('/maps');
    }
  };

  return (
    <div>
      <header className="header">
        <h1>Sistema de Monitorización de Bicicletas</h1>
        <div className="switch-container">
          <span>{isMapsActive ? 'Mapas' : 'Dashboard'}</span>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={isMapsActive}
              onChange={toggleView}
            />
            <span className="slider"></span>
          </label>
        </div>
      </header>
      <main className="container" style={{ marginTop: '20px' }}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;