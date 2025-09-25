// src/screens/RegisterScreen.tsx
import React, { useState } from "react";
import { View } from "react-native";
import { TextInput, Button, Text, useTheme } from "react-native-paper";
import { useAuth } from "../context/AuthContext";
import { styles as componentStyles } from '../styles/screens/RegisterScreen.styles';

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
    <View style={[componentStyles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[componentStyles.title, { color: theme.colors.onBackground }]}>Cadastro</Text>

      <TextInput label="Nome" value={name} onChangeText={setName} style={componentStyles.input} />
      <TextInput label="Email" value={email} onChangeText={setEmail} style={componentStyles.input} />
      <TextInput 
        label="Senha" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry={!showPassword}
        style={componentStyles.input}
        right={
          <TextInput.Icon 
            icon={showPassword ? "eye-off" : "eye"} 
            onPress={() => setShowPassword(!showPassword)}
          />
        }
      />

      {error ? <Text style={[componentStyles.error, { color: theme.colors.error }]}>{error}</Text> : null}

      <Button mode="contained" onPress={handleRegister} loading={loading} style={componentStyles.button}>
        Cadastrar
      </Button>
    </View>
  );
}
