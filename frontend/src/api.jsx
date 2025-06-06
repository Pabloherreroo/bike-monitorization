import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export const getBikes = async () => {
  try {
    const response = await axios.get(`${API_URL}/bikes`);
    return response.data;
  } catch (error) {
    console.error("Error fetching bikes:", error);
    return [];
  }
};

// Modificado para coger solo ultimos datos desde x fecha
export const getBikeData = async (desde = null) => {
  try {
    let url = `${API_URL}/bike_data`;
    if (desde) {
      url += `?desde=${encodeURIComponent(desde)}`;
    }
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching bike data:", error);
    return [];
  }
};


export const ejecutarTestDinamico = async () => {
  const res = await fetch("http://localhost:8000/test_dinamico", {
    method: "POST",
  });
  return await res.json();
};

export const borrarDatosB2 = async () => {
  const res = await fetch("http://localhost:8000/borrar_b2", {
    method: "DELETE",
  });
  return await res.json();
};
