import axios from "axios";

const api = axios.create({
  withCredentials: true,
  baseURL: "http://localhost:9000",
});

export default api;
