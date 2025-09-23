// src/screens/MotorcycleListScreen.tsx
import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import api from "../api/api";

interface Motorcycle {
  id: number;
  model: string;
  plate: string;
  status: string;
}

export default function MotorcycleListScreen({ navigation }: any) {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);

  const loadMotorcycles = async () => {
    const response = await api.get("/motorcycles");
    setMotorcycles(response.data);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadMotorcycles);
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <FlatList
        data={motorcycles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => navigation.navigate("MotorcycleDetails", { id: item.id })}>
            <Card.Title title={item.model} subtitle={`Placa: ${item.plate}`} />
            <Card.Content>
              <Text>Status: {item.status}</Text>
            </Card.Content>
          </Card>
        )}
      />

      <Button mode="contained" style={styles.addButton} onPress={() => navigation.navigate("MotorcycleForm")}>
        + Adicionar Moto
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { marginBottom: 12 },
  addButton: { marginTop: 12 },
});
