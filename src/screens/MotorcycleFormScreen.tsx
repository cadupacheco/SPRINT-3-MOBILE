// src/screens/MotorcycleFormScreen.tsx
import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import api from "../api/api";

export default function MotorcycleFormScreen({ route, navigation }: any) {
  const { id } = route.params || {};
  const [model, setModel] = useState("");
  const [plate, setPlate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      api.get(`/motorcycles/${id}`).then((res: any) => {
        setModel(res.data.model);
        setPlate(res.data.plate);
      });
    }
  }, [id]);

  const handleSave = async () => {
    setLoading(true);
    if (id) {
      await api.put(`/motorcycles/${id}`, { model, plate });
    } else {
      await api.post("/motorcycles", { model, plate });
    }
    setLoading(false);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{id ? "Editar Moto" : "Cadastrar Moto"}</Text>

      <TextInput label="Modelo" value={model} onChangeText={setModel} style={styles.input} />
      <TextInput label="Placa" value={plate} onChangeText={setPlate} style={styles.input} />

      <Button mode="contained" onPress={handleSave} loading={loading} style={styles.button}>
        {id ? "Atualizar" : "Salvar"}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, marginBottom: 16, textAlign: "center" },
  input: { marginBottom: 12 },
  button: { marginTop: 16 },
});
