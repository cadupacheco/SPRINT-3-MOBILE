import React, { useState, useEffect } from "react";
import { View, ScrollView, Alert } from "react-native";
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

    // Mostrar alerta de confirmação
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir a motocicleta ${motorcycle.model} (${motorcycle.plate})?`,
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(true);
              console.log("🔴 DELETE - Excluindo moto:", motorcycle.plate, motorcycle.id);
              
              // Força recarregar a lista antes de tentar deletar
              await actions.loadMotorcycles();
              
              const success = await actions.deleteMotorcycleById(motorcycle.id);
              console.log("🔴 DELETE - Resultado:", success);
              
              if (success) {
                // Força recarregar novamente após deletar
                await actions.loadMotorcycles();
                
                setSnackbarMessage("✅ Moto excluída com sucesso!");
                setSnackbarVisible(true);
                
                // Voltar para Dashboard imediatamente
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Dashboard' }],
                });
              } else {
                setSnackbarMessage("❌ Erro ao excluir moto - Tente novamente");
                setSnackbarVisible(true);
              }
              
            } catch (error) {
              console.error("🔴 DELETE - Erro:", error);
              setSnackbarMessage("❌ Erro ao excluir moto: " + (error instanceof Error ? error.message : 'Erro desconhecido'));
              setSnackbarVisible(true);
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
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
      {/* Card Principal - Informações básicas da moto */}
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

      {/* Card Informações Técnicas */}
      <Card style={componentStyles.card}>
        <Card.Content style={{ paddingVertical: 12, paddingHorizontal: 16 }}>
          <Title style={componentStyles.sectionTitle}>Nivel da bateria</Title>
          
          {/* Bateria */}
          <View style={componentStyles.infoRow}>
            <Text style={[componentStyles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Bateria:</Text>
            <Text style={componentStyles.infoValue}>{motorcycle.batteryLevel || 0}%</Text>
          </View>
          <ProgressBar 
            progress={(motorcycle.batteryLevel || 0) / 100} 
            color="#42a5f5" 
            style={componentStyles.progressBar} 
          />
        </Card.Content>
      </Card>

      {/* Card Informações Técnicas Detalhadas */}
      <Card style={componentStyles.card}>
        <Card.Content style={{ paddingVertical: 12, paddingHorizontal: 16 }}>
          <Title style={componentStyles.sectionTitle}>Informações Detalhadas</Title>
          
          {/* Coordenadas */}
          <View style={componentStyles.infoRow}>
            <Text style={[componentStyles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Coordenadas:</Text>
            <Text style={componentStyles.infoValue}>
              {motorcycle.location?.x || 0}, {motorcycle.location?.y || 0}
            </Text>
          </View>

          {/* Quilometragem */}
          <View style={componentStyles.infoRow}>
            <Text style={[componentStyles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Quilometragem:</Text>
            <Text style={componentStyles.infoValue}>{motorcycle.mileage || 0} km</Text>
          </View>
          
          {/* Próxima Manutenção */}
          <View style={componentStyles.infoRow}>
            <Text style={[componentStyles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Próxima Manutenção:</Text>
            <Text style={componentStyles.infoValue}>{motorcycle.nextMaintenanceDate || 'Não definida'}</Text>
          </View>
          
          {/* Filial */}
          <View style={componentStyles.infoRow}>
            <Text style={[componentStyles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Filial:</Text>
            <Text style={componentStyles.infoValue}>{motorcycle.assignedBranch || 'Não definida'}</Text>
          </View>

          {/* Dados Técnicos Editáveis */}
          {motorcycle.technicalInfo && (
            <>
              <Divider style={componentStyles.divider} />
              <View style={componentStyles.infoRow}>
                <Text style={[componentStyles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>🔋 Dados Técnicos Editáveis:</Text>
              </View>
              <Text style={[componentStyles.technicalInfoText, { color: theme.colors.onSurface }]}>
                {motorcycle.technicalInfo}
              </Text>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Botões de Status */}
      <View style={componentStyles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => handleStatusChange("available")}
          style={[componentStyles.statusButton, componentStyles.availableButton]}
          labelStyle={{
            color: theme.dark ? 'white' : undefined,
            fontWeight: theme.dark ? 'bold' : 'normal'
          }}
          disabled={motorcycle.status === "available"}
        >
          Disponível
        </Button>

        <Button
          mode="contained"
          onPress={() => handleStatusChange("maintenance")}
          style={[componentStyles.statusButton, componentStyles.maintenanceButton]}
          labelStyle={{
            color: theme.dark ? 'white' : undefined,
            fontWeight: theme.dark ? 'bold' : 'normal'
          }}
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
          labelStyle={{
            color: theme.dark ? 'white' : undefined,
            fontWeight: theme.dark ? 'bold' : 'normal'
          }}
          disabled={motorcycle.status === "rented"}
        >
          Alugada
        </Button>

        <Button
          mode="contained"
          onPress={() => handleStatusChange("out_of_service")}
          style={[componentStyles.statusButton, componentStyles.outOfServiceButton]}
          labelStyle={{
            color: theme.dark ? 'white' : undefined,
            fontWeight: theme.dark ? 'bold' : 'normal'
          }}
          disabled={motorcycle.status === "out_of_service"}
        >
          Fora de Serviço
        </Button>
      </View>

      {/* Botões de Ação */}
      <View style={[componentStyles.bottomButtons, { marginTop: 24, marginBottom: 16 }]}>
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
          labelStyle={{
            color: theme.dark ? 'white' : undefined,
            fontWeight: theme.dark ? 'bold' : 'normal'
          }}
          icon="pencil"
        >
          Editar
        </Button>

        <Button
          mode="contained"
          onPress={handleDelete}
          style={[componentStyles.button, { backgroundColor: "#d32f2f" }]}
          labelStyle={{
            color: theme.dark ? 'white' : undefined,
            fontWeight: theme.dark ? 'bold' : 'normal'
          }}
          icon="delete"
          disabled={actionLoading}
        >
          Excluir
        </Button>
      </View>

      <Copyright />
      
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