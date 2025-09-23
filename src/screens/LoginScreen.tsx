// src/screens/LoginScreen.tsx
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    const success = await login(email, password);
    setLoading(false);

    if (!success) {
      setError("Credenciais inválidas!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput label="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput label="Senha" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button mode="contained" onPress={handleLogin} loading={loading} style={styles.button}>
        Entrar
      </Button>

      <Button onPress={() => navigation.navigate("Register")}>Não tem conta? Cadastre-se</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 28, marginBottom: 20, textAlign: "center" },
  input: { marginBottom: 12 },
  button: { marginTop: 16 },
  error: { color: "red", textAlign: "center", marginTop: 8 },
});
