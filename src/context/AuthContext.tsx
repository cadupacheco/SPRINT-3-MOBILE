import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
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
      // MOCK LOGIN - Para demonstração
      const mockUsers = [
        { id: 1, name: "Carlos Pacheco", email: "carlos@ideatec.com", password: "123456" },
        { id: 2, name: "Pedro Ladeira", email: "pedro@ideatec.com", password: "123456" },
        { id: 3, name: "João Brito", email: "joao@ideatec.com", password: "123456" },
        { id: 4, name: "Admin", email: "admin@ideatec.com", password: "admin123" },
      ];

      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user = mockUsers.find(u => u.email === email && u.password === password);
      
      if (user) {
        const token = `mock_token_${Date.now()}`;
        const userData = { id: user.id, name: user.name, email: user.email };

        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("user", JSON.stringify(userData));

        setToken(token);
        setUser(userData);

        return true;
      }
      
      return false;
    } catch (error) {
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
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
