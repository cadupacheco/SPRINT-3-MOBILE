import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { Button, Text, RadioButton, TextInput, ActivityIndicator, Snackbar, Surface, useTheme } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AuthNavigator";
import { useMotorcycles } from "../context/MotorcycleContext";
import Copyright from "../components/Copyright";
import { useTheme as useThemeContext } from "../context/ThemeContext";
import { styles as componentStyles } from "../styles/screens/AddMotorcycleScreen.styles";

type AddMotorcycleNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "AddMotorcycle"
>;

export default function AddMotorcycleScreen() {
  const navigation = useNavigation<AddMotorcycleNavigationProp>();
  const route = useRoute();
  const { actions, state } = useMotorcycles();

  // Verificar se está editando uma moto existente
  const motorcycleToEdit = (route.params as any)?.motorcycle;
  const isEditing = !!motorcycleToEdit;

  // Estados do formulário
  const [model, setModel] = useState("");
  const [plate, setPlate] = useState("");
  const [status, setStatus] = useState<
    "available" | "maintenance" | "rented" | "out_of_service"
  >("available");
  const [locationX, setLocationX] = useState("");
  const [locationY, setLocationY] = useState("");
  const [technicalInfo, setTechnicalInfo] = useState("");
  const [mileage, setMileage] = useState("");
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState("");
  const [assignedBranch, setAssignedBranch] = useState("");
  const [batteryLevel, setBatteryLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Preencher formulário se estiver editando
  useEffect(() => {
    if (isEditing && motorcycleToEdit) {
      setModel(motorcycleToEdit.model || "");
      setPlate(motorcycleToEdit.plate || "");
      setStatus(motorcycleToEdit.status || "available");
      setLocationX(motorcycleToEdit.location?.x?.toString() || "");
      setLocationY(motorcycleToEdit.location?.y?.toString() || "");
      setTechnicalInfo(motorcycleToEdit.technicalInfo || "");
      setMileage(motorcycleToEdit.mileage?.toString() || "");
      setNextMaintenanceDate(motorcycleToEdit.nextMaintenanceDate || "");
      setAssignedBranch(motorcycleToEdit.assignedBranch || "");
      setBatteryLevel(motorcycleToEdit.batteryLevel?.toString() || "");
    }
  }, [isEditing, motorcycleToEdit]);

  // Estados de erro
  const [errors, setErrors] = useState({
    model: "",
    plate: "",
    locationX: "",
    locationY: "",
    mileage: "",
    nextMaintenanceDate: "",
    assignedBranch: "",
    batteryLevel: "",
  });

  // Função para validar placa no formato AAA0A00 (Mercosul) ou ABC-1234 (antigo)
  const validatePlate = (plateValue: string): boolean => {
    // Formato Mercosul: AAA0A00
    const mercosulPattern = /^[A-Z]{3}[0-9]{1}[A-Z]{1}[0-9]{2}$/;
    // Formato antigo: ABC-1234
    const oldPattern = /^[A-Z]{3}-[0-9]{4}$/;
    // Formato antigo sem hífen: ABC1234
    const oldWithoutHyphen = /^[A-Z]{3}[0-9]{4}$/;
    
    return mercosulPattern.test(plateValue) || oldPattern.test(plateValue) || oldWithoutHyphen.test(plateValue);
  };

  // Função para formatar entrada de placa enquanto digita
  const formatPlateInput = (text: string): string => {
    // Remove caracteres especiais exceto hífen
    const cleaned = text.replace(/[^A-Za-z0-9-]/g, '').toUpperCase();
    
    // Se contém hífen, formato antigo ABC-1234
    if (cleaned.includes('-')) {
      const parts = cleaned.split('-');
      let formatted = parts[0].substring(0, 3);
      if (parts[1]) {
        formatted += '-' + parts[1].substring(0, 4);
      }
      return formatted;
    }
    
    // Formato Mercosul AAA0A00
    return cleaned.substring(0, 7);
  };

  // Função para converter coordenadas geográficas em graus decimais
  const parseCoordinate = (coord: string): number | null => {
    try {
      // Regex para capturar graus, minutos, segundos e direção
      const regex = /(\d+)°\s*(\d+)′\s*(\d+)″\s*([NSEO])/;
      const match = coord.trim().match(regex);
      
      if (!match) {
        // Se não for formato geográfico, tenta como número decimal
        const decimal = parseFloat(coord.trim());
        return isNaN(decimal) ? null : decimal;
      }

      const [, degrees, minutes, seconds, direction] = match;
      
      let decimal = parseInt(degrees) + parseInt(minutes)/60 + parseInt(seconds)/3600;
      
      // Aplicar sinal negativo para Sul e Oeste
      if (direction === 'S' || direction === 'O') {
        decimal = -decimal;
      }
      
      return decimal;
    } catch (error) {
      return null;
    }
  };

  // Função de validação atualizada
  const validateForm = () => {
    let isValid = true;
    const newErrors = { 
      model: "", 
      plate: "", 
      locationX: "", 
      locationY: "",
      mileage: "",
      nextMaintenanceDate: "",
      assignedBranch: "",
      batteryLevel: ""
    };

    if (!model.trim()) {
      newErrors.model = "Modelo é obrigatório";
      isValid = false;
    }

    if (!plate.trim()) {
      newErrors.plate = "Placa é obrigatória";
      isValid = false;
    } else if (!validatePlate(plate)) {
      newErrors.plate = "Formato inválido (ex: ABC1D23)";
      isValid = false;
    }

    if (!locationX.trim()) {
      newErrors.locationX = "Latitude é obrigatória";
      isValid = false;
    } else if (parseCoordinate(locationX) === null) {
      newErrors.locationX = "Formato inválido (ex: 23° 32′ 44″ S ou -23.5456)";
      isValid = false;
    }

    if (!locationY.trim()) {
      newErrors.locationY = "Longitude é obrigatória";
      isValid = false;
    } else if (parseCoordinate(locationY) === null) {
      newErrors.locationY = "Formato inválido (ex: 46° 28′ 26″ O ou -46.4739)";
      isValid = false;
    }

    // Validar quilometragem (opcional, mas se preenchida deve ser número)
    if (mileage.trim() && (isNaN(Number(mileage)) || Number(mileage) < 0)) {
      newErrors.mileage = "Quilometragem deve ser um número válido";
      isValid = false;
    }

    // Validar data de manutenção (opcional, mas se preenchida deve ser data futura)
    if (nextMaintenanceDate.trim()) {
      const maintenanceDate = new Date(nextMaintenanceDate);
      const today = new Date();
      if (isNaN(maintenanceDate.getTime())) {
        newErrors.nextMaintenanceDate = "Data inválida (formato: AAAA-MM-DD)";
        isValid = false;
      } else if (maintenanceDate < today) {
        newErrors.nextMaintenanceDate = "Data deve ser futura";
        isValid = false;
      }
    }

    if (!assignedBranch.trim()) {
      newErrors.assignedBranch = "Filial é obrigatória";
      isValid = false;
    }

    // Validar nível de bateria (opcional, mas se preenchido deve ser entre 0 e 100)
    if (batteryLevel.trim() && (isNaN(Number(batteryLevel)) || Number(batteryLevel) < 0 || Number(batteryLevel) > 100)) {
      newErrors.batteryLevel = "Nível de bateria deve ser entre 0 e 100";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Salvar moto
  const handleSaveMotorcycle = async () => {
    if (!validateForm() || loading) return;

    setLoading(true);

    try {
      // Converter coordenadas para formato decimal
      const latitudeDecimal = parseCoordinate(locationX);
      const longitudeDecimal = parseCoordinate(locationY);

      if (latitudeDecimal === null || longitudeDecimal === null) {
        Alert.alert("Erro", "Coordenadas inválidas");
        setLoading(false);
        return;
      }

      const motorcycleData = {
        model: model.trim(),
        plate: plate.trim().toUpperCase(),
        status,
        location: {
          x: latitudeDecimal,
          y: longitudeDecimal,
        },
        technicalInfo: technicalInfo.trim() || undefined,
        batteryLevel: batteryLevel.trim() ? parseInt(batteryLevel) : (motorcycleToEdit?.batteryLevel || Math.floor(Math.random() * 100)),
        fuelLevel: motorcycleToEdit?.fuelLevel || Math.floor(Math.random() * 100),
        mileage: mileage.trim() ? parseInt(mileage) : (motorcycleToEdit?.mileage || Math.floor(Math.random() * 50000)),
        nextMaintenanceDate: nextMaintenanceDate.trim() || (motorcycleToEdit?.nextMaintenanceDate || new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString()),
        assignedBranch: assignedBranch.trim() || (motorcycleToEdit?.assignedBranch || "São Paulo Centro"),
        lastUpdate: new Date().toISOString(),
      };

      let success = false;
      let errorMessage = "";
      
      if (isEditing) {
        // Atualizar moto existente
        console.log("Editando moto ID:", motorcycleToEdit.id);
        success = await actions.updateMotorcycleById(motorcycleToEdit.id, motorcycleData);
        errorMessage = "Não foi possível atualizar a moto.";
      } else {
        // Criar nova moto
        console.log("Criando nova moto...");
        success = await actions.addMotorcycle(motorcycleData);
        errorMessage = "Não foi possível criar a moto.";
      }

      console.log("Resultado da operação:", success);

      // Aguardar um momento para garantir que o estado seja atualizado
      await new Promise(resolve => setTimeout(resolve, 500));

      if (success) {
        const message = isEditing ? "✅ Moto atualizada com sucesso!" : "✅ Moto adicionada com sucesso!";
        console.log("Mostrando mensagem de sucesso:", message);
        
        // Mostrar snackbar de sucesso
        setSnackbarMessage(message);
        setSnackbarVisible(true);
        
        // Aguardar um pouco antes de navegar
        setTimeout(() => {
          console.log("Navegando para Dashboard após sucesso");
          
          // Limpar o formulário apenas se não estiver editando
          if (!isEditing) {
            setModel("");
            setPlate("");
            setStatus("available");
            setLocationX("");
            setLocationY("");
            setTechnicalInfo("");
            setMileage("");
            setNextMaintenanceDate("");
            setAssignedBranch("");
            setBatteryLevel("");
            setErrors({ 
              model: "", 
              plate: "", 
              locationX: "", 
              locationY: "",
              mileage: "",
              nextMaintenanceDate: "",
              assignedBranch: "",
              batteryLevel: ""
            });
          }
          
          // Navegar para o Dashboard e resetar a stack
          navigation.reset({
            index: 0,
            routes: [{ name: 'Dashboard' }],
          });
        }, 2000); // Aguardar 2 segundos para o usuário ler a mensagem
      } else {
        const errorMessage = "Erro ao salvar a moto";
        const finalErrorMessage = state.error || errorMessage;
        console.log("Mostrando alert de erro:", finalErrorMessage);
        Alert.alert("❌ Erro", finalErrorMessage, [{ text: "OK" }]);
      }
    } catch (error) {
      console.error("Erro ao salvar moto:", error);
      Alert.alert("Erro", "Falha ao salvar a moto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={componentStyles.container} keyboardShouldPersistTaps="handled">
      <Text style={componentStyles.title}>
        {isEditing ? "Editar Moto" : "Adicionar Nova Moto"}
      </Text>

      {/* Modelo */}
      <TextInput
        label="Modelo"
        value={model}
        onChangeText={setModel}
        mode="outlined"
        style={componentStyles.input}
        error={!!errors.model}
        autoComplete="off"
      />
      {errors.model ? <Text style={componentStyles.errorText}>{errors.model}</Text> : null}

      {/* Placa - Exemplo */}
      <View style={componentStyles.exampleContainer}>
        <Text style={componentStyles.exampleTitle}>🚗 Formato da placa:</Text>
        <Text style={componentStyles.exampleText}>• Nova (Mercosul): "ABC1D23"</Text>
        <Text style={componentStyles.exampleText}>• Antiga: "ABC-1234"</Text>
      </View>

      {/* Placa */}
      <TextInput
        label="Placa"
        value={plate}
        onChangeText={setPlate}
        mode="outlined"
        style={componentStyles.input}
        error={!!errors.plate}
        autoCapitalize="characters"
        maxLength={8}
        autoComplete="off"
        placeholder="ABC1D23 ou ABC-1234"
      />
      {errors.plate ? <Text style={componentStyles.errorText}>{errors.plate}</Text> : null}

      {/* Status */}
      <Text style={componentStyles.sectionTitle}>Status</Text>
      <RadioButton.Group
        onValueChange={(value) =>
          setStatus(
            value as "available" | "maintenance" | "rented" | "out_of_service"
          )
        }
        value={status}
      >
        <View style={componentStyles.radioContainer}>
          <RadioButton.Item label="Disponível" value="available" />
          <RadioButton.Item label="Em Manutenção" value="maintenance" />
          <RadioButton.Item label="Alugada" value="rented" />
          <RadioButton.Item label="Fora de Serviço" value="out_of_service" />
        </View>
      </RadioButton.Group>

      {/* Localização */}
      <Text style={componentStyles.sectionTitle}>Localização Geográfica</Text>
      <View style={componentStyles.exampleContainer}>
        <Text style={componentStyles.exampleTitle}>📍 Exemplos de formato:</Text>
        <Text style={componentStyles.exampleText}>• Coordenadas geográficas: "23° 32′ 44″ S"</Text>
        <Text style={componentStyles.exampleText}>• Graus decimais: "-23.5456"</Text>
      </View>
      <View style={componentStyles.locationContainer}>
        <View style={componentStyles.locationInput}>
          <TextInput
            label="Latitude"
            value={locationX}
            onChangeText={setLocationX}
            mode="outlined"
            error={!!errors.locationX}
            autoComplete="off"
            placeholder="Ex: 23° 32′ 44″ S"
          />
          {errors.locationX ? (
            <Text style={componentStyles.errorText}>{errors.locationX}</Text>
          ) : null}
        </View>

        <View style={componentStyles.locationInput}>
          <TextInput
            label="Longitude"
            value={locationY}
            onChangeText={setLocationY}
            mode="outlined"
            error={!!errors.locationY}
            autoComplete="off"
            placeholder="Ex: 46° 28′ 26″ O"
          />
          {errors.locationY ? (
            <Text style={componentStyles.errorText}>{errors.locationY}</Text>
          ) : null}
        </View>
      </View>

      {/* Informações Técnicas */}
      <Text style={componentStyles.sectionTitle}>Informações Técnicas</Text>
      <View style={componentStyles.exampleContainer}>
        <Text style={componentStyles.exampleTitle}>� Dados editáveis:</Text>
        <Text style={componentStyles.exampleText}>• Nível de bateria (ex: Bateria: 85%)</Text>
        <Text style={componentStyles.exampleText}>• Data da última manutenção</Text>
        <Text style={componentStyles.exampleText}>• Observações técnicas importantes</Text>
      </View>
      <TextInput
        label="Informações Técnicas e Bateria (opcional)"
        value={technicalInfo}
        onChangeText={setTechnicalInfo}
        mode="outlined"
        style={componentStyles.input}
        multiline
        numberOfLines={4}
        autoComplete="off"
        placeholder="Ex: Bateria: 85%, Última manutenção: 15/01/2025, Pneus trocados..."
      />

      {/* Nível de Bateria */}
      <TextInput
        label="Nível de Bateria (%)"
        value={batteryLevel}
        onChangeText={setBatteryLevel}
        mode="outlined"
        style={componentStyles.input}
        error={!!errors.batteryLevel}
        keyboardType="numeric"
        autoComplete="off"
        placeholder="Ex: 85"
      />
      {errors.batteryLevel ? <Text style={componentStyles.errorText}>{errors.batteryLevel}</Text> : null}

      {/* Quilometragem */}
      <TextInput
        label="Quilometragem (km)"
        value={mileage}
        onChangeText={setMileage}
        mode="outlined"
        style={componentStyles.input}
        error={!!errors.mileage}
        keyboardType="numeric"
        autoComplete="off"
        placeholder="Ex: 25000"
      />
      {errors.mileage ? <Text style={componentStyles.errorText}>{errors.mileage}</Text> : null}

      {/* Próxima Manutenção */}
      <TextInput
        label="Próxima Manutenção (AAAA-MM-DD)"
        value={nextMaintenanceDate}
        onChangeText={setNextMaintenanceDate}
        mode="outlined"
        style={componentStyles.input}
        error={!!errors.nextMaintenanceDate}
        autoComplete="off"
        placeholder="Ex: 2025-12-15"
      />
      {errors.nextMaintenanceDate ? <Text style={componentStyles.errorText}>{errors.nextMaintenanceDate}</Text> : null}

      {/* Filial */}
      <TextInput
        label="Filial *"
        value={assignedBranch}
        onChangeText={setAssignedBranch}
        mode="outlined"
        style={componentStyles.input}
        error={!!errors.assignedBranch}
        autoComplete="off"
        placeholder="Ex: São Paulo Centro"
      />
      {errors.assignedBranch ? <Text style={componentStyles.errorText}>{errors.assignedBranch}</Text> : null}

      {/* Botões */}
      <View style={componentStyles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={componentStyles.button}
          icon="close"
          disabled={loading}
        >
          Cancelar
        </Button>

        <Button
          mode="contained"
          onPress={handleSaveMotorcycle}
          style={componentStyles.button}
          icon="content-save"
          loading={loading}
          disabled={loading}
        >
          {loading 
            ? (isEditing ? "Atualizando..." : "Salvando...") 
            : (isEditing ? "Atualizar" : "Salvar")
          }
        </Button>
      </View>

      {loading && <ActivityIndicator animating size="large" />}
      
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
