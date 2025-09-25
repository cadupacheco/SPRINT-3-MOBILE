import React, { useState, useEffect } from "react";
import { View, ScrollView } from "react-native";
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
import Copyright from "../components/Copyright";
import { styles as componentStyles } from '../styles/screens/MotorcycleDetailsScreen.styles';

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
      case 'available': return componentStyles.statusAvailable;
      case 'rented': return componentStyles.statusRented;
      case 'maintenance': return componentStyles.statusMaintenance;
      case 'out_of_service': return componentStyles.statusOutOfService;
      default: return componentStyles.statusAvailable;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!motorcycle) {
    return (
      <View style={componentStyles.container}>
        <Text>Moto não encontrada</Text>
        <Button onPress={() => navigation.goBack()}>
          Voltar
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={[componentStyles.container, { backgroundColor: theme.colors.background }]}>
      {/* Informações da Moto */}
      <Card style={componentStyles.card}>
        <Card.Content>
          <Title style={componentStyles.title}>{motorcycle.model}</Title>
          <Text style={componentStyles.plate}>Placa: {motorcycle.plate}</Text>

          <View style={componentStyles.statusContainer}>
            <Text style={componentStyles.statusLabel}>Status:</Text>
            <Text style={[componentStyles.statusText, getStatusStyle(motorcycle.status)]}>
              {getStatusText(motorcycle.status)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Localização */}
      <Card style={componentStyles.card}>
        <Card.Content>
          <Title style={componentStyles.sectionTitle}>Localização</Title>
          <View style={componentStyles.infoRow}>
            <Text style={[componentStyles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Coordenadas:</Text>
            <Text style={componentStyles.infoValue}>
              {motorcycle.location.x}, {motorcycle.location.y}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Informações Técnicas */}
      <Card style={componentStyles.card}>
        <Card.Content>
          <Title style={componentStyles.sectionTitle}>Informações Técnicas</Title>
          
          <View style={componentStyles.infoRow}>
            <Text style={[componentStyles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Bateria:</Text>
            <Text style={componentStyles.infoValue}>{motorcycle.batteryLevel}%</Text>
          </View>
          <ProgressBar 
            progress={motorcycle.batteryLevel / 100} 
            color="#1976d2" 
            style={componentStyles.progressBar} 
          />

          <View style={componentStyles.infoRow}>
            <Text style={[componentStyles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Combustível:</Text>
            <Text style={componentStyles.infoValue}>{motorcycle.fuelLevel}%</Text>
          </View>
          <ProgressBar 
            progress={motorcycle.fuelLevel / 100} 
            color="#FF9800" 
            style={componentStyles.progressBar} 
          />

          <Divider style={componentStyles.divider} />

          {motorcycle.technicalInfo && (
            <>
              <View style={componentStyles.infoRow}>
                <Text style={[componentStyles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>🔋 Dados Técnicos Editáveis:</Text>
              </View>
              <Text style={[componentStyles.technicalInfoText, { color: theme.colors.onSurface }]}>
                {motorcycle.technicalInfo}
              </Text>
              <Divider style={componentStyles.divider} />
            </>
          )}
        </Card.Content>
      </Card>

      {/* Alterar Status */}
      <Card style={componentStyles.card}>
        <Card.Content>
          <Title style={componentStyles.sectionTitle}>Alterar Status</Title>
          
          <View style={componentStyles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => handleStatusChange("available")}
              style={[componentStyles.statusButton, componentStyles.availableButton]}
              disabled={motorcycle.status === "available"}
            >
              Disponível
            </Button>

            <Button
              mode="contained"
              onPress={() => handleStatusChange("maintenance")}
              style={[componentStyles.statusButton, componentStyles.maintenanceButton]}
              disabled={motorcycle.status === "maintenance"}
            >
              Manutenção
            </Button>
          </View>

          <View style={componentStyles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => handleStatusChange("rented")}
              style={[componentStyles.statusButton, componentStyles.rentedButton]}
              disabled={motorcycle.status === "rented"}
            >
              Alugada
            </Button>

            <Button
              mode="contained"
              onPress={() => handleStatusChange("out_of_service")}
              style={[componentStyles.statusButton, componentStyles.outOfServiceButton]}
              disabled={motorcycle.status === "out_of_service"}
            >
              Fora de Serviço
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Informações Adicionais */}
      <Card style={componentStyles.card}>
        <Card.Content>
          <Title style={componentStyles.sectionTitle}>Informações Adicionais</Title>
          
          <View style={componentStyles.infoRow}>
            <Text style={[componentStyles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Quilometragem:</Text>
            <Text style={componentStyles.infoValue}>{motorcycle.mileage} km</Text>
          </View>
          
          <View style={componentStyles.infoRow}>
            <Text style={[componentStyles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Próxima Manutenção:</Text>
            <Text style={componentStyles.infoValue}>{motorcycle.nextMaintenanceDate}</Text>
          </View>
          
          <View style={componentStyles.infoRow}>
            <Text style={[componentStyles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Filial:</Text>
            <Text style={componentStyles.infoValue}>{motorcycle.assignedBranch}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Botões de ação */}
      <View style={componentStyles.bottomButtons}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={componentStyles.button}
          icon="arrow-left"
        >
          Voltar
        </Button>

        <Button
          mode="contained"
          onPress={handleEdit}
          style={componentStyles.button}
          icon="pencil"
        >
          Editar
        </Button>

        <Button
          mode="contained"
          onPress={handleDelete}
          style={[componentStyles.button, { backgroundColor: "#d32f2f" }]}
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

      <Copyright />
    </ScrollView>
  );
}
