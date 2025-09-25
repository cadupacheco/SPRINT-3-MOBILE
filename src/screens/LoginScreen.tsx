// src/screens/LoginScreen.tsx
import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { TextInput, Button, Text, useTheme, Card, Chip } from "react-native-paper";
import { useAuth } from "../context/AuthContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Copyright from "../components/Copyright";

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailHistory, setEmailHistory] = useState<string[]>([]);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);

  // Carregar o histórico de emails ao iniciar a tela
  useEffect(() => {
    const loadEmailHistory = async () => {
      try {
        const savedEmails = await AsyncStorage.getItem('emailHistory');
        if (savedEmails) {
          const emailList = JSON.parse(savedEmails);
          console.log('📧 Histórico de emails carregado:', emailList);
          setEmailHistory(emailList);
          
          // Definir o último email usado como padrão
          if (emailList.length > 0) {
            setEmail(emailList[0]); // O primeiro da lista é o mais recente
          }
        }
      } catch (error) {
        console.error('❌ Erro ao carregar histórico de emails:', error);
      }
    };
    loadEmailHistory();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    
    try {
      const success = await login(email, password);
      
      if (success) {
        // Adicionar email ao histórico (apenas se não existir)
        await addEmailToHistory(email);
        console.log('✅ Login bem-sucedido, email adicionado ao histórico:', email);
      } else {
        setError("Credenciais inválidas!");
      }
    } catch (error) {
      setError("Erro ao fazer login!");
      console.error('❌ Erro no login:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEmailToHistory = async (newEmail: string) => {
    try {
      const savedEmails = await AsyncStorage.getItem('emailHistory');
      let emailList: string[] = savedEmails ? JSON.parse(savedEmails) : [];
      
      // Remove o email se já existir (para colocá-lo no topo)
      emailList = emailList.filter(e => e.toLowerCase() !== newEmail.toLowerCase());
      
      // Adiciona no início da lista (mais recente primeiro)
      emailList.unshift(newEmail);
      
      // Limita a 10 emails para não ocupar muito espaço
      emailList = emailList.slice(0, 10);
      
      await AsyncStorage.setItem('emailHistory', JSON.stringify(emailList));
      setEmailHistory(emailList);
      
      console.log('💾 Histórico de emails atualizado:', emailList);
    } catch (error) {
      console.error('❌ Erro ao salvar email no histórico:', error);
    }
  };

  const selectEmailFromHistory = (selectedEmail: string) => {
    setEmail(selectedEmail);
    setShowEmailSuggestions(false);
  };

  // Filtrar emails baseado no que está sendo digitado
  const getFilteredSuggestions = () => {
    if (!email) return emailHistory.slice(0, 5); // Mostra os 5 mais recentes se não há texto
    
    return emailHistory.filter(historicEmail => 
      historicEmail.toLowerCase().includes(email.toLowerCase())
    ).slice(0, 5);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>Login</Text>

      <View style={styles.emailContainer}>
        <TextInput 
          label="Email" 
          value={email} 
          onChangeText={(text) => {
            setEmail(text);
            setShowEmailSuggestions(text.length > 0 && emailHistory.length > 0);
          }}
          onFocus={() => setShowEmailSuggestions(emailHistory.length > 0)}
          onBlur={() => {
            // Delay para permitir clique nas sugestões
            setTimeout(() => setShowEmailSuggestions(false), 200);
          }}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        
        {/* Sugestões de emails */}
        {showEmailSuggestions && getFilteredSuggestions().length > 0 && (
          <Card style={[styles.suggestionsCard, { backgroundColor: theme.colors.surface }]}>
            <ScrollView style={styles.suggestionsContainer} nestedScrollEnabled>
              {getFilteredSuggestions().map((historicEmail, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.suggestionItem, { borderBottomColor: theme.colors.outline }]}
                  onPress={() => selectEmailFromHistory(historicEmail)}
                >
                  <Text style={[styles.suggestionText, { color: theme.colors.onSurface }]}>
                    {historicEmail}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card>
        )}
      </View>

      {/* Chips com emails recentes para acesso rápido */}
      {emailHistory.length > 0 && !showEmailSuggestions && (
        <View style={styles.chipsContainer}>
          <Text style={[styles.chipsLabel, { color: theme.colors.onSurfaceVariant }]}>
            Emails recentes:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {emailHistory.slice(0, 3).map((historicEmail, index) => (
              <Chip
                key={index}
                style={styles.emailChip}
                onPress={() => setEmail(historicEmail)}
                mode="outlined"
              >
                {historicEmail}
              </Chip>
            ))}
          </ScrollView>
        </View>
      )}

      <TextInput 
        label="Senha" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry={!showPassword}
        style={styles.input}
        onSubmitEditing={handleLogin}
        returnKeyType="go"
        right={
          <TextInput.Icon 
            icon={showPassword ? "eye-off" : "eye"} 
            onPress={() => setShowPassword(!showPassword)}
          />
        }
      />

      {error ? <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text> : null}

      <Button mode="contained" onPress={handleLogin} loading={loading} style={styles.button}>
        Entrar
      </Button>

      <Copyright />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 28, marginBottom: 20, textAlign: "center" },
  emailContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  input: { marginBottom: 12 },
  button: { marginTop: 16 },
  error: { textAlign: "center", marginTop: 8 },
  
  // Estilos para sugestões dropdown
  suggestionsCard: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: 150,
    zIndex: 1000,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  suggestionsContainer: {
    maxHeight: 150,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  suggestionText: {
    fontSize: 16,
  },
  
  // Estilos para chips de emails recentes
  chipsContainer: {
    marginBottom: 16,
  },
  chipsLabel: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '500',
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  emailChip: {
    marginRight: 8,
  },
});
