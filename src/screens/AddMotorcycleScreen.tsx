import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { Button, Text, RadioButton, TextInput, ActivityIndicator } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AuthNavigator";
import { useMotorcycles } from "../context/MotorcycleContext";

type AddMotorcycleNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "AddMotorcycle"
>;

export default function AddMotorcycleScreen() {
  const navigation = useNavigation<AddMotorcycleNavigationProp>();
  const { actions, state } = useMotorcycles();

  // Estados do formulário
  const [model, setModel] = useState("");
  const [plate, setPlate] = useState("");
  const [status, setStatus] = useState<
    "available" | "maintenance" | "rented" | "out_of_service"
  >("available");
  const [locationX, setLocationX] = useState("");
  const [locationY, setLocationY] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados de erro
  const [errors, setErrors] = useState({
    model: "",
    plate: "",
    locationX: "",
    locationY: "",
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
    const newErrors = { model: "", plate: "", locationX: "", locationY: "" };

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

      const newMotorcycle = {
        model: model.trim(),
        plate: plate.trim().toUpperCase(),
        status,
        location: {
          x: latitudeDecimal,
          y: longitudeDecimal,
        },
        batteryLevel: Math.floor(Math.random() * 100),
        fuelLevel: Math.floor(Math.random() * 100),
        mileage: Math.floor(Math.random() * 50000),
        nextMaintenanceDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        assignedBranch: "São Paulo Centro",
        lastUpdate: new Date().toISOString(),
      };

      const success = await actions.addMotorcycle(newMotorcycle);

      if (success) {
        Alert.alert("Sucesso", "Moto adicionada com sucesso!", [
          {
            text: "OK",
            onPress: () => {
              // Limpar o formulário
              setModel("");
              setPlate("");
              setStatus("available");
              setLocationX("");
              setLocationY("");
              setErrors({ model: "", plate: "", locationX: "", locationY: "" });
              
              // Navegar para o Dashboard
              navigation.navigate("Dashboard");
            },
          },
        ]);
      } else {
        const errorMessage = state.error || "Não foi possível salvar a moto.";
        Alert.alert("Erro", errorMessage);
      }
    } catch (error) {
      console.error("Erro ao salvar moto:", error);
      Alert.alert("Erro", "Falha ao salvar a moto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Adicionar Nova Moto</Text>

      {/* Modelo */}
      <TextInput
        label="Modelo"
        value={model}
        onChangeText={setModel}
        mode="outlined"
        style={styles.input}
        error={!!errors.model}
        autoComplete="off"
      />
      {errors.model ? <Text style={styles.errorText}>{errors.model}</Text> : null}

      {/* Placa - Exemplo */}
      <View style={styles.exampleContainer}>
        <Text style={styles.exampleTitle}>🚗 Formato da placa:</Text>
        <Text style={styles.exampleText}>• Nova (Mercosul): "ABC1D23"</Text>
        <Text style={styles.exampleText}>• Antiga: "ABC-1234"</Text>
      </View>

      {/* Placa */}
      <TextInput
        label="Placa"
        value={plate}
        onChangeText={setPlate}
        mode="outlined"
        style={styles.input}
        error={!!errors.plate}
        autoCapitalize="characters"
        maxLength={8}
        autoComplete="off"
        placeholder="ABC1D23 ou ABC-1234"
      />
      {errors.plate ? <Text style={styles.errorText}>{errors.plate}</Text> : null}

      {/* Status */}
      <Text style={styles.sectionTitle}>Status</Text>
      <RadioButton.Group
        onValueChange={(value) =>
          setStatus(
            value as "available" | "maintenance" | "rented" | "out_of_service"
          )
        }
        value={status}
      >
        <View style={styles.radioContainer}>
          <RadioButton.Item label="Disponível" value="available" />
          <RadioButton.Item label="Em Manutenção" value="maintenance" />
          <RadioButton.Item label="Alugada" value="rented" />
          <RadioButton.Item label="Fora de Serviço" value="out_of_service" />
        </View>
      </RadioButton.Group>

      {/* Localização */}
      <Text style={styles.sectionTitle}>Localização Geográfica</Text>
      <View style={styles.exampleContainer}>
        <Text style={styles.exampleTitle}>📍 Exemplos de formato:</Text>
        <Text style={styles.exampleText}>• Coordenadas geográficas: "23° 32′ 44″ S"</Text>
        <Text style={styles.exampleText}>• Graus decimais: "-23.5456"</Text>
      </View>
      <View style={styles.locationContainer}>
        <View style={styles.locationInput}>
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
            <Text style={styles.errorText}>{errors.locationX}</Text>
          ) : null}
        </View>

        <View style={styles.locationInput}>
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
            <Text style={styles.errorText}>{errors.locationY}</Text>
          ) : null}
        </View>
      </View>

      {/* Botões */}
      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.button}
          icon="close"
          disabled={loading}
        >
          Cancelar
        </Button>

        <Button
          mode="contained"
          onPress={handleSaveMotorcycle}
          style={styles.button}
          icon="content-save"
          loading={loading}
          disabled={loading}
        >
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </View>

      {loading && <ActivityIndicator animating size="large" />}
    </ScrollView>
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
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontStyle: "italic",
  },
  radioContainer: {
    backgroundColor: "white",
    borderRadius: 8,
  },
  locationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  locationInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  exampleContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
});
