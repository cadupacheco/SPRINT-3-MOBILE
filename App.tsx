import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { MotorcycleProvider } from './src/context/MotorcycleContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <MotorcycleProvider>
          <AppNavigator />
        </MotorcycleProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}