import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";

interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const loadStorage = async () => {
      try {
        console.log("AuthContext: Verificando storage...");
        const storagedToken = await AsyncStorage.getItem("token");
        const storagedUser = await AsyncStorage.getItem("user");
        
        console.log("Token encontrado:", !!storagedToken);
        console.log("User encontrado:", !!storagedUser);

        if (storagedToken && storagedUser) {
          console.log("AuthContext: Usuário logado automaticamente");
          setToken(storagedToken);
          setUser(JSON.parse(storagedUser));
          api.defaults.headers.common["Authorization"] = `Bearer ${storagedToken}`;
        } else {
          console.log("AuthContext: Nenhum usuário salvo, requer login");
        }
      } catch (error) {
        console.error("AuthContext: Erro ao carregar storage:", error);
      }
    };
    loadStorage();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 AuthContext: Tentativa de login:', { email });
      
      // USAR O SISTEMA DE USUÁRIOS LOCAIS
      const storedUsers = await AsyncStorage.getItem('users');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        console.log('👥 AuthContext: Usuários encontrados:', users.length);
        
        const emailInput = email.trim().toLowerCase();
        const passwordInput = password.trim();
        
        const user = users.find((u: any) => 
          u.email.toLowerCase().trim() === emailInput && 
          u.password.trim() === passwordInput &&
          u.isActive === true
        );
        
        if (user) {
          console.log('✅ AuthContext: Usuário encontrado:', user.name);
          const token = `local_token_${user.id}_${Date.now()}`;
          const userData = { id: parseInt(user.id), name: user.name, email: user.email, role: user.role };

          await AsyncStorage.setItem("token", token);
          await AsyncStorage.setItem("user", JSON.stringify(userData));

          setToken(token);
          setUser(userData);

          return true;
        } else {
          console.log('❌ AuthContext: Usuário não encontrado ou inativo');
        }
      } else {
        console.log('📭 AuthContext: Nenhum usuário salvo, criando usuários padrão...');
        
        // Criar usuários padrão se não existirem
        const defaultUsers = [
          {
            id: '1',
            name: 'Carlos Admin',
            email: 'carlos@ideatec.com',
            password: '123456',
            role: 'admin',
            isActive: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: '2', 
            name: 'Pedro Operador',
            email: 'pedro@ideatec.com',
            password: '123456',
            role: 'operator',
            isActive: true,
            createdAt: new Date().toISOString(),
          },
        ];
        
        await AsyncStorage.setItem('users', JSON.stringify(defaultUsers));
        console.log('👥 AuthContext: Usuários padrão criados');
        
        // Tentar login novamente com usuários padrão
        const user = defaultUsers.find(u => 
          u.email.toLowerCase() === email.toLowerCase() && 
          u.password === password
        );
        
        if (user) {
          const token = `local_token_${user.id}_${Date.now()}`;
          const userData = { id: parseInt(user.id), name: user.name, email: user.email, role: user.role };

          await AsyncStorage.setItem("token", token);
          await AsyncStorage.setItem("user", JSON.stringify(userData));

          setToken(token);
          setUser(userData);

          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('💥 AuthContext: Erro no login:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // MOCK REGISTER - Para demonstração
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular sucesso do cadastro
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = async () => {
    console.log("🔴 LOGOUT - AuthContext: Iniciando logout");
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      setToken(null);
      setUser(null);
      delete api.defaults.headers.common["Authorization"];
      console.log("🔴 LOGOUT - AuthContext: Logout concluído com sucesso");
    } catch (error) {
      console.error("🔴 LOGOUT - AuthContext: Erro durante logout:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
