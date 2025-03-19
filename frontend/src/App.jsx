import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect   } from 'react';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import Maps from './pages/Maps';
import Dashboard from './pages/Dashboard';
import './styles/App.css';
import { getBikes, getBikeData } from "./api";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Datos desde backend
  const [bikes, setBikes] = useState([]);
  const [bikeData, setBikeData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const bikesResponse = await getBikes();
      const bikeDataResponse = await getBikeData();
      setBikes(bikesResponse);
      setBikeData(bikeDataResponse);
    };
    // Llamada inicial y luego cada 1s
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

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
              ? <MainLayout bikeData={bikeData} ><Dashboard bikeData={bikeData} bikes={bikes} /></MainLayout> 
              : <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/maps" 
          element={
            isAuthenticated 
              ? <MainLayout bikeData={bikeData} ><Maps bikeData={bikeData} /></MainLayout> 
              : <Navigate to="/login" replace />
          } 
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;