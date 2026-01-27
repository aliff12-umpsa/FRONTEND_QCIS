import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // points to backend
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // if you use cookies/auth
});

export default api;
