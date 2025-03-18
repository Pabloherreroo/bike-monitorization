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
  
  // // Datos de prueba, los cambiaré por lo que venga de backend
  // const [airQualityData, setAirQualityData] = useState([
  //   { name: "Deusto", value: 87 },
  //   { name: "Abando", value: 78 },
  //   { name: "Zorrotza", value: 42 },
  //   { name: "Otxarkoaga", value: 55 },
  //   { name: "Basurto", value: 38 },
  //   { name: "Basauri", value: 64 },
  //   { name: "Zamudio", value: 18 },
  //   { name: "Indautxu", value: 75 },
  // ]);
  // const [noiseData, setNoiseData] = useState([
  //   { name: "Deusto", value: 62 },
  //   { name: "Abando", value: 85 },
  //   { name: "Zorrotza", value: 45 },
  //   { name: "Otxarkoaga", value: 37 },
  //   { name: "Basurto", value: 78 },
  //   { name: "Basauri", value: 53 },
  //   { name: "Zamudio", value: 29 },
  //   { name: "Indautxu", value: 91 },
  // ]);

  // // Simulo la actualización dinámica de los datos cada segundo. Problema -> valores que pasan de 100 o bajan de 0 (limitar)
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setAirQualityData((prevData) =>
  //       prevData.map((item) => ({
  //         ...item,
  //         value: Math.max(0, Math.min(100, Math.round(item.value + (Math.random() * 10 - 5)))),
  //       }))
  //     );

  //     setNoiseData((prevData) =>
  //       prevData.map((item) => ({
  //         ...item,
  //         value: Math.max(0, Math.min(120, Math.round(item.value + (Math.random() * 10 - 5)))),
  //       }))
  //     );
  //   }, 1000); 

  //   return () => clearInterval(interval); // Detiene ejecucion repetida al acabar
  // }, []);
  

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
              ? <MainLayout><Dashboard bikeData={bikeData} /></MainLayout> 
              : <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/maps" 
          element={
            isAuthenticated 
              ? <MainLayout><Maps bikeData={bikeData} /></MainLayout> 
              : <Navigate to="/login" replace />
          } 
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;