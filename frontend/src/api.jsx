import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://127.0.0.1:8000" : "https://backend-hxfg.onrender.com");

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
  const res = await fetch(`${API_URL}/test_dinamico`, {
    method: "POST",
  });
  return await res.json();
};

export const borrarDatosB2 = async () => {
  const res = await fetch(`${API_URL}/borrar_b2`, {
    method: "DELETE",
  });
  return await res.json();
};