import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, FlatList, ScrollView } from "react-native";
import { Button, Text, Card, ActivityIndicator, FAB, IconButton, Snackbar, useTheme, Dialog, Portal, Paragraph } from "react-native-paper";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AuthNavigator";
import { useMotorcycles } from "../context/MotorcycleContext";
import { useAuth } from "../context/AuthContext";
import { useTheme as useAppTheme } from "../context/ThemeContext";

type DashboardNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Dashboard"
>;

export default function DashboardScreen() {
  const navigation = useNavigation<DashboardNavigationProp>();
  const { state, actions } = useMotorcycles();
  const { logout, user } = useAuth();
  const theme = useTheme();
  const { isDarkTheme, toggleTheme } = useAppTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
    console.log("🔴 LOGOUT - Iniciando processo");
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    console.log("🔴 LOGOUT - Confirmado, executando logout");
    setShowLogoutModal(false);
    try {
      await logout();
      console.log("🔴 LOGOUT - Sucesso!");
    } catch (error) {
      console.error("🔴 LOGOUT - Erro:", error);
    }
  };

  const cancelLogout = () => {
    console.log("🔴 LOGOUT - Cancelado");
    setShowLogoutModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#1976d2';
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header customizado removido para eliminar o espaço */}

      <Text style={[styles.welcome, { color: theme.colors.onBackground, marginTop: 16 }]}>
        Bem-vindo, {user?.name || 'Usuário'}!
      </Text>

      {/* Info de Debug */}
      <Text style={[styles.debugInfo, { color: theme.colors.onBackground }]}>
        📊 Total de motos: {state.motorcycles.length} | Estado: {refreshing ? "Carregando..." : "OK"}
      </Text>

      {/* Content */}
      {refreshing ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
          <Text style={[{ color: theme.colors.onBackground, textAlign: 'center', marginTop: 16, fontSize: 16 }]}>
            Carregando...
          </Text>
        </View>
      ) : state.motorcycles.length === 0 ? (
        <ScrollView contentContainerStyle={styles.empty}>
          <Text style={[styles.emptyText, { color: theme.colors.onBackground }]}>Nenhuma moto cadastrada</Text>
          <Text style={[styles.emptySubText, { color: theme.colors.onSurfaceVariant }]}>Toque em + para adicionar</Text>
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
      
      {/* Modal de Confirmação de Logout */}
      <Portal>
        <Dialog visible={showLogoutModal} onDismiss={cancelLogout}>
          <Dialog.Title>Confirmação de Logout</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Deseja realmente sair do aplicativo?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={cancelLogout}>Cancelar</Button>
            <Button 
              mode="contained" 
              onPress={confirmLogout}
              buttonColor={theme.colors.error}
              style={{ marginLeft: 8 }}
            >
              Sair
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
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
    paddingTop: 0,
    marginTop: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    elevation: 0,
    shadowOpacity: 0,
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderBottomWidth: 0,
  },
  headerLeft: {
    flex: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  welcome: {
    fontSize: 18,
    textAlign: 'center',
    padding: 16,
    fontWeight: '600',
  },
  debugInfo: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    marginBottom: 12,
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
