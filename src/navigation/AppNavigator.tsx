import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importando as telas
import HomeScreen from '../screens/HomeScreen';
import DashboardScreen from '../screens/DashboardScreen';
import MapScreen from '../screens/MapScreen';
import MotorcycleDetailsScreen from '../screens/MotorcycleDetailsScreen';
import AddMotorcycleScreen from '../screens/AddMotorcycleScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Definindo tipos para os parâmetros de navegação
export type RootStackParamList = {
  Home: undefined;
  Dashboard: undefined;
  Map: undefined;
  MotorcycleDetails: { id: string };
  AddMotorcycle: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard">
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
          options={{ title: 'Dashboard - IdeaTec' }} 
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Pátio IdeaTec' }} 
        />
        <Stack.Screen 
          name="Map" 
          component={MapScreen} 
          options={{ title: 'Mapa do Pátio' }} 
        />
        <Stack.Screen 
          name="MotorcycleDetails" 
          component={MotorcycleDetailsScreen} 
          options={{ title: 'Detalhes da Moto' }} 
        />
        <Stack.Screen 
          name="AddMotorcycle" 
          component={AddMotorcycleScreen} 
          options={{ title: 'Adicionar Moto' }} 
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ title: 'Configurações' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
