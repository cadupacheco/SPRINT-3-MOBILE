import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
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

  // Função para verificar AsyncStorage
  const checkAsyncStorage = async () => {
    try {
      const stored = await AsyncStorage.getItem('motorcycles');
      const motorcycles = stored ? JSON.parse(stored) : [];
      console.log("VERIFICAÇÃO AsyncStorage - Total motos:", motorcycles.length);
      console.log("VERIFICAÇÃO AsyncStorage - IDs:", motorcycles.map((m: any) => m.id));
      return motorcycles;
    } catch (error) {
      console.error("Erro ao verificar AsyncStorage:", error);
      return [];
    }
  };

  // Encontrar a moto pelo ID
  const motorcycle = state.motorcycles.find((m) => m.id === id);
  
  console.log("🔍 MotorcycleDetailsScreen - ID recebido:", id);
  console.log("🔍 MotorcycleDetailsScreen - Moto encontrada:", motorcycle ? `${motorcycle.plate} (${motorcycle.id})` : "NÃO ENCONTRADA");
  console.log("🔍 MotorcycleDetailsScreen - Total motos no estado:", state.motorcycles.length);
  console.log("🔍 MotorcycleDetailsScreen - IDs disponíveis:", state.motorcycles.map(m => m.id));

  useEffect(() => {
    if (state.motorcycles.length > 0) {
      setLoading(false);
    }
  }, [state.motorcycles]);

  const handleStatusChange = async (
    newStatus: "available" | "maintenance" | "rented" | "out_of_service"
  ) => {
    try {
      setActionLoading(true);
      await actions.updateMotorcycleById(id, { status: newStatus });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível alterar o status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate("AddMotorcycle", { motorcycle });
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
            try {
              setActionLoading(true);
              console.log("=== INICIANDO EXCLUSÃO ===");
              console.log("Tentando deletar moto ID:", id);
              console.log("Dados da moto:", motorcycle);
              
              // Verificar AsyncStorage ANTES
              console.log("=== ANTES DA EXCLUSÃO ===");
              await checkAsyncStorage();
              
              const success = await actions.deleteMotorcycleById(id);
              console.log("Resultado da exclusão:", success);
              
              // Verificar AsyncStorage DEPOIS
              console.log("=== DEPOIS DA EXCLUSÃO ===");
              const motosAposExclusao = await checkAsyncStorage();
              
              if (success) {
                console.log("Exclusão bem-sucedida, recarregando lista...");
                // Garantir que a lista seja recarregada
                await actions.loadMotorcycles();
                
                // Verificar AsyncStorage APÓS RELOAD
                console.log("=== APÓS RELOAD ===");
                await checkAsyncStorage();
                
                // Aguardar um momento para garantir consistência
                await new Promise(resolve => setTimeout(resolve, 500));
                
                console.log("Mostrando mensagem de sucesso...");
                // Mostrar snackbar de sucesso
                setSnackbarMessage("✅ Moto excluída com sucesso!");
                setSnackbarVisible(true);
                
                // Aguardar um pouco antes de navegar
                setTimeout(() => {
                  console.log("Navegando para Dashboard após exclusão");
                  // Resetar navegação para Dashboard
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Dashboard' }],
                  });
                }, 2000);
              } else {
                console.log("Falha na exclusão");
                Alert.alert("❌ Erro", "Não foi possível excluir a moto.", [{ text: "OK" }]);
              }
            } catch (error) {
              console.error("ERRO na exclusão:", error);
              Alert.alert("❌ Erro", "Falha ao comunicar com o storage.", [{ text: "OK" }]);
            } finally {
              console.log("Finalizando operação de exclusão");
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "available":
        return styles.statusAvailable;
      case "maintenance":
        return styles.statusMaintenance;
      case "rented":
        return styles.statusRented;
      default:
        return styles.statusOutOfService;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Disponível";
      case "maintenance":
        return "Manutenção";
      case "rented":
        return "Alugada";
      default:
        return "Fora de Serviço";
    }
  };

  if (loading || !motorcycle) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nível da Bateria:</Text>
            <Text style={styles.infoValue}>{motorcycle.batteryLevel}%</Text>
          </View>
          <ProgressBar
            progress={motorcycle.batteryLevel / 100}
            color="#4caf50"
            style={styles.progressBar}
          />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nível de Combustível:</Text>
            <Text style={styles.infoValue}>{motorcycle.fuelLevel}%</Text>
          </View>
          <ProgressBar
            progress={motorcycle.fuelLevel / 100}
            color="#2196f3"
            style={styles.progressBar}
          />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Quilometragem:</Text>
            <Text style={styles.infoValue}>
              {motorcycle.mileage.toLocaleString("pt-BR")} km
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Próxima Manutenção:</Text>
            <Text style={styles.infoValue}>
              {motorcycle.nextMaintenanceDate
                ? new Date(motorcycle.nextMaintenanceDate).toLocaleDateString("pt-BR")
                : "Não agendada"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Localização:</Text>
            <Text style={styles.infoValue}>
              ({motorcycle.location.x}, {motorcycle.location.y})
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

          {actionLoading ? (
            <ActivityIndicator animating size="large" />
          ) : (
            <View>
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
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Botão de teste de delete */}
      <Button
        mode="outlined"
        onPress={async () => {
          console.log("🧪 TESTE DELETE DETAILS - ID:", id);
          console.log("🧪 TESTE DELETE DETAILS - Moto:", motorcycle);
          try {
            const { deleteMotorcycle } = await import('../utils/storage');
            const result = await deleteMotorcycle(id);
            console.log("🧪 TESTE DELETE DETAILS - Resultado direto:", result);
            
            // Verificar AsyncStorage após delete
            const stored = await AsyncStorage.getItem('motorcycles');
            const motorcycles = stored ? JSON.parse(stored) : [];
            console.log("🧪 TESTE DELETE DETAILS - AsyncStorage após:", motorcycles.length);
            
            setSnackbarMessage(`🧪 Teste direto: ${result ? 'SUCESSO' : 'FALHOU'}`);
            setSnackbarVisible(true);
            
            if (result) {
              await actions.loadMotorcycles();
            }
          } catch (error) {
            console.error("🧪 TESTE DELETE DETAILS - Erro:", error);
          }
        }}
        style={{ margin: 10, backgroundColor: '#FFF3CD', borderColor: '#FFEAA7' }}
      >
        🧪 TESTE DELETE DIRETO
      </Button>

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