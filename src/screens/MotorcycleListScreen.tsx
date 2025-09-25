// src/screens/MotorcycleListScreen.tsx
import React, { useEffect } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import { Button, Card, Text, IconButton, ActivityIndicator } from "react-native-paper";
import { useMotorcycles } from "../context/MotorcycleContext";
import Copyright from "../components/Copyright";

export default function MotorcycleListScreen({ navigation }: any) {
  const { state, actions } = useMotorcycles();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      actions.loadMotorcycles();
    });
    return unsubscribe;
  }, [navigation]);

  const handleDelete = (id: string, model: string) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir a moto ${model}?`,
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            const success = await actions.deleteMotorcycleById(id);
            if (success) {
              Alert.alert("Sucesso", "Moto excluída com sucesso!");
            } else {
              Alert.alert("Erro", "Não foi possível excluir a moto.");
            }
          }
        }
      ]
    );
  };

  if (state.loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Carregando motocicletas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={state.motorcycles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Title 
              title={item.model} 
              subtitle={`Placa: ${item.plate}`}
              right={(props) => (
                <View style={styles.cardActions}>
                  <IconButton
                    icon="pencil"
                    onPress={() => navigation.navigate("MotorcycleDetails", { id: item.id })}
                  />
                  <IconButton
                    icon="delete"
                    iconColor="#ff4444"
                    onPress={() => handleDelete(item.id, item.model)}
                  />
                </View>
              )}
            />
            <Card.Content>
              <Text>Status: {item.status === 'available' ? 'Disponível' : 
                           item.status === 'maintenance' ? 'Em Manutenção' : 
                           item.status === 'rented' ? 'Alugada' : 'Fora de Serviço'}</Text>
              <Text>Bateria: {item.batteryLevel}%</Text>
              <Text>Combustível: {item.fuelLevel}%</Text>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={() => (
          <View style={styles.centered}>
            <Text>Nenhuma motocicleta encontrada</Text>
          </View>
        )}
      />

      <Button 
        mode="contained" 
        style={styles.addButton} 
        onPress={() => navigation.navigate("AddMotorcycle")}
      >
        + Adicionar Moto
      </Button>

      <Copyright />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16 
  },
  card: { 
    marginBottom: 12 
  },
  addButton: { 
    marginTop: 12,
    marginBottom: 24
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardActions: {
    flexDirection: 'row'
  }
});
