import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { MotorcycleProvider } from './src/context/MotorcycleContext';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { lightTheme, darkTheme } from './src/theme/theme';
import AuthNavigator from './src/navigation/AuthNavigator';

// Componente interno que usa o contexto de tema
function AppContent() {
  const { isDarkTheme } = useTheme();
  const theme = isDarkTheme ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <MotorcycleProvider>
          <AuthNavigator />
        </MotorcycleProvider>
      </AuthProvider>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}