import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, Switch, Button, Divider, List } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Settings {
  darkMode: boolean;
  notifications: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>({
    darkMode: false,
    notifications: true,
    autoRefresh: false,
    refreshInterval: 5,
  });

  // Carregar configurações do AsyncStorage ao iniciar
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem('settings');
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    };

    loadSettings();
  }, []);

  // Função para atualizar uma configuração específica
  const updateSetting = async (key: keyof Settings, value: any) => {
    try {
      const updatedSettings = { ...settings, [key]: value };
      setSettings(updatedSettings);
      await AsyncStorage.setItem('settings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    }
  };

  // Função para limpar todos os dados
  const handleClearData = () => {
    Alert.alert(
      'Limpar Dados',
      'Tem certeza que deseja limpar todos os dados de motos? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('motorcycles');
              Alert.alert('Sucesso', 'Todos os dados de motos foram limpos.');
            } catch (error) {
              console.error('Erro ao limpar dados:', error);
              Alert.alert('Erro', 'Não foi possível limpar os dados.');
            }
          }
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Configurações</Text>
      
      <List.Section>
        <List.Subheader>Aparência</List.Subheader>
        <List.Item
          title="Modo Escuro"
          description="Ativar tema escuro no aplicativo"
          left={props => <List.Icon {...props} icon="theme-light-dark" />}
          right={() => (
            <Switch
              value={settings.darkMode}
              onValueChange={(value) => updateSetting('darkMode', value)}
            />
          )}
        />
        
        <Divider />
        
        <List.Subheader>Notificações</List.Subheader>
        <List.Item
          title="Notificações"
          description="Receber alertas sobre alterações no pátio"
          left={props => <List.Icon {...props} icon="bell" />}
          right={() => (
            <Switch
              value={settings.notifications}
              onValueChange={(value) => updateSetting('notifications', value)}
            />
          )}
        />
        
        <Divider />
        
        <List.Subheader>Sincronização</List.Subheader>
        <List.Item
          title="Atualização Automática"
          description="Atualizar dados automaticamente"
          left={props => <List.Icon {...props} icon="sync" />}
          right={() => (
            <Switch
              value={settings.autoRefresh}
              onValueChange={(value) => updateSetting('autoRefresh', value)}
            />
          )}
        />
        
        {settings.autoRefresh && (
          <List.Item
            title="Intervalo de Atualização"
            description={`A cada ${settings.refreshInterval} minutos`}
            left={props => <List.Icon {...props} icon="timer" />}
            right={() => (
              <View style={styles.intervalControls}>
                <Button 
                  onPress={() => updateSetting('refreshInterval', Math.max(1, settings.refreshInterval - 1))}
                  disabled={settings.refreshInterval <= 1}
                >
                  -
                </Button>
                <Text style={styles.intervalText}>{settings.refreshInterval}</Text>
                <Button 
                  onPress={() => updateSetting('refreshInterval', Math.min(30, settings.refreshInterval + 1))}
                  disabled={settings.refreshInterval >= 30}
                >
                  +
                </Button>
              </View>
            )}
          />
        )}
      </List.Section>
      
      <View style={styles.dangerZone}>
        <Text style={styles.dangerTitle}>Zona de Perigo</Text>
        <Button 
          mode="contained" 
          onPress={handleClearData}
          style={styles.dangerButton}
          buttonColor="#d32f2f"
          icon="delete"
        >
          Limpar Dados de Motos
        </Button>
      </View>
      
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Versão 1.0.0</Text>
        <Text style={styles.copyrightText}>© 2025 Mottu - Gerenciador de Pátio</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  intervalControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  intervalText: {
    marginHorizontal: 8,
  },
  dangerZone: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 16,
  },
  dangerButton: {
    backgroundColor: '#d32f2f',
  },
  versionContainer: {
    marginTop: 32,
    marginBottom: 16,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#757575',
  },
  copyrightText: {
    fontSize: 12,
    color: '#9e9e9e',
    marginTop: 4,
  },
});
