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
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [hideTestBikes, setHideTestBikes] = useState(false)
  const [hiddenBikeIds, setHiddenBikeIds] = useState([])

  // Datos desde backend y filtrados
  const [bikes, setBikes] = useState([]);
  const [bikeData, setBikeData] = useState([]);
  const [filteredBikes, setFilteredBikes] = useState([])
  const [filteredBikeData, setFilteredBikeData] = useState([])

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
    // Simple authentication for demo, luego verificar
    if (username && password) {
      setIsAuthenticated(true)
      if (username === "superAdmin" && password === "superAdmin") {
        setIsSuperAdmin(true)
      } else {
        setIsSuperAdmin(false)
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
              >
                <Maps bikeData={filteredBikeData} />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App;