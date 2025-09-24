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
  console.log('🔐 INÍCIO DO LOGIN:', { email: email.trim(), senhaLength: senha.length });
  
  try {
    // Primeiro, tentar com usuários locais
    const storedUsers = await AsyncStorage.getItem('users');
    console.log('📦 AsyncStorage users:', storedUsers ? 'ENCONTRADO' : 'VAZIO');
    
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      console.log('👥 Usuários parseados:', users.length);
      
      const emailInput = email.trim().toLowerCase();
      const senhaInput = senha.trim();
      
      console.log('🔍 Procurando por:', { emailInput, senhaInput, totalUsers: users.length });
      
      // Verificar cada usuário
      for (let i = 0; i < users.length; i++) {
        const u = users[i];
        const userEmail = u.email.toLowerCase().trim();
        const userPassword = u.password.trim();
        
        console.log(`� User ${i+1}:`, {
          name: u.name,
          email: userEmail,
          password: userPassword,
          isActive: u.isActive,
          emailMatch: userEmail === emailInput,
          passwordMatch: userPassword === senhaInput,
        });
        
        if (userEmail === emailInput && userPassword === senhaInput && u.isActive === true) {
          console.log('✅ MATCH ENCONTRADO! Fazendo login...');
          
          const token = `local_token_${u.id}_${Date.now()}`;
          await AsyncStorage.setItem("token", token);
          await AsyncStorage.setItem("currentUser", JSON.stringify({
            id: u.id,
            nome: u.name,
            email: u.email,
            role: u.role
          }));
          
          console.log('✅ LOGIN SUCCESSFUL');
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
      
      console.log('❌ NENHUM USUÁRIO ENCONTRADO');
    } else {
      console.log('📭 NENHUM USUÁRIO SALVO NO ASYNCSTORAGE');
    }
    
    console.log('🌐 TENTANDO API...');
    const response = await api.post("/login", { email, senha });
    await AsyncStorage.setItem("token", response.data.token);
    return response.data;
  } catch (error) {
    console.log('💥 ERRO FINAL:', error);
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