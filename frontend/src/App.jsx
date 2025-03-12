import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import Maps from './pages/Maps';
import Dashboard from './pages/Dashboard';
import './styles/App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const handleLogin = (username, password) => {
    // Simple authentication for demo, luego verificar
    if (username && password) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            !isAuthenticated 
              ? <Login onLogin={handleLogin} /> 
              : <Navigate to="/dashboard" replace />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated 
              ? <MainLayout><Dashboard /></MainLayout> 
              : <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/maps" 
          element={
            isAuthenticated 
              ? <MainLayout><Maps /></MainLayout> 
              : <Navigate to="/login" replace />
          } 
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;