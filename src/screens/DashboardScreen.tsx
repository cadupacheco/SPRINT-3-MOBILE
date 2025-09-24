import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, FlatList, Alert } from "react-native";
import { Button, Text, Card, ActivityIndicator, FAB, Menu, IconButton } from "react-native-paper";
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

  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  // Função para carregar motos
  const loadMotorcyclesData = useCallback(async () => {
    try {
      setLoading(true);
      await actions.loadMotorcycles();
    } catch (error) {
      console.error("Erro ao carregar motos:", error);
    } finally {
      setLoading(false);
    }
  }, [actions]);

  // Buscar motos ao abrir a tela
  useEffect(() => {
    loadMotorcyclesData();
  }, []);

  // Recarregar quando a tela receber foco
  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        loadMotorcyclesData();
      }
    }, [loadMotorcyclesData, loading])
  );

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Deseja realmente sair?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sair", onPress: logout },
      ]
    );
  };

  // Função para traduzir status
  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Disponível";
      case "maintenance":
        return "Em Manutenção";
      case "rented":
        return "Alugada";
      case "out_of_service":
        return "Fora de Serviço";
      default:
        return status;
    }
  };

  // Renderização de item
  const renderItem = ({ item }: any) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate("MotorcycleDetails", { id: item.id })}
    >
      <Card.Title 
        title={item.model} 
        subtitle={`Placa: ${item.plate}`}
      />
      <Card.Content>
        <View style={styles.statusContainer}>
          <Text style={[styles.statusBadge, { 
            backgroundColor: item.status === 'available' ? '#4CAF50' : 
                            item.status === 'rented' ? '#FF9800' : 
                            item.status === 'maintenance' ? '#2196F3' : '#F44336' 
          }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
        <Text style={styles.locationText}>
          📍 Localização: {item.location?.x?.toFixed(4)}, {item.location?.y?.toFixed(4)}
        </Text>
        {item.batteryLevel !== undefined && (
          <Text style={styles.batteryText}>
            🔋 Bateria: {item.batteryLevel}%
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Motos Cadastradas</Text>
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
          <Menu.Item 
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate('Users');
            }} 
            title="Gerenciar Usuários" 
            leadingIcon="account-group"
          />
          <Menu.Item 
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate('Settings');
            }} 
            title="Configurações" 
            leadingIcon="cog"
          />
          <Menu.Item 
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate('Debug');
            }} 
            title="Limpar Dados" 
            leadingIcon="delete"
          />
          <Menu.Item 
            onPress={() => {
              setMenuVisible(false);
              handleLogout();
            }} 
            title="Logout" 
            leadingIcon="logout"
          />
        </Menu>
      </View>

      <Text style={styles.welcomeText}>
        Bem-vindo, {user?.name || 'Usuário'}!
      </Text>

      {loading || state.loading ? (
        <ActivityIndicator animating size="large" style={styles.loader} />
      ) : state.motorcycles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhuma moto cadastrada.</Text>
          <Text style={styles.emptySubText}>Toque no botão "+" para adicionar sua primeira moto</Text>
        </View>
      ) : (
        <FlatList
          data={state.motorcycles}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshing={false}
          onRefresh={loadMotorcyclesData}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      {/* Botão Flutuante para adicionar nova moto */}
      <FAB
        style={styles.fab}
        icon="plus"
        label="Adicionar"
        onPress={() => navigation.navigate("AddMotorcycle")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
    color: "#666",
  },
  card: {
    marginBottom: 12,
  },
  loader: {
    marginTop: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 8,
  },
  emptySubText: {
    textAlign: "center",
    fontSize: 14,
    color: "#999",
    marginBottom: 20,
  },
  statusContainer: {
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  statusBadge: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    textAlign: "center",
    overflow: "hidden",
  },
  locationText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  batteryText: {
    fontSize: 14,
    color: "#666",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
