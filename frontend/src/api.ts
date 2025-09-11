import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api/v1",
});

export function setToken(token: string) {
  API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export default API;
