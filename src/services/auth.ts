import api from "../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Definindo tipos para os dados de usuário
export interface UserData {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  endereco?: string;
}

export interface LoginResponse {
  token: string;
  user?: {
    id: string;
    nome: string;
    email: string;
  };
}

export interface RegisterResponse {
  id: string;
  nome: string;
  email: string;
  message?: string;
}

export async function login(email: string, senha: string): Promise<LoginResponse> {
  const response = await api.post("/login", { email, senha });
  await AsyncStorage.setItem("token", response.data.token);
  return response.data;
}

export async function register(userData: UserData): Promise<RegisterResponse> {
  const response = await api.post("/usuarios", userData);
  return response.data;
}

export async function logout(): Promise<void> {
  await AsyncStorage.removeItem("token");
}

// Função para obter o token armazenado
export async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem("token");
}

// Função para verificar se o usuário está autenticado
export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  return !!token;
}