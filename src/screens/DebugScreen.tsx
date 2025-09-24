import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function DebugScreen() {
  const { logout } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const clearStorage = async () => {
    try {
      setLoading(true);
      await AsyncStorage.clear();
      console.log('AsyncStorage limpo com sucesso');
      
      Alert.alert(
        "Sucesso", 
        "Dados limpos com sucesso! Você será redirecionado para o login.", 
        [
          {
            text: "OK",
            onPress: () => {
              logout();
              // Força reload da aplicação
              setTimeout(() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' as never }],
                });
              }, 100);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao limpar AsyncStorage:', error);
      Alert.alert("Erro", "Não foi possível limpar os dados.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Utilitários de Debug</Text>
      <Text style={styles.description}>
        Use esta opção apenas se estiver com problemas de login ou dados inconsistentes.
      </Text>
      
      <Button 
        mode="contained" 
        onPress={clearStorage}
        style={styles.button}
        loading={loading}
        disabled={loading}
        buttonColor="#f44336"
      >
        Limpar Todos os Dados
      </Button>

      <Button 
        mode="outlined" 
        onPress={goBack}
        style={styles.button}
        disabled={loading}
      >
        Voltar
      </Button>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating size="large" />
          <Text style={styles.loadingText}>Limpando dados...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    lineHeight: 22,
  },
  button: {
    marginTop: 15,
  },
  loadingContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});