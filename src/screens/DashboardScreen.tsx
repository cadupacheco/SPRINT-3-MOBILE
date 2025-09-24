import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, FlatList, Alert, ScrollView } from "react-native";
import { Button, Text, Card, ActivityIndicator, FAB, Menu, IconButton, Snackbar } from "react-native-paper";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AuthNavigator";
import { useMotorcycles } from "../context/MotorcycleContext";
import { useAuth } from "../context/AuthContext";

type DashboardNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Dashboard"
>;

export default function DashboardScreen() {
  const navigation = useNavigation<DashboardNavigationProp>();
  const { state, actions } = useMotorcycles();
  const { logout, user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Função para mostrar mensagem de sucesso
  const showSuccessMessage = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  // Carregar motos
  const loadData = async () => {
    try {
      console.log("Dashboard: Iniciando carregamento de motos...");
      setRefreshing(true);
      await actions.loadMotorcycles();
      console.log("Dashboard: Motos carregadas. Total:", state.motorcycles.length);
    } catch (error) {
      console.error("Dashboard: Erro ao carregar:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Deseja sair?",
      [
        { text: "Cancelar" },
        { text: "Sair", onPress: logout },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#4CAF50';
      case 'rented': return '#FF9800';
      case 'maintenance': return '#2196F3';
      default: return '#F44336';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponível';
      case 'rented': return 'Alugada';
      case 'maintenance': return 'Manutenção';
      case 'out_of_service': return 'Fora de Serviço';
      default: return status;
    }
  };

  const renderMotorcycle = ({ item }: { item: any }) => (
    <Card 
      style={styles.card} 
      onPress={() => {
        console.log("🚀 Dashboard - Navegando para MotorcycleDetails com ID:", item.id);
        console.log("🚀 Dashboard - Dados da moto:", item.plate, item.model);
        navigation.navigate("MotorcycleDetails", { id: item.id });
      }}
    >
      <Card.Title title={item.model} subtitle={`Placa: ${item.plate}`} />
      <Card.Content>
        <View style={styles.row}>
          <Text style={[styles.status, { backgroundColor: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
        <Text style={styles.info}>
          📍 {item.location?.x?.toFixed(4)}, {item.location?.y?.toFixed(4)}
        </Text>
        {item.batteryLevel && (
          <Text style={styles.info}>🔋 {item.batteryLevel}%</Text>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Motos IdeaTec</Text>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton 
              icon="dots-vertical" 
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item onPress={() => { setMenuVisible(false); navigation.navigate('Users'); }} title="Usuários" />
          <Menu.Item onPress={() => { setMenuVisible(false); navigation.navigate('Settings'); }} title="Configurações" />
          <Menu.Item onPress={() => { setMenuVisible(false); navigation.navigate('Debug'); }} title="Limpar Dados" />
          <Menu.Item 
            onPress={() => { 
              setMenuVisible(false); 
              showSuccessMessage("💡 Use o botão Logout para fazer login novamente!");
            }} 
            title="💡 Novo Login" 
          />
          <Menu.Item onPress={() => { setMenuVisible(false); handleLogout(); }} title="Logout" />
        </Menu>
      </View>

            <Text style={styles.welcome}>
        Bem-vindo, {user?.name || 'Usuário'}!
      </Text>

      {/* Info de Debug */}
      <Text style={styles.debugInfo}>
        📊 Total de motos: {state.motorcycles.length} | Estado: {refreshing ? "Carregando..." : "OK"}
      </Text>

      {/* Botão de teste de DELETE */}
      {state.motorcycles.length > 0 && (
        <Button 
          mode="outlined" 
          onPress={async () => {
            const firstMoto = state.motorcycles[0];
            console.log("🧪 TESTE DELETE - Tentando deletar primeira moto:", firstMoto.id);
            
            try {
              // Importar a função diretamente do storage
              const { deleteMotorcycle } = await import('../utils/storage');
              const result = await deleteMotorcycle(firstMoto.id);
              console.log("🧪 TESTE DELETE - Resultado direto do storage:", result);
              
              // Verificar o que tem no AsyncStorage agora
              const AsyncStorage = await import('@react-native-async-storage/async-storage');
              const stored = await AsyncStorage.default.getItem('motorcycles');
              const motorcycles = stored ? JSON.parse(stored) : [];
              console.log("🧪 TESTE DELETE - AsyncStorage após delete:", motorcycles.length, "motos");
              
              showSuccessMessage(`🧪 Delete direto: ${result ? 'SUCESSO' : 'FALHOU'} - Restam ${motorcycles.length} motos`);
              
              // Recarregar lista
              await actions.loadMotorcycles();
              
            } catch (error) {
              console.error("🧪 TESTE DELETE - Erro:", error);
              showSuccessMessage("🧪 Delete direto: ERRO - " + error);
            }
          }}
          style={{ margin: 10 }}
        >
          🧪 TESTE DELETE DIRETO
        </Button>
      )}

      {/* Botão para verificar AsyncStorage */}
      <Button 
        mode="outlined" 
        onPress={async () => {
          try {
            const AsyncStorage = await import('@react-native-async-storage/async-storage');
            const stored = await AsyncStorage.default.getItem('motorcycles');
            const motorcycles = stored ? JSON.parse(stored) : [];
            console.log("📱 VERIFICAÇÃO AsyncStorage:");
            console.log("Total de motos no storage:", motorcycles.length);
            console.log("IDs das motos:", motorcycles.map((m: any) => `${m.id} (${m.plate})`));
            console.log("Motos completas:", motorcycles);
            
            showSuccessMessage(`📱 AsyncStorage: ${motorcycles.length} motos encontradas`);
          } catch (error) {
            console.error("📱 ERRO ao verificar AsyncStorage:", error);
            showSuccessMessage("📱 ERRO ao verificar AsyncStorage");
          }
        }}
        style={{ margin: 10, marginTop: 5 }}
      >
        📱 VERIFICAR ASYNCSTORAGE
      </Button>

      {/* Botão de teste via Context */}
      {state.motorcycles.length > 0 && (
        <Button 
          mode="outlined" 
          onPress={async () => {
            const firstMoto = state.motorcycles[0];
            console.log("🎯 TESTE CONTEXT - Tentando deletar via Context:", firstMoto.id);
            
            try {
              const result = await actions.deleteMotorcycleById(firstMoto.id);
              console.log("🎯 TESTE CONTEXT - Resultado:", result);
              
              showSuccessMessage(`🎯 Delete via Context: ${result ? 'SUCESSO' : 'FALHOU'}`);
              
            } catch (error) {
              console.error("🎯 TESTE CONTEXT - Erro:", error);
              showSuccessMessage("🎯 Delete via Context: ERRO");
            }
          }}
          style={{ margin: 10, marginTop: 5 }}
        >
          🎯 TESTE DELETE VIA CONTEXT
        </Button>
      )}

      {/* Content */}
      {refreshing ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
          <Text>Carregando...</Text>
        </View>
      ) : state.motorcycles.length === 0 ? (
        <ScrollView contentContainerStyle={styles.empty}>
          <Text style={styles.emptyText}>Nenhuma moto cadastrada</Text>
          <Text style={styles.emptySubText}>Toque em + para adicionar</Text>
        </ScrollView>
      ) : (
        <FlatList
          data={state.motorcycles}
          renderItem={renderMotorcycle}
          keyExtractor={(item) => item.id}
          onRefresh={loadData}
          refreshing={refreshing}
          style={styles.list}
        />
      )}

      {/* FAB */}
            <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate("AddMotorcycle")}
      />
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}>
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  welcome: {
    fontSize: 16,
    textAlign: 'center',
    padding: 16,
    color: '#666',
  },
  debugInfo: {
    fontSize: 12,
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  status: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    textAlign: 'center',
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
