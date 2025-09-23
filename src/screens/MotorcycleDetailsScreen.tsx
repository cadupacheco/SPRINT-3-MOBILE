import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import {
  Text,
  Card,
  Title,
  Paragraph,
  Button,
  Divider,
  ProgressBar,
} from "react-native-paper";
import {
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useMotorcycles } from "../context/MotorcycleContext";
import LoadingSpinner from "../components/LoadingSpinner";

type MotorcycleDetailsRouteProp = RouteProp<
  RootStackParamList,
  "MotorcycleDetails"
>;
type MotorcycleDetailsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MotorcycleDetails"
>;

export default function MotorcycleDetailsScreen() {
  const route = useRoute<MotorcycleDetailsRouteProp>();
  const navigation = useNavigation<MotorcycleDetailsNavigationProp>();
  const { id } = route.params;

  const { state, actions } = useMotorcycles();
  const [loading, setLoading] = useState(true);

  // Encontrar a moto pelo ID
  const motorcycle = state.motorcycles.find((m) => m.id === id);

  useEffect(() => {
    if (state.motorcycles.length > 0) {
      setLoading(false);
    }
  }, [state.motorcycles]);

  const handleStatusChange = async (
    newStatus: "available" | "maintenance" | "rented" | "out_of_service"
  ) => {
    if (!motorcycle) return;

    const success = await actions.updateMotorcycleById(id, {
      status: newStatus,
    });

    if (success) {
      Alert.alert("Sucesso", "Status da moto atualizado com sucesso!");
    } else {
      Alert.alert("Erro", "Não foi possível atualizar o status da moto.");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Confirmar exclusão",
      "Deseja realmente excluir esta moto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            const success = await actions.deleteMotorcycleById(id);
            if (success) {
              Alert.alert("Sucesso", "Moto excluída com sucesso!");
              navigation.navigate("Dashboard");
            } else {
              Alert.alert("Erro", "Não foi possível excluir a moto.");
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    navigation.navigate("AddMotorcycle", { motorcycle });
  };

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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "available":
        return styles.statusAvailable;
      case "maintenance":
        return styles.statusMaintenance;
      case "rented":
        return styles.statusRented;
      case "out_of_service":
        return styles.statusOutOfService;
      default:
        return {};
    }
  };

  if (loading) {
    return <LoadingSpinner message="Carregando detalhes da moto..." />;
  }

  if (!motorcycle) {
    return (
      <View style={styles.container}>
        <Text>Moto não encontrada</Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.button}
        >
          Voltar
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>{motorcycle.model}</Title>
          <Paragraph style={styles.plate}>
            Placa: {motorcycle.plate}
          </Paragraph>

          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Status atual:</Text>
            <Text
              style={[
                styles.statusText,
                getStatusStyle(motorcycle.status),
              ]}
            >
              {getStatusText(motorcycle.status)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Informações Técnicas</Title>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nível de Bateria:</Text>
            <Text style={styles.infoValue}>
              {motorcycle.batteryLevel}%
            </Text>
          </View>
          <ProgressBar
            progress={motorcycle.batteryLevel / 100}
            color={
              motorcycle.batteryLevel > 50
                ? "#4CAF50"
                : motorcycle.batteryLevel > 20
                ? "#FF9800"
                : "#F44336"
            }
            style={styles.progressBar}
          />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nível de Combustível:</Text>
            <Text style={styles.infoValue}>
              {motorcycle.fuelLevel}%
            </Text>
          </View>
          <ProgressBar
            progress={motorcycle.fuelLevel / 100}
            color={
              motorcycle.fuelLevel > 50
                ? "#4CAF50"
                : motorcycle.fuelLevel > 20
                ? "#FF9800"
                : "#F44336"
            }
            style={styles.progressBar}
          />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Quilometragem:</Text>
            <Text style={styles.infoValue}>
              {motorcycle.mileage?.toLocaleString() || "N/A"} km
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Localização no Pátio:</Text>
            <Text style={styles.infoValue}>
              X: {motorcycle.location.x}, Y: {motorcycle.location.y}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Filial:</Text>
            <Text style={styles.infoValue}>
              {motorcycle.assignedBranch || "Não informado"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Última Atualização:</Text>
            <Text style={styles.infoValue}>
              {motorcycle.lastUpdate
                ? new Date(motorcycle.lastUpdate).toLocaleString("pt-BR")
                : "N/A"}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Alterar Status</Title>
          <Divider style={styles.divider} />

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => handleStatusChange("available")}
              style={[styles.statusButton, styles.availableButton]}
              disabled={motorcycle.status === "available"}
            >
              Disponível
            </Button>

            <Button
              mode="contained"
              onPress={() => handleStatusChange("maintenance")}
              style={[styles.statusButton, styles.maintenanceButton]}
              disabled={motorcycle.status === "maintenance"}
            >
              Manutenção
            </Button>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => handleStatusChange("rented")}
              style={[styles.statusButton, styles.rentedButton]}
              disabled={motorcycle.status === "rented"}
            >
              Alugada
            </Button>

            <Button
              mode="contained"
              onPress={() => handleStatusChange("out_of_service")}
              style={[styles.statusButton, styles.outOfServiceButton]}
              disabled={motorcycle.status === "out_of_service"}
            >
              Fora de Serviço
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Botões de Ação */}
      <View style={styles.bottomButtons}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.button}
          icon="arrow-left"
        >
          Voltar
        </Button>

        <Button
          mode="contained"
          onPress={handleEdit}
          style={styles.button}
          icon="pencil"
        >
          Editar
        </Button>

        <Button
          mode="contained"
          onPress={handleDelete}
          style={[styles.button, { backgroundColor: "#d32f2f" }]}
          icon="delete"
        >
          Excluir
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  card: { marginBottom: 16, elevation: 2 },
  title: { fontSize: 24 },
  plate: { fontSize: 16, marginTop: 4 },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  statusLabel: { fontSize: 16, marginRight: 8 },
  statusText: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 14,
    fontWeight: "bold",
  },
  statusAvailable: { backgroundColor: "#e6f7e6", color: "#2e7d32" },
  statusMaintenance: { backgroundColor: "#fff3e0", color: "#ef6c00" },
  statusRented: { backgroundColor: "#e3f2fd", color: "#1565c0" },
  statusOutOfService: { backgroundColor: "#ffebee", color: "#d32f2f" },
  sectionTitle: { fontSize: 18, marginBottom: 12 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    marginTop: 8,
  },
  infoLabel: { fontSize: 14, color: "#555" },
  infoValue: { fontSize: 14, fontWeight: "bold" },
  progressBar: { height: 8, borderRadius: 4, marginBottom: 16 },
  divider: { marginVertical: 12 },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statusButton: { flex: 1, marginHorizontal: 4 },
  availableButton: { backgroundColor: "#2e7d32" },
  maintenanceButton: { backgroundColor: "#ef6c00" },
  rentedButton: { backgroundColor: "#1565c0" },
  outOfServiceButton: { backgroundColor: "#d32f2f" },
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 24,
  },
  button: { flex: 1, marginHorizontal: 4 },
});
