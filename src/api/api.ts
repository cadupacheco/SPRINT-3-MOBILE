import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Criando a instância do axios com tipos
const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:5000/api", // coloque o endereço da sua API .NET
});

// Interceptor para incluir token JWT
api.interceptors.request.use(async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
  const token = await AsyncStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;