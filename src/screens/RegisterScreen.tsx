// src/screens/RegisterScreen.tsx
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Text, useTheme } from "react-native-paper";
import { useAuth } from "../context/AuthContext";

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const theme = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    const success = await register(name, email, password);
    setLoading(false);

    if (success) {
      navigation.navigate("Login");
    } else {
      setError("Erro ao cadastrar. Tente novamente.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>Cadastro</Text>

      <TextInput label="Nome" value={name} onChangeText={setName} style={styles.input} />
      <TextInput label="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput 
        label="Senha" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry={!showPassword}
        style={styles.input}
        right={
          <TextInput.Icon 
            icon={showPassword ? "eye-off" : "eye"} 
            onPress={() => setShowPassword(!showPassword)}
          />
        }
      />

      {error ? <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text> : null}

      <Button mode="contained" onPress={handleRegister} loading={loading} style={styles.button}>
        Cadastrar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 28, marginBottom: 20, textAlign: "center" },
  input: { marginBottom: 12 },
  button: { marginTop: 16 },
  error: { textAlign: "center", marginTop: 8 },
});
