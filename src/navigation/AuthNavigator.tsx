import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

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
import DebugScreen from '../screens/DebugScreen';
import TestScreen from '../screens/TestScreen';
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
  Debug: undefined;
  Test: undefined;
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
  return (
    <RootStack.Navigator initialRouteName="Dashboard">
      <RootStack.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ title: 'Dashboard - IdeaTec' }} 
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
      <RootStack.Screen 
        name="Debug" 
        component={DebugScreen} 
        options={{ title: 'Debug - Limpar Dados' }} 
      />
      <RootStack.Screen 
        name="Test" 
        component={TestScreen} 
        options={{ title: 'Teste de Navegação' }} 
      />
    </RootStack.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      {user ? <RootNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}