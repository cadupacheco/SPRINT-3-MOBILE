import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme as usePaperTheme, IconButton } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Telas de Autenticação
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Telas Principais
import HomeScreen from '../screens/HomeScreen';
import DashboardScreen from '../screens/DashboardScreen';
import MapScreen from '../screens/MapScreen';
import MotorcycleDetailsScreen from '../screens/MotorcycleDetailsScreen';
import AddMotorcycleScreen from '../screens/AddMotorcycleScreen';
import SettingsScreen from '../screens/SettingsScreen';
import UsersScreen from '../screens/UsersScreen';
import { Motorcycle } from '../utils/storage';

// Tipos para navegação autenticada
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// Tipos para navegação principal
export type RootStackParamList = {
  Home: undefined;
  Dashboard: undefined;
  Map: undefined;
  MotorcycleDetails: { id: string };
  AddMotorcycle: { motorcycle?: Motorcycle } | undefined;
  Settings: undefined;
  Users: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function RootNavigator() {
  const theme = usePaperTheme();
  const { user, logout } = useAuth();
  const { isDarkTheme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };
  
  return (
    <RootStack.Navigator 
      initialRouteName="Dashboard"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1976d2',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          color: 'white',
        },
        headerTitleAlign: 'center',
      }}
    >
      <RootStack.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={({ navigation }) => ({ 
          title: 'Dashboard',
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {/* Ícone de Usuários - Apenas para Administradores */}
              {user?.role === 'admin' && (
                <IconButton 
                  icon="account-group" 
                  size={24}
                  iconColor="white"
                  onPress={() => navigation.navigate('Users')}
                />
              )}
              
              {/* Ícone de Tema (Sol/Lua) */}
              <IconButton 
                icon={isDarkTheme ? "weather-sunny" : "weather-night"} 
                size={24}
                iconColor="white"
                onPress={toggleTheme}
              />
              
              {/* Ícone de Logout (Saída) */}
              <IconButton 
                icon="logout" 
                size={24}
                iconColor="white"
                onPress={handleLogout}
              />
            </View>
          )
        })} 
      />
      <RootStack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Pátio IdeaTec' }} 
      />
      <RootStack.Screen 
        name="Map" 
        component={MapScreen} 
        options={{ title: 'Mapa do Pátio' }} 
      />
      <RootStack.Screen 
        name="MotorcycleDetails" 
        component={MotorcycleDetailsScreen} 
        options={{ title: 'Detalhes da Moto' }} 
      />
      <RootStack.Screen 
        name="AddMotorcycle" 
        component={AddMotorcycleScreen} 
        options={({ route }) => ({
          title: (route.params as any)?.motorcycle ? 'Editar Moto' : 'Adicionar Moto'
        })}
      />
      <RootStack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Configurações' }} 
      />
      <RootStack.Screen 
        name="Users" 
        component={UsersScreen} 
        options={{ title: 'Gerenciar Usuários' }} 
      />
    </RootStack.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useAuth();
  const { isDarkTheme } = useTheme();
  
  // Tema de navegação para React Navigation
  const navigationTheme = {
    dark: isDarkTheme,
    colors: {
      primary: isDarkTheme ? '#64b5f6' : '#1976d2',
      background: isDarkTheme ? '#121212' : '#f5f5f5',
      card: isDarkTheme ? '#1e1e1e' : '#ffffff',
      text: isDarkTheme ? '#e6e6e6' : '#1c1b1f',
      border: isDarkTheme ? '#333333' : '#d0d7de',
      notification: isDarkTheme ? '#ff6b6b' : '#ff0000',
    },
    fonts: {
      regular: {
        fontFamily: 'System',
        fontWeight: '400' as const,
      },
      medium: {
        fontFamily: 'System',
        fontWeight: '500' as const,
      },
      bold: {
        fontFamily: 'System',
        fontWeight: '600' as const,
      },
      heavy: {
        fontFamily: 'System',
        fontWeight: '700' as const,
      },
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      {user ? <RootNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}