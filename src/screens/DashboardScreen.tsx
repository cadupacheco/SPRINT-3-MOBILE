import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Alert } from "react-native";
import { Button, Text, Card, ActivityIndicator, FAB } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useMotorcycles } from "../context/MotorcycleContext";

type DashboardNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Dashboard"
>;

export default function DashboardScreen() {
  const navigation = useNavigation<DashboardNavigationProp>();
  const { state, actions } = useMotorcycles();

  const [loading, setLoading] = useState(true);

  // Buscar motos ao abrir a tela
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await actions.loadMotorcycles();
      setLoading(false);
    };

    fetchData();
  }, []);

  // Renderização de item
  const renderItem = ({ item }: any) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate("MotorcycleDetails", { id: item.id })}
    >
      <Card.Title title={item.model} subtitle={`Placa: ${item.plate}`} />
      <Card.Content>
        <Text>Status: {item.status}</Text>
        <Text>
          Localização: X {item.location?.x}, Y {item.location?.y}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Motos Cadastradas</Text>

      {loading ? (
        <ActivityIndicator animating size="large" />
      ) : state.motorcycles.length === 0 ? (
        <Text style={styles.emptyText}>Nenhuma moto cadastrada.</Text>
      ) : (
        <FlatList
          data={state.motorcycles}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  card: {
    marginBottom: 12,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
