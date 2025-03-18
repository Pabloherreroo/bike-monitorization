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

export const getBikeData = async () => {
  try {
    const response = await axios.get(`${API_URL}/bike_data`);
    return response.data;
  } catch (error) {
    console.error("Error fetching bike data:", error);
    return [];
  }
};
