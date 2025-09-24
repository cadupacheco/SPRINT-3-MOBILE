import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Text,
  Card,
  Title,
  Paragraph,
  Button,
  Divider,
  ProgressBar,
  useTheme,
  ActivityIndicator,
  Snackbar,
} from "react-native-paper";
import {
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AuthNavigator";
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
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const theme = useTheme();

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

    try {
      setActionLoading(true);
      await actions.updateMotorcycleById(motorcycle.id, { status: newStatus });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = () => {
    if (motorcycle) {
      navigation.navigate("AddMotorcycle", { motorcycle });
    }
  };

  const handleDelete = async () => {
    if (!motorcycle) {
      setSnackbarMessage("Erro: Moto não encontrada!");
      setSnackbarVisible(true);
      return;
    }
    
    try {
      setActionLoading(true);
      console.log("🔴 DELETE - Excluindo moto:", motorcycle.plate, motorcycle.id);
      
      await actions.deleteMotorcycleById(motorcycle.id);
      
      setSnackbarMessage("✅ Moto excluída com sucesso!");
      setSnackbarVisible(true);
      
      // Voltar para Dashboard após 1 segundo
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });
      }, 1000);
      
    } catch (error) {
      console.error("🔴 DELETE - Erro:", error);
      setSnackbarMessage("❌ Erro ao excluir moto");
      setSnackbarVisible(true);
    } finally {
      setActionLoading(false);
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'available': return styles.statusAvailable;
      case 'rented': return styles.statusRented;
      case 'maintenance': return styles.statusMaintenance;
      case 'out_of_service': return styles.statusOutOfService;
      default: return styles.statusAvailable;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!motorcycle) {
    return (
      <View style={styles.container}>
        <Text>Moto não encontrada</Text>
        <Button onPress={() => navigation.goBack()}>
          Voltar
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Informações da Moto */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>{motorcycle.model}</Title>
          <Text style={styles.plate}>Placa: {motorcycle.plate}</Text>

          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Status:</Text>
            <Text style={[styles.statusText, getStatusStyle(motorcycle.status)]}>
              {getStatusText(motorcycle.status)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Localização */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Localização</Title>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Coordenadas:</Text>
            <Text style={styles.infoValue}>
              {motorcycle.location.x}, {motorcycle.location.y}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Informações Técnicas */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Informações Técnicas</Title>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Bateria:</Text>
            <Text style={styles.infoValue}>{motorcycle.batteryLevel}%</Text>
          </View>
          <ProgressBar 
            progress={motorcycle.batteryLevel / 100} 
            color="#1976d2" 
            style={styles.progressBar} 
          />

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Combustível:</Text>
            <Text style={styles.infoValue}>{motorcycle.fuelLevel}%</Text>
          </View>
          <ProgressBar 
            progress={motorcycle.fuelLevel / 100} 
            color="#FF9800" 
            style={styles.progressBar} 
          />

          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Quilometragem:</Text>
            <Text style={styles.infoValue}>{motorcycle.mileage} km</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Próxima Manutenção:</Text>
            <Text style={styles.infoValue}>{motorcycle.nextMaintenanceDate}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Filial:</Text>
            <Text style={styles.infoValue}>{motorcycle.assignedBranch}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Alterar Status */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Alterar Status</Title>
          
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

      {/* Botões de ação */}
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
          disabled={actionLoading}
        >
          Excluir
        </Button>
      </View>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}>
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
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
  statusAvailable: { backgroundColor: "#e3f2fd", color: "#1976d2" },
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
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: "bold" },
  progressBar: { height: 8, borderRadius: 4, marginBottom: 16 },
  divider: { marginVertical: 12 },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statusButton: { flex: 1, marginHorizontal: 4 },
  availableButton: { backgroundColor: "#1976d2" },
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