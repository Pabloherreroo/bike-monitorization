import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect   } from 'react';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import Maps from './pages/Maps';
import Dashboard from './pages/Dashboard';
import './styles/App.css';
import { getBikes, getBikeData } from "./api";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [hideTestBikes, setHideTestBikes] = useState(false)
  const [hiddenBikeIds, setHiddenBikeIds] = useState([])
  const [loadingAuth, setLoadingAuth] = useState(true)

  // Datos desde backend y filtrados
  const [bikes, setBikes] = useState([]);
  const [bikeData, setBikeData] = useState([]);
  const [filteredBikes, setFilteredBikes] = useState([])
  const [filteredBikeData, setFilteredBikeData] = useState([])

  // Filtros de Mapas
  const [activeTimeFrame, setActiveTimeFrame] = useState("1d")
  const roadConditions = [
    { id: "green", condition: "good", color: "#4CAF50", score: 1 },
    { id: "yellow", condition: "mid", color: "#FFEB3B", score: 2 },
    { id: "orange", condition: "bad", color: "#FF9800", score: 3 },
    { id: "red", condition: "very_bad", color: "#F44336", score: 4 },
  ]
  const [activeColors, setActiveColors] = useState(roadConditions.map((c) => c.id))

  const handleLogout = () => {
    // Actualizar el estado primero y eliminar
    setIsAuthenticated(false)
    setIsSuperAdmin(false)
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("isSuperAdmin")
  }
  
  useEffect(() => {
    const checkAuth = () => {
      const storedAuth = localStorage.getItem("isAuthenticated") === "true"
      const storedSuperAdmin = localStorage.getItem("isSuperAdmin") === "true"
      if (storedAuth) {
        setIsAuthenticated(storedAuth);
        setIsSuperAdmin(storedSuperAdmin);
      } else {
        // Si no hay sesión, asegurarse de que no esté autenticado
        setIsAuthenticated(false);
        setIsSuperAdmin(false);
      }
      setLoadingAuth(false)
    }
    checkAuth()
    // Añadir un event listener para detectar cambios en localStorage para sincronizar el estado entre pestañas
    window.addEventListener("storage", checkAuth)
    return () => {
      window.removeEventListener("storage", checkAuth)
    }
  }, []);
  
  // Modificado para coger solo ultimos datos, no siempre pedir todos
  useEffect(() => {
    let ultimoTimestamp = null;

    const fetchData = async () => {
      console.log('Fetching data...', { ultimoTimestamp });
      
      const bikesResponse = await getBikes();
      setBikes(bikesResponse);
      console.log('Bikes actualizadas:', bikesResponse.length); //deben ser todas

      // Para bikeData, usamos el timestamp
      const bikeDataResponse = await getBikeData(ultimoTimestamp);
      console.log('BikeData recibida:', bikeDataResponse.length);

      if (bikeDataResponse.length >= 0) {
        if (ultimoTimestamp === null) {
          setBikeData(bikeDataResponse); // Primera carga
        } else {
          // Cargas incrementales: añadir solo los nuevos
          setBikeData(prevData => {
            const bikeIdsExistentes = new Set(bikesResponse.map(b => b.bike_id));
            const datosFiltrados = prevData.filter(d => bikeIdsExistentes.has(d.bike_id));
            
            const nuevosUnicos = bikeDataResponse.filter(
              nuevo => !datosFiltrados.some(
                existente => existente.bike_id === nuevo.bike_id && existente.fecha === nuevo.fecha
              )
            );
            
            const resultado = [...datosFiltrados, ...nuevosUnicos];
            console.log('Datos incrementales:', {
              anteriores: prevData.length,
              filtrados: datosFiltrados.length,
              nuevos: nuevosUnicos.length,
              total: resultado.length
            });
            
            return resultado;
          });
        }
        
        // Actualizar timestamp con el dato más reciente
        ultimoTimestamp = bikeDataResponse[bikeDataResponse.length - 1].fecha;
        console.log('Nuevo timestamp:', ultimoTimestamp);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);


  // Filtrar si boton de test o si icono de superadmin
  useEffect(() => {
    let tempBikes = [...bikes]
    let tempBikeData = [...bikeData]

    if (hideTestBikes) {
      tempBikes = tempBikes.filter((bike) => !/^BP\d+$/.test(bike.bike_id))
      tempBikeData = tempBikeData.filter((data) => !/^BP\d+$/.test(data.bike_id))
    }
    if (hiddenBikeIds.length > 0) {
      tempBikeData = tempBikeData.filter((data) => !hiddenBikeIds.includes(data.bike_id))
    }

    setFilteredBikes(tempBikes)
    setFilteredBikeData(tempBikeData)
  }, [bikes, bikeData, hideTestBikes, hiddenBikeIds])

  const handleLogin = (username, password) => {
    // Verificar credenciales válidas, superAdmin o admin normal
    if (
      (username === "admin" && password === "admin") ||
      (username === "bici" && password === "bici") ||
      (username === "superAdmin" && password === "superAdmin")
    ) {
      setIsAuthenticated(true)
      localStorage.setItem("isAuthenticated", "true")

      if (username === "superAdmin" && password === "superAdmin") {
        setIsSuperAdmin(true)
        localStorage.setItem("isSuperAdmin", "true")
      } else {
        setIsSuperAdmin(false)
        localStorage.setItem("isSuperAdmin", "false")
      }
      return true
    }
    return false
  }

  const toggleHideTestBikes = () => {
    setHideTestBikes((prev) => !prev)
  }

  const toggleHideBike = (bikeId) => {
    setHiddenBikeIds((prev) => (prev.includes(bikeId) ? prev.filter((id) => id !== bikeId) : [...prev, bikeId]))
  }

  // Filtros de Mapa
  const handleTimeFrameClick = (timeFrame) => {
    setActiveTimeFrame(timeFrame)
  }

  const handleColorClick = (colorId) => {
    setActiveColors((prev) => (prev.includes(colorId) ? prev.filter((id) => id !== colorId) : [...prev, colorId]))
  }

  if (loadingAuth) {
    return <div>Cargando...</div>
  }

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
            isAuthenticated ? (
              <MainLayout
                bikeData={filteredBikeData}
                toggleHideTestBikes={toggleHideTestBikes}
                hideTestBikes={hideTestBikes}
                onLogout={handleLogout}
              >
                <Dashboard
                  bikeData={filteredBikeData}
                  bikes={filteredBikes}
                  isSuperAdmin={isSuperAdmin}
                  hiddenBikeIds={hiddenBikeIds}
                  toggleHideBike={toggleHideBike}
                />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/maps"
          element={
            isAuthenticated ? (
              <MainLayout
                bikeData={filteredBikeData}
                toggleHideTestBikes={toggleHideTestBikes}
                hideTestBikes={hideTestBikes}
                onLogout={handleLogout}
              >
                <Maps
                  bikeData={filteredBikeData}
                  bikes={filteredBikes}
                  activeTimeFrame={activeTimeFrame}
                  onTimeFrameChange={handleTimeFrameClick}
                  activeColors={activeColors}
                  onColorChange={handleColorClick}
                  roadConditions={roadConditions}
                />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </Router>
  )
}

export default App;