import React, { useState, useEffect } from 'react';
import { View, Alert, ScrollView } from 'react-native';
import { Text, Switch, Button, Divider, List, useTheme as usePaperTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import Copyright from "../components/Copyright";
import { styles as componentStyles } from '../styles/screens/SettingsScreen.styles';

interface Settings {
  notifications: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

export default function SettingsScreen() {
  const { isDarkTheme, toggleTheme } = useTheme();
  const theme = usePaperTheme();
  const [settings, setSettings] = useState<Settings>({
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
    <ScrollView style={[componentStyles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[componentStyles.title, { color: theme.colors.onBackground }]}>Configurações</Text>
      
      <List.Section>
        <List.Subheader>Aparência</List.Subheader>
        <List.Item
          title="Modo Escuro"
          description="Ativar tema escuro no aplicativo"
          left={props => <List.Icon {...props} icon="theme-light-dark" />}
          right={() => (
            <Switch
              value={isDarkTheme}
              onValueChange={toggleTheme}
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
              <View style={componentStyles.intervalControls}>
                <Button 
                  onPress={() => updateSetting('refreshInterval', Math.max(1, settings.refreshInterval - 1))}
                  disabled={settings.refreshInterval <= 1}
                >
                  -
                </Button>
                <Text style={componentStyles.intervalText}>{settings.refreshInterval}</Text>
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
      
      <View style={[componentStyles.dangerZone, { backgroundColor: theme.colors.errorContainer }]}>
        <Text style={[componentStyles.dangerTitle, { color: theme.colors.error }]}>Zona de Perigo</Text>
        <Button 
          mode="contained" 
          onPress={handleClearData}
          style={componentStyles.dangerButton}
          buttonColor={theme.colors.error}
          icon="delete"
        >
          Limpar Dados de Motos
        </Button>
      </View>
      
      <View style={componentStyles.versionContainer}>
        <Text style={[componentStyles.versionText, { color: theme.colors.onSurfaceVariant }]}>Versão 1.0.0</Text>
        <Text style={[componentStyles.copyrightText, { color: theme.colors.onSurfaceVariant }]}>© 2025 Mottu - Gerenciador de Pátio</Text>
      </View>

      <Copyright />
    </ScrollView>
  );
}
