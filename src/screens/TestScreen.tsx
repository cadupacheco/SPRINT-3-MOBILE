import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export default function TestScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teste de Navegação</Text>
      <Text style={styles.subtitle}>Usuário: {user?.name}</Text>
      
      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('AddMotorcycle' as never)}
        style={styles.button}
      >
        Ir para Adicionar Moto
      </Button>

      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('Dashboard' as never)}
        style={styles.button}
      >
        Ir para Dashboard
      </Button>

      <Button 
        mode="outlined" 
        onPress={logout}
        style={styles.button}
      >
        Logout
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  button: {
    marginBottom: 15,
  },
});