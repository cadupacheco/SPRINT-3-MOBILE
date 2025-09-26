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
    role: string;
  };
}

export interface RegisterResponse {
  id: string;
  nome: string;
  email: string;
  message?: string;
}

// Função de login que verifica usuários locais
export async function login(email: string, senha: string): Promise<LoginResponse> {
  
  try {
    // Primeiro, tentar com usuários locais
    const storedUsers = await AsyncStorage.getItem('users');
    
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      
      const emailInput = email.trim().toLowerCase();
      const senhaInput = senha.trim();
      
      
      // Verificar cada usuário
      for (let i = 0; i < users.length; i++) {
        const u = users[i];
        const userEmail = u.email.toLowerCase().trim();
        const userPassword = u.password.trim();
        
          name: u.name,
          email: userEmail,
          password: userPassword,
          isActive: u.isActive,
          emailMatch: userEmail === emailInput,
          passwordMatch: userPassword === senhaInput,
        });
        
        if (userEmail === emailInput && userPassword === senhaInput && u.isActive === true) {
          
          const token = `local_token_${u.id}_${Date.now()}`;
          await AsyncStorage.setItem("token", token);
          await AsyncStorage.setItem("currentUser", JSON.stringify({
            id: u.id,
            nome: u.name,
            email: u.email,
            role: u.role
          }));
          
          return {
            token,
            user: {
              id: u.id,
              nome: u.name,
              email: u.email,
              role: u.role
            }
          };
        }
      }
      
    } else {
    }
    
    const response = await api.post("/login", { email, senha });
    await AsyncStorage.setItem("token", response.data.token);
    return response.data;
  } catch (error) {
    throw new Error('Email ou senha inválidos');
  }
}

export async function register(userData: UserData): Promise<RegisterResponse> {
  const response = await api.post("/usuarios", userData);
  return response.data;
}

export async function logout(): Promise<void> {
  await AsyncStorage.removeItem("token");
  await AsyncStorage.removeItem("currentUser");
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
