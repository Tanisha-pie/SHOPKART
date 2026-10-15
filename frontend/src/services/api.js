import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true, // Enables sending and receiving HttpOnly cookies across origins
});

export default API;
