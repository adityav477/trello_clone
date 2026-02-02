import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true
});

export const apiPrivate = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true
})

export const apiTokens = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true
})

export default api;
